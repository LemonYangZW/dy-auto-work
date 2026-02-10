use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension, Row};
use uuid::Uuid;

use crate::models::{CreateScriptVersionInput, ScriptVersion};

pub fn create(conn: &Connection, input: CreateScriptVersionInput) -> rusqlite::Result<ScriptVersion> {
    let version_no = next_version_no(conn, &input.project_id)?;
    let sv = ScriptVersion {
        id: Uuid::new_v4().to_string(),
        project_id: input.project_id,
        version_no,
        content: input.content,
        source: input.source,
        model: input.model,
        prompt_snapshot: input.prompt_snapshot,
        created_at: Utc::now().to_rfc3339(),
    };

    conn.execute(
        "INSERT INTO script_versions (id, project_id, version_no, content, source, model, prompt_snapshot, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            &sv.id,
            &sv.project_id,
            sv.version_no,
            &sv.content,
            sv.source.as_deref(),
            sv.model.as_deref(),
            sv.prompt_snapshot.as_deref(),
            &sv.created_at
        ],
    )?;

    Ok(sv)
}

pub fn list_by_project(conn: &Connection, project_id: &str) -> rusqlite::Result<Vec<ScriptVersion>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, version_no, content, source, model, prompt_snapshot, created_at
         FROM script_versions WHERE project_id = ?1 ORDER BY version_no DESC",
    )?;
    let rows = stmt.query_map(params![project_id], row_to_script)?;
    rows.collect()
}

pub fn get_latest(conn: &Connection, project_id: &str) -> rusqlite::Result<Option<ScriptVersion>> {
    conn.prepare(
        "SELECT id, project_id, version_no, content, source, model, prompt_snapshot, created_at
         FROM script_versions WHERE project_id = ?1 ORDER BY version_no DESC LIMIT 1",
    )?
    .query_row(params![project_id], row_to_script)
    .optional()
}

fn next_version_no(conn: &Connection, project_id: &str) -> rusqlite::Result<i64> {
    conn.query_row(
        "SELECT COALESCE(MAX(version_no), 0) + 1 FROM script_versions WHERE project_id = ?1",
        params![project_id],
        |row| row.get(0),
    )
}

fn row_to_script(row: &Row<'_>) -> rusqlite::Result<ScriptVersion> {
    Ok(ScriptVersion {
        id: row.get("id")?,
        project_id: row.get("project_id")?,
        version_no: row.get("version_no")?,
        content: row.get("content")?,
        source: row.get("source")?,
        model: row.get("model")?,
        prompt_snapshot: row.get("prompt_snapshot")?,
        created_at: row.get("created_at")?,
    })
}
