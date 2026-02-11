use std::collections::{HashMap, HashSet};

use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{
    ipc::protocol::{ProgressPayload, TaskPayload, TaskResultPayload},
    models::TaskStatus,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubmitTaskInput {
    pub task_type: String,
    pub project_id: String,
    #[serde(default = "default_task_config")]
    pub config: Value,
}

fn default_task_config() -> Value {
    Value::Object(serde_json::Map::new())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskInfo {
    pub task_id: String,
    pub task_type: String,
    pub project_id: String,
    pub status: TaskStatus,
    pub progress: f64,
    pub message: Option<String>,
    pub output: Option<Value>,
    pub error: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl TaskInfo {
    fn from_payload(payload: &TaskPayload) -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            task_id: payload.task_id.clone(),
            task_type: payload.task_type.clone(),
            project_id: payload.project_id.clone(),
            status: TaskStatus::Pending,
            progress: 0.0,
            message: Some("queued".into()),
            output: None,
            error: None,
            created_at: now.clone(),
            updated_at: now,
        }
    }

    fn placeholder(task_id: &str) -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            task_id: task_id.to_string(),
            task_type: "unknown".into(),
            project_id: String::new(),
            status: TaskStatus::Pending,
            progress: 0.0,
            message: None,
            output: None,
            error: None,
            created_at: now.clone(),
            updated_at: now,
        }
    }
}

fn map_worker_status(status: &str, _error: Option<&str>) -> TaskStatus {
    match status {
        "completed" => TaskStatus::Completed,
        "failed" => TaskStatus::Failed,
        "cancelled" => TaskStatus::Cancelled,
        "running" => TaskStatus::Running,
        "pending" => TaskStatus::Pending,
        _ => TaskStatus::Failed,
    }
}

#[derive(Debug, Default)]
pub struct WorkerDispatcher {
    tasks: HashMap<String, TaskInfo>,
    in_flight: HashSet<String>,
}

impl WorkerDispatcher {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn contains_task(&self, task_id: &str) -> bool {
        self.tasks.contains_key(task_id)
    }

    pub fn register_submission(&mut self, payload: &TaskPayload) -> TaskInfo {
        let info = TaskInfo::from_payload(payload);
        self.in_flight.insert(payload.task_id.clone());
        self.tasks.insert(payload.task_id.clone(), info.clone());
        info
    }

    pub fn mark_started(&mut self, task_id: &str) -> Option<TaskInfo> {
        let task = self.tasks.get_mut(task_id)?;
        task.status = TaskStatus::Running;
        task.message = Some("started".into());
        task.updated_at = Utc::now().to_rfc3339();
        self.in_flight.insert(task_id.to_string());
        Some(task.clone())
    }

    pub fn apply_progress(&mut self, payload: ProgressPayload) -> Option<TaskInfo> {
        let task = self
            .tasks
            .entry(payload.task_id.clone())
            .or_insert_with(|| TaskInfo::placeholder(&payload.task_id));

        task.status = TaskStatus::Running;
        task.progress = payload.progress.clamp(0.0, 1.0);
        task.message = payload.message;
        task.updated_at = Utc::now().to_rfc3339();
        self.in_flight.insert(payload.task_id);
        Some(task.clone())
    }

    pub fn apply_result(&mut self, payload: TaskResultPayload) -> Option<TaskInfo> {
        let task = self
            .tasks
            .entry(payload.task_id.clone())
            .or_insert_with(|| TaskInfo::placeholder(&payload.task_id));

        task.status = map_worker_status(&payload.status, payload.error.as_deref());
        if task.status == TaskStatus::Completed {
            task.progress = 1.0;
        }
        task.output = payload.output;
        task.error = payload.error;
        task.message = None;
        task.updated_at = Utc::now().to_rfc3339();
        self.in_flight.remove(&payload.task_id);
        Some(task.clone())
    }

    pub fn cancel_task(&mut self, task_id: &str) -> Option<TaskInfo> {
        let task = self.tasks.get_mut(task_id)?;
        task.status = TaskStatus::Cancelled;
        task.message = Some("cancelled".into());
        task.updated_at = Utc::now().to_rfc3339();
        self.in_flight.remove(task_id);
        Some(task.clone())
    }

    pub fn fail_all_in_flight(&mut self) {
        let task_ids: Vec<String> = self.in_flight.drain().collect();
        let now = Utc::now().to_rfc3339();
        for task_id in task_ids {
            if let Some(task) = self.tasks.get_mut(&task_id) {
                task.status = TaskStatus::Failed;
                task.error = Some("worker stopped while task was in-flight".into());
                task.message = None;
                task.updated_at = now.clone();
            }
        }
    }

    pub fn in_flight_count(&self) -> usize {
        self.in_flight.len()
    }

    pub fn list_tasks(&self) -> Vec<TaskInfo> {
        let mut tasks: Vec<TaskInfo> = self.tasks.values().cloned().collect();
        tasks.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        tasks
    }
}
