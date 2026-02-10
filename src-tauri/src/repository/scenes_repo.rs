use rusqlite::{params, Connection, OptionalExtension, Row};
use uuid::Uuid;

use crate::models::{CreateSceneInput, SceneReorderItem, StoryboardScene, UpdateSceneInput};

const DEFAULT_DURATION_MS: i64 = 3000;

pub fn create(conn: &Connection, input: CreateSceneInput) -> rusqlite::Result<StoryboardScene> {
    let scene_index = next_scene_index(conn, &input.project_id)?;
    let scene = StoryboardScene {
        id: Uuid::new_v4().to_string(),
        project_id: input.project_id,
        script_version_id: input.script_version_id,
        scene_index,
        scene_text: input.scene_text,
        visual_prompt: input.visual_prompt,
        duration_ms: input.duration_ms.unwrap_or(DEFAULT_DURATION_MS).max(1),
        camera_hint: input.camera_hint,
    };

    conn.execute(
        "INSERT INTO storyboard_scenes
         (id, project_id, script_version_id, scene_index, scene_text, visual_prompt, duration_ms, camera_hint)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            &scene.id,
            &scene.project_id,
            scene.script_version_id.as_deref(),
            scene.scene_index,
            &scene.scene_text,
            scene.visual_prompt.as_deref(),
            scene.duration_ms,
            scene.camera_hint.as_deref()
        ],
    )?;

    Ok(scene)
}

pub fn list_by_project(conn: &Connection, project_id: &str) -> rusqlite::Result<Vec<StoryboardScene>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, script_version_id, scene_index, scene_text, visual_prompt, duration_ms, camera_hint
         FROM storyboard_scenes WHERE project_id = ?1 ORDER BY scene_index ASC",
    )?;
    let rows = stmt.query_map(params![project_id], row_to_scene)?;
    rows.collect()
}

pub fn get_by_id(conn: &Connection, id: &str) -> rusqlite::Result<Option<StoryboardScene>> {
    conn.prepare(
        "SELECT id, project_id, script_version_id, scene_index, scene_text, visual_prompt, duration_ms, camera_hint
         FROM storyboard_scenes WHERE id = ?1",
    )?
    .query_row(params![id], row_to_scene)
    .optional()
}

pub fn update(
    conn: &Connection,
    id: &str,
    input: UpdateSceneInput,
) -> rusqlite::Result<Option<StoryboardScene>> {
    let mut scene = match get_by_id(conn, id)? {
        Some(s) => s,
        None => return Ok(None),
    };

    if let Some(svid) = input.script_version_id {
        scene.script_version_id = Some(svid);
    }
    if let Some(text) = input.scene_text {
        scene.scene_text = text;
    }
    if let Some(prompt) = input.visual_prompt {
        scene.visual_prompt = Some(prompt);
    }
    if let Some(ms) = input.duration_ms {
        scene.duration_ms = ms.max(1);
    }
    if let Some(hint) = input.camera_hint {
        scene.camera_hint = Some(hint);
    }

    conn.execute(
        "UPDATE storyboard_scenes
         SET script_version_id = ?1, scene_text = ?2, visual_prompt = ?3,
             duration_ms = ?4, camera_hint = ?5
         WHERE id = ?6",
        params![
            scene.script_version_id.as_deref(),
            &scene.scene_text,
            scene.visual_prompt.as_deref(),
            scene.duration_ms,
            scene.camera_hint.as_deref(),
            &scene.id
        ],
    )?;

    Ok(Some(scene))
}

pub fn delete(conn: &Connection, id: &str) -> rusqlite::Result<bool> {
    let affected = conn.execute("DELETE FROM storyboard_scenes WHERE id = ?1", params![id])?;
    Ok(affected > 0)
}

pub fn reorder(
    conn: &Connection,
    project_id: &str,
    items: &[SceneReorderItem],
) -> rusqlite::Result<Vec<StoryboardScene>> {
    if items.is_empty() {
        return list_by_project(conn, project_id);
    }

    let tx = conn.unchecked_transaction()?;

    for (offset, item) in items.iter().enumerate() {
        let temp_index = -(offset as i64) - 1;
        let affected = tx.execute(
            "UPDATE storyboard_scenes SET scene_index = ?1 WHERE id = ?2 AND project_id = ?3",
            params![temp_index, &item.id, project_id],
        )?;
        if affected == 0 {
            return Err(rusqlite::Error::QueryReturnedNoRows);
        }
    }

    for item in items {
        tx.execute(
            "UPDATE storyboard_scenes SET scene_index = ?1 WHERE id = ?2 AND project_id = ?3",
            params![item.scene_index, &item.id, project_id],
        )?;
    }

    tx.commit()?;
    list_by_project(conn, project_id)
}

fn next_scene_index(conn: &Connection, project_id: &str) -> rusqlite::Result<i64> {
    conn.query_row(
        "SELECT COALESCE(MAX(scene_index), -1) + 1 FROM storyboard_scenes WHERE project_id = ?1",
        params![project_id],
        |row| row.get(0),
    )
}

fn row_to_scene(row: &Row<'_>) -> rusqlite::Result<StoryboardScene> {
    Ok(StoryboardScene {
        id: row.get("id")?,
        project_id: row.get("project_id")?,
        script_version_id: row.get("script_version_id")?,
        scene_index: row.get("scene_index")?,
        scene_text: row.get("scene_text")?,
        visual_prompt: row.get("visual_prompt")?,
        duration_ms: row.get("duration_ms")?,
        camera_hint: row.get("camera_hint")?,
    })
}
