use std::{
    collections::VecDeque,
    sync::{Arc, Mutex, MutexGuard},
    thread,
    time::{Duration, Instant},
};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{AppHandle, Emitter, Runtime};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};
use uuid::Uuid;

use crate::ipc::protocol::{
    deserialize_ndjson, Envelope, MessageKind, ProgressPayload, TaskResultPayload,
    EVENT_TASK_CANCEL, EVENT_TASK_COMPLETED, EVENT_TASK_FAILED, EVENT_TASK_PROGRESS,
    EVENT_TASK_STARTED, EVENT_TASK_SUBMIT, EVENT_WORKER_HEARTBEAT, EVENT_WORKER_HELLO,
    EVENT_WORKER_WELCOME, IPC_VERSION, TaskPayload,
};

use super::{
    dispatcher::{SubmitTaskInput, TaskInfo, WorkerDispatcher},
    heartbeat::{HeartbeatCheck, HeartbeatMonitor},
};

const RESTART_BACKOFF_SECONDS: [u64; 6] = [1, 2, 4, 8, 16, 30];
const CIRCUIT_BREAKER_WINDOW: Duration = Duration::from_secs(10 * 60);
const CIRCUIT_BREAKER_MAX_RESTARTS: usize = 5;
const MAX_STDOUT_BUFFER_BYTES: usize = 1024 * 1024;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum WorkerState {
    Starting,
    Ready,
    Busy,
    Unhealthy,
    Stopped,
    CircuitBroken,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkerStatus {
    pub state: WorkerState,
    pub last_heartbeat: Option<String>,
    pub restart_count_10m: usize,
    pub in_flight_tasks: usize,
}

#[derive(Debug)]
pub struct WorkerManager {
    state: WorkerState,
    child: Option<CommandChild>,
    dispatcher: WorkerDispatcher,
    heartbeat: HeartbeatMonitor,
    restart_history: VecDeque<Instant>,
    backoff_step: usize,
    restart_scheduled: bool,
    session_id: u64,
}

pub type SharedWorkerManager = Arc<Mutex<WorkerManager>>;

enum RestartDecision {
    CircuitBroken,
    Delayed { delay: Duration, session_id: u64 },
}

impl WorkerManager {
    pub fn new() -> SharedWorkerManager {
        Arc::new(Mutex::new(Self {
            state: WorkerState::Stopped,
            child: None,
            dispatcher: WorkerDispatcher::new(),
            heartbeat: HeartbeatMonitor::new(Duration::from_secs(2), 3),
            restart_history: VecDeque::new(),
            backoff_step: 0,
            restart_scheduled: false,
            session_id: 0,
        }))
    }

    pub fn get_status(shared: &SharedWorkerManager) -> Result<WorkerStatus, String> {
        let manager = lock(shared)?;
        Ok(manager.status_snapshot())
    }

    pub fn list_tasks(shared: &SharedWorkerManager) -> Result<Vec<TaskInfo>, String> {
        let manager = lock(shared)?;
        Ok(manager.dispatcher.list_tasks())
    }

    pub fn start<R: Runtime + 'static>(
        shared: &SharedWorkerManager,
        app: &AppHandle<R>,
    ) -> Result<(), String> {
        let session_id = {
            let mut m = lock(shared)?;
            if m.state == WorkerState::CircuitBroken {
                return Err("worker circuit breaker is open".into());
            }
            if m.child.is_some() {
                return Ok(());
            }
            m.state = WorkerState::Starting;
            m.session_id = m.session_id.wrapping_add(1);
            m.restart_scheduled = false;
            m.heartbeat.reset();
            m.session_id
        };
        emit_status(app, shared);

        let command = app
            .shell()
            .sidecar("dy-worker")
            .map_err(|e| format!("failed to configure dy-worker sidecar: {e}"))?;

        let (receiver, child) = match command.spawn() {
            Ok(spawned) => spawned,
            Err(e) => {
                {
                    let mut m = lock(shared)?;
                    if m.session_id == session_id {
                        m.state = WorkerState::Stopped;
                    }
                }
                emit_status(app, shared);
                return Err(format!("failed to spawn dy-worker sidecar: {e}"));
            }
        };

        {
            let mut m = lock(shared)?;
            if m.session_id != session_id {
                let _ = child.kill();
                return Ok(());
            }
            m.child = Some(child);
        }

        spawn_event_listener(Arc::clone(shared), app.clone(), receiver, session_id);
        spawn_heartbeat_monitor(Arc::clone(shared), app.clone(), session_id);

        Ok(())
    }

    pub fn stop<R: Runtime>(shared: &SharedWorkerManager, app: &AppHandle<R>) -> Result<(), String> {
        let child = {
            let mut m = lock(shared)?;
            m.session_id = m.session_id.wrapping_add(1);
            m.restart_scheduled = false;
            m.state = WorkerState::Stopped;
            m.heartbeat.reset();
            m.dispatcher.fail_all_in_flight();
            m.child.take()
        };

        if let Some(child) = child {
            let _ = child.kill();
        }

        emit_status(app, shared);
        Ok(())
    }

    pub fn restart<R: Runtime + 'static>(
        shared: &SharedWorkerManager,
        app: &AppHandle<R>,
        reason: &str,
    ) -> Result<(), String> {
        {
            let mut m = lock(shared)?;
            m.restart_scheduled = false;
        }
        let _ = Self::stop(shared, app);
        Self::start(shared, app).map_err(|e| format!("restart failed ({reason}): {e}"))
    }

    pub fn submit_task<R: Runtime + 'static>(
        shared: &SharedWorkerManager,
        app: &AppHandle<R>,
        input: SubmitTaskInput,
    ) -> Result<String, String> {
        if input.task_type.trim().is_empty() {
            return Err("task_type cannot be empty".into());
        }
        if input.project_id.trim().is_empty() {
            return Err("project_id cannot be empty".into());
        }

        // Check if worker needs starting while holding the lock to avoid race
        let need_start = {
            let m = lock(shared)?;
            m.child.is_none()
                && !matches!(m.state, WorkerState::Starting)
        };
        if need_start {
            Self::start(shared, app)?;
        }

        let task_payload = TaskPayload {
            task_id: Uuid::new_v4().to_string(),
            task_type: input.task_type,
            project_id: input.project_id,
            config: input.config,
        };

        let envelope = Envelope::new(
            MessageKind::Command,
            EVENT_TASK_SUBMIT,
            serde_json::to_value(&task_payload)
                .map_err(|e| format!("failed to serialize task payload: {e}"))?,
        );

        {
            let mut m = lock(shared)?;
            write_envelope(&mut m, &envelope)?;
            m.dispatcher.register_submission(&task_payload);
            m.state = WorkerState::Busy;
        }

        emit_status(app, shared);
        Ok(task_payload.task_id)
    }

    pub fn cancel_task<R: Runtime>(
        shared: &SharedWorkerManager,
        app: &AppHandle<R>,
        task_id: &str,
    ) -> Result<bool, String> {
        if task_id.trim().is_empty() {
            return Err("task_id cannot be empty".into());
        }

        let cancelled = {
            let mut m = lock(shared)?;
            if !m.dispatcher.contains_task(task_id) {
                return Ok(false);
            }

            let envelope = Envelope::new(
                MessageKind::Command,
                EVENT_TASK_CANCEL,
                json!({ "task_id": task_id }),
            );
            write_envelope(&mut m, &envelope)?;
            m.dispatcher.cancel_task(task_id);

            if m.dispatcher.in_flight_count() == 0 {
                m.state = WorkerState::Ready;
            }
            true
        };

        emit_status(app, shared);
        Ok(cancelled)
    }
}

// --- Internal helpers ---

impl WorkerManager {
    fn status_snapshot(&self) -> WorkerStatus {
        let last_heartbeat = self
            .heartbeat
            .last_heartbeat()
            .map(|ts| DateTime::<Utc>::from(ts).to_rfc3339());

        WorkerStatus {
            state: self.state.clone(),
            last_heartbeat,
            restart_count_10m: self.restart_history.len(),
            in_flight_tasks: self.dispatcher.in_flight_count(),
        }
    }

    fn next_backoff_delay(&mut self) -> Duration {
        let idx = self.backoff_step.min(RESTART_BACKOFF_SECONDS.len() - 1);
        self.backoff_step = (self.backoff_step + 1).min(RESTART_BACKOFF_SECONDS.len() - 1);
        Duration::from_secs(RESTART_BACKOFF_SECONDS[idx])
    }

    fn track_restart_and_check_breaker(&mut self) -> bool {
        let now = Instant::now();
        self.restart_history.push_back(now);
        while self
            .restart_history
            .front()
            .is_some_and(|ts| now.duration_since(*ts) > CIRCUIT_BREAKER_WINDOW)
        {
            self.restart_history.pop_front();
        }
        self.restart_history.len() > CIRCUIT_BREAKER_MAX_RESTARTS
    }

    fn mark_ready(&mut self) {
        self.restart_scheduled = false;
        self.backoff_step = 0;
        self.state = if self.dispatcher.in_flight_count() > 0 {
            WorkerState::Busy
        } else {
            WorkerState::Ready
        };
    }
}

fn lock(shared: &SharedWorkerManager) -> Result<MutexGuard<'_, WorkerManager>, String> {
    shared
        .lock()
        .map_err(|e| format!("worker manager lock poisoned: {e}"))
}

fn write_envelope(manager: &mut WorkerManager, envelope: &Envelope) -> Result<(), String> {
    let child = manager
        .child
        .as_mut()
        .ok_or_else(|| "worker sidecar is not running".to_string())?;

    let line = envelope
        .to_ndjson_line()
        .map_err(|e| format!("failed to encode IPC envelope: {e}"))?;

    child
        .write(line.as_bytes())
        .map_err(|e| format!("failed to write to worker stdin: {e}"))
}

fn emit_status<R: Runtime>(app: &AppHandle<R>, shared: &SharedWorkerManager) {
    if let Ok(m) = lock(shared) {
        let _ = app.emit("worker:status", m.status_snapshot());
    }
}

fn send_to_worker(shared: &SharedWorkerManager, envelope: &Envelope) -> Result<(), String> {
    let mut m = lock(shared)?;
    write_envelope(&mut m, envelope)
}

fn spawn_event_listener<R: Runtime + 'static>(
    shared: SharedWorkerManager,
    app: AppHandle<R>,
    mut receiver: tauri::async_runtime::Receiver<CommandEvent>,
    session_id: u64,
) {
    thread::spawn(move || {
        let mut stdout_buffer = String::new();
        let mut restart_reason: Option<String> = None;

        loop {
            let event = tauri::async_runtime::block_on(receiver.recv());
            let Some(event) = event else { break };

            if !is_session_active(&shared, session_id) {
                return;
            }

            match event {
                CommandEvent::Stdout(bytes) => {
                    stdout_buffer.push_str(&String::from_utf8_lossy(&bytes));
                    if stdout_buffer.len() > MAX_STDOUT_BUFFER_BYTES {
                        restart_reason = Some(format!(
                            "worker stdout exceeded {} bytes without complete NDJSON frames",
                            MAX_STDOUT_BUFFER_BYTES
                        ));
                        break;
                    }
                    if let Err(err) = drain_stdout(&shared, &app, session_id, &mut stdout_buffer) {
                        restart_reason = Some(err);
                        break;
                    }
                }
                CommandEvent::Stderr(bytes) => {
                    let msg = String::from_utf8_lossy(&bytes);
                    eprintln!("[dy-worker stderr] {}", msg.trim());
                }
                CommandEvent::Error(error) => {
                    restart_reason = Some(format!("worker error: {error}"));
                    break;
                }
                CommandEvent::Terminated(payload) => {
                    restart_reason = Some(format!(
                        "worker exited with code {:?}, signal {:?}",
                        payload.code, payload.signal
                    ));
                    break;
                }
                _ => {}
            }
        }

        // Process any trailing data in buffer
        let trailing = stdout_buffer.trim();
        if !trailing.is_empty() {
            match deserialize_ndjson(&format!("{trailing}\n")) {
                Ok(messages) => {
                    for msg in messages {
                        handle_envelope(&shared, &app, session_id, msg);
                    }
                }
                Err(err) => {
                    restart_reason
                        .get_or_insert_with(|| format!("invalid trailing NDJSON from worker: {err}"));
                }
            }
        }

        if mark_unhealthy(&shared, session_id) {
            emit_status(&app, &shared);
            let reason = restart_reason.unwrap_or_else(|| "worker stream closed".into());
            schedule_restart(shared, app, reason);
        }
    });
}

fn spawn_heartbeat_monitor<R: Runtime + 'static>(
    shared: SharedWorkerManager,
    app: AppHandle<R>,
    session_id: u64,
) {
    thread::spawn(move || loop {
        let interval = {
            let m = match lock(&shared) {
                Ok(m) => m,
                Err(_) => return,
            };
            if m.session_id != session_id {
                return;
            }
            m.heartbeat.interval()
        };

        thread::sleep(interval);

        let mut should_restart = false;
        {
            let mut m = match lock(&shared) {
                Ok(m) => m,
                Err(_) => return,
            };
            if m.session_id != session_id {
                return;
            }
            if matches!(m.state, WorkerState::Stopped | WorkerState::CircuitBroken) {
                return;
            }
            if m.heartbeat.check() == HeartbeatCheck::Unhealthy {
                m.state = WorkerState::Unhealthy;
                should_restart = true;
            }
        }

        if should_restart {
            emit_status(&app, &shared);
            schedule_restart(Arc::clone(&shared), app.clone(), "heartbeat timeout".into());
            return;
        }
    });
}

fn drain_stdout<R: Runtime + 'static>(
    shared: &SharedWorkerManager,
    app: &AppHandle<R>,
    session_id: u64,
    buffer: &mut String,
) -> Result<(), String> {
    while let Some(newline_idx) = buffer.find('\n') {
        let remainder = buffer.split_off(newline_idx + 1);
        let line = buffer.trim().to_owned();
        *buffer = remainder;

        if line.is_empty() {
            continue;
        }

        match deserialize_ndjson(&format!("{line}\n")) {
            Ok(messages) => {
                for msg in messages {
                    handle_envelope(shared, app, session_id, msg);
                }
            }
            Err(err) => {
                return Err(format!("invalid NDJSON frame from worker: {err}"));
            }
        }
    }
    Ok(())
}

fn handle_envelope<R: Runtime + 'static>(
    shared: &SharedWorkerManager,
    app: &AppHandle<R>,
    session_id: u64,
    envelope: Envelope,
) {
    if envelope.v != IPC_VERSION {
        schedule_restart(
            Arc::clone(shared),
            app.clone(),
            format!("unsupported IPC version from worker: {}", envelope.v),
        );
        return;
    }

    let mut status_changed = false;
    let mut progress_event: Option<TaskInfo> = None;
    let mut completed_event: Option<TaskInfo> = None;
    let mut failed_event: Option<TaskInfo> = None;
    let mut welcome_reply: Option<Envelope> = None;
    let mut restart_reason: Option<String> = None;

    {
        let mut m = match lock(shared) {
            Ok(m) => m,
            Err(_) => return,
        };

        if m.session_id != session_id {
            return;
        }

        match envelope.event.as_str() {
            EVENT_WORKER_HELLO => {
                m.heartbeat.mark_heartbeat();
                m.mark_ready();
                status_changed = true;
                welcome_reply = Some(Envelope::new(
                    MessageKind::Ack,
                    EVENT_WORKER_WELCOME,
                    json!({ "accepted": true }),
                ));
            }
            EVENT_WORKER_HEARTBEAT => {
                m.heartbeat.mark_heartbeat();
                m.mark_ready();
                status_changed = true;
            }
            EVENT_TASK_STARTED => {
                if let Some(task_id) = envelope.payload.get("task_id").and_then(|id| id.as_str()) {
                    progress_event = m.dispatcher.mark_started(task_id);
                }
                m.state = WorkerState::Busy;
                status_changed = true;
            }
            EVENT_TASK_PROGRESS => {
                match serde_json::from_value::<ProgressPayload>(envelope.payload.clone()) {
                    Ok(payload) => {
                        progress_event = m.dispatcher.apply_progress(payload);
                        m.state = WorkerState::Busy;
                        status_changed = true;
                    }
                    Err(err) => {
                        restart_reason = Some(format!("invalid task.progress payload: {err}"));
                    }
                }
            }
            EVENT_TASK_COMPLETED | EVENT_TASK_FAILED => {
                match serde_json::from_value::<TaskResultPayload>(envelope.payload.clone()) {
                    Ok(payload) => {
                        let is_failure = envelope.event == EVENT_TASK_FAILED
                            || payload.error.is_some();
                        let info = m.dispatcher.apply_result(payload);
                        if is_failure {
                            failed_event = info;
                        } else {
                            completed_event = info;
                        }
                        m.mark_ready();
                        status_changed = true;
                    }
                    Err(err) => {
                        restart_reason = Some(format!("invalid task result payload: {err}"));
                    }
                }
            }
            _ if envelope.kind == MessageKind::Error => {
                restart_reason = Some(format!("worker error event: {}", envelope.event));
            }
            _ => {}
        }
    }

    if let Some(reply) = welcome_reply {
        let _ = send_to_worker(shared, &reply);
    }
    if status_changed {
        emit_status(app, shared);
    }
    if let Some(payload) = progress_event {
        let _ = app.emit("task:progress", payload);
    }
    if let Some(payload) = completed_event {
        let _ = app.emit("task:completed", payload);
    }
    if let Some(payload) = failed_event {
        let _ = app.emit("task:failed", payload);
    }
    if let Some(reason) = restart_reason {
        schedule_restart(Arc::clone(shared), app.clone(), reason);
    }
}

fn schedule_restart<R: Runtime + 'static>(
    shared: SharedWorkerManager,
    app: AppHandle<R>,
    reason: String,
) {
    let decision = {
        let mut m = match lock(&shared) {
            Ok(m) => m,
            Err(_) => return,
        };

        if m.restart_scheduled
            || matches!(m.state, WorkerState::Stopped | WorkerState::CircuitBroken)
        {
            return;
        }

        if m.track_restart_and_check_breaker() {
            m.state = WorkerState::CircuitBroken;
            m.restart_scheduled = false;
            RestartDecision::CircuitBroken
        } else {
            m.state = WorkerState::Unhealthy;
            m.restart_scheduled = true;
            RestartDecision::Delayed {
                delay: m.next_backoff_delay(),
                session_id: m.session_id,
            }
        }
    };

    emit_status(&app, &shared);

    if let RestartDecision::Delayed { delay, session_id } = decision {
        thread::spawn(move || {
            thread::sleep(delay);
            let should_restart = {
                let mut m = match lock(&shared) {
                    Ok(m) => m,
                    Err(_) => return,
                };
                if m.session_id != session_id
                    || !m.restart_scheduled
                    || m.state != WorkerState::Unhealthy
                {
                    false
                } else {
                    m.restart_scheduled = false;
                    true
                }
            };
            if should_restart {
                let _ = WorkerManager::restart(&shared, &app, &reason);
            }
        });
    }
}

fn mark_unhealthy(shared: &SharedWorkerManager, session_id: u64) -> bool {
    let mut m = match lock(shared) {
        Ok(m) => m,
        Err(_) => return false,
    };

    if m.session_id != session_id {
        return false;
    }

    if let Some(child) = m.child.take() {
        let _ = child.kill();
    }
    if matches!(m.state, WorkerState::Stopped | WorkerState::CircuitBroken) {
        return false;
    }

    m.state = WorkerState::Unhealthy;
    true
}

fn is_session_active(shared: &SharedWorkerManager, session_id: u64) -> bool {
    lock(shared).is_ok_and(|m| m.session_id == session_id)
}
