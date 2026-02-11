use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub theme: Option<String>,
    pub target_platform: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProjectInput {
    pub name: String,
    pub theme: Option<String>,
    pub target_platform: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UpdateProjectInput {
    pub name: Option<String>,
    pub theme: Option<String>,
    pub target_platform: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScriptVersion {
    pub id: String,
    pub project_id: String,
    pub version_no: i64,
    pub content: String,
    pub source: Option<String>,
    pub model: Option<String>,
    pub prompt_snapshot: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateScriptVersionInput {
    pub project_id: String,
    pub content: String,
    pub source: Option<String>,
    pub model: Option<String>,
    pub prompt_snapshot: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoryboardScene {
    pub id: String,
    pub project_id: String,
    pub script_version_id: Option<String>,
    pub scene_index: i64,
    pub scene_text: String,
    pub visual_prompt: Option<String>,
    pub duration_ms: i64,
    pub camera_hint: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSceneInput {
    pub project_id: String,
    pub script_version_id: Option<String>,
    pub scene_text: String,
    pub visual_prompt: Option<String>,
    pub duration_ms: Option<i64>,
    pub camera_hint: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UpdateSceneInput {
    pub script_version_id: Option<String>,
    pub scene_text: Option<String>,
    pub visual_prompt: Option<String>,
    pub duration_ms: Option<i64>,
    pub camera_hint: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SceneReorderItem {
    pub id: String,
    pub scene_index: i64,
}
