use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

pub const IPC_VERSION: &str = "1.0";

pub const EVENT_WORKER_HELLO: &str = "worker.hello";
pub const EVENT_WORKER_WELCOME: &str = "worker.welcome";
pub const EVENT_WORKER_HEARTBEAT: &str = "worker.heartbeat";
pub const EVENT_TASK_SUBMIT: &str = "task.submit";
pub const EVENT_TASK_CANCEL: &str = "task.cancel";
pub const EVENT_TASK_STARTED: &str = "task.started";
pub const EVENT_TASK_PROGRESS: &str = "task.progress";
pub const EVENT_TASK_COMPLETED: &str = "task.completed";
pub const EVENT_TASK_FAILED: &str = "task.failed";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MessageKind {
    Command,
    Event,
    Ack,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Envelope {
    pub v: String,
    pub kind: MessageKind,
    pub event: String,
    pub msg_id: String,
    pub trace_id: String,
    pub payload: Value,
}

impl Envelope {
    pub fn new(kind: MessageKind, event: impl Into<String>, payload: Value) -> Self {
        Self {
            v: IPC_VERSION.to_string(),
            kind,
            event: event.into(),
            msg_id: Uuid::new_v4().to_string(),
            trace_id: Uuid::new_v4().to_string(),
            payload,
        }
    }

    pub fn to_ndjson_line(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self).map(|line| format!("{line}\n"))
    }

    #[allow(dead_code)]
    pub fn from_ndjson_line(line: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(line.trim())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskPayload {
    pub task_id: String,
    pub task_type: String,
    pub project_id: String,
    pub config: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressPayload {
    pub task_id: String,
    pub progress: f64,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResultPayload {
    pub task_id: String,
    pub status: String,
    pub output: Option<Value>,
    pub error: Option<String>,
}

pub fn deserialize_ndjson(input: &str) -> Result<Vec<Envelope>, serde_json::Error> {
    input
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .map(serde_json::from_str)
        .collect()
}
