use std::collections::HashSet;

use tauri::State;

use crate::{
    database::{with_connection, AppState},
    models::{CreateSceneInput, SceneReorderItem, StoryboardScene, UpdateSceneInput},
    repository::scenes_repo,
};

fn require_non_empty(field: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!("{field} cannot be empty"));
    }
    Ok(())
}

fn validate_reorder_items(items: &[SceneReorderItem]) -> Result<(), String> {
    let mut ids = HashSet::with_capacity(items.len());
    let mut indexes = HashSet::with_capacity(items.len());
    for item in items {
        require_non_empty("scene_id", &item.id)?;
        if item.scene_index < 0 {
            return Err("scene_index must be >= 0".into());
        }
        if !ids.insert(&item.id) {
            return Err("duplicate scene_id in reorder payload".into());
        }
        if !indexes.insert(item.scene_index) {
            return Err("duplicate scene_index in reorder payload".into());
        }
    }
    Ok(())
}

#[tauri::command]
pub fn create_scene(
    state: State<'_, AppState>,
    input: CreateSceneInput,
) -> Result<StoryboardScene, String> {
    require_non_empty("project_id", &input.project_id)?;
    require_non_empty("scene_text", &input.scene_text)?;
    if let Some(ms) = input.duration_ms {
        if ms <= 0 {
            return Err("duration_ms must be > 0".into());
        }
    }
    with_connection(&state, |conn| {
        scenes_repo::create(conn, input).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn list_scenes(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<Vec<StoryboardScene>, String> {
    require_non_empty("project_id", &project_id)?;
    with_connection(&state, |conn| {
        scenes_repo::list_by_project(conn, &project_id).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn update_scene(
    state: State<'_, AppState>,
    scene_id: String,
    input: UpdateSceneInput,
) -> Result<Option<StoryboardScene>, String> {
    require_non_empty("scene_id", &scene_id)?;
    if let Some(ms) = input.duration_ms {
        if ms <= 0 {
            return Err("duration_ms must be > 0".into());
        }
    }
    with_connection(&state, |conn| {
        scenes_repo::update(conn, &scene_id, input).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn delete_scene(state: State<'_, AppState>, scene_id: String) -> Result<bool, String> {
    require_non_empty("scene_id", &scene_id)?;
    with_connection(&state, |conn| {
        scenes_repo::delete(conn, &scene_id).map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn reorder_scenes(
    state: State<'_, AppState>,
    project_id: String,
    items: Vec<SceneReorderItem>,
) -> Result<Vec<StoryboardScene>, String> {
    require_non_empty("project_id", &project_id)?;
    validate_reorder_items(&items)?;
    with_connection(&state, |conn| {
        scenes_repo::reorder(conn, &project_id, &items).map_err(|e| e.to_string())
    })
}
