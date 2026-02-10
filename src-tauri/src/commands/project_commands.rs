use tauri::State;

use crate::{
    database::{with_connection, AppState},
    models::{CreateProjectInput, Project, UpdateProjectInput},
    repository::projects_repo,
};

fn require_non_empty(field: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!("{field} cannot be empty"));
    }
    Ok(())
}

#[tauri::command]
pub fn create_project(state: State<'_, AppState>, input: CreateProjectInput) -> Result<Project, String> {
    require_non_empty("name", &input.name)?;
    with_connection(&state, |conn| {
        projects_repo::create(conn, input).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn list_projects(state: State<'_, AppState>) -> Result<Vec<Project>, String> {
    with_connection(&state, |conn| {
        projects_repo::list_all(conn).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn get_project(state: State<'_, AppState>, project_id: String) -> Result<Option<Project>, String> {
    require_non_empty("project_id", &project_id)?;
    with_connection(&state, |conn| {
        projects_repo::get_by_id(conn, &project_id).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn update_project(
    state: State<'_, AppState>,
    project_id: String,
    input: UpdateProjectInput,
) -> Result<Option<Project>, String> {
    require_non_empty("project_id", &project_id)?;
    if let Some(ref name) = input.name {
        require_non_empty("name", name)?;
    }
    with_connection(&state, |conn| {
        projects_repo::update(conn, &project_id, input).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn delete_project(state: State<'_, AppState>, project_id: String) -> Result<bool, String> {
    require_non_empty("project_id", &project_id)?;
    with_connection(&state, |conn| {
        projects_repo::delete(conn, &project_id).map_err(|e| e.to_string())
    })
}
