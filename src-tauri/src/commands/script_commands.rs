use tauri::State;

use crate::{
    database::{with_connection, AppState},
    models::{CreateScriptVersionInput, ScriptVersion},
    repository::scripts_repo,
};

fn require_non_empty(field: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!("{field} cannot be empty"));
    }
    Ok(())
}

#[tauri::command]
pub fn create_script_version(
    state: State<'_, AppState>,
    input: CreateScriptVersionInput,
) -> Result<ScriptVersion, String> {
    require_non_empty("project_id", &input.project_id)?;
    if let Some(ref source) = input.source {
        if source != "ai" && source != "manual" {
            return Err("source must be 'ai' or 'manual'".into());
        }
    }
    with_connection(&state, |conn| {
        scripts_repo::create(conn, input).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn get_latest_script(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<Option<ScriptVersion>, String> {
    require_non_empty("project_id", &project_id)?;
    with_connection(&state, |conn| {
        scripts_repo::get_latest(conn, &project_id).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn list_script_versions(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<Vec<ScriptVersion>, String> {
    require_non_empty("project_id", &project_id)?;
    with_connection(&state, |conn| {
        scripts_repo::list_by_project(conn, &project_id).map_err(|e| e.to_string())
    })
}
