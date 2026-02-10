use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension, Row};
use uuid::Uuid;

use crate::models::{CreateProjectInput, Project, UpdateProjectInput};

pub fn create(conn: &Connection, input: CreateProjectInput) -> rusqlite::Result<Project> {
    let now = Utc::now().to_rfc3339();
    let project = Project {
        id: Uuid::new_v4().to_string(),
        name: input.name,
        theme: input.theme,
        target_platform: input.target_platform.unwrap_or_else(|| "douyin".into()),
        status: "draft".into(),
        created_at: now.clone(),
        updated_at: now,
    };

    conn.execute(
        "INSERT INTO projects (id, name, theme, target_platform, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            &project.id,
            &project.name,
            project.theme.as_deref(),
            &project.target_platform,
            &project.status,
            &project.created_at,
            &project.updated_at
        ],
    )?;

    Ok(project)
}

pub fn list_all(conn: &Connection) -> rusqlite::Result<Vec<Project>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, theme, target_platform, status, created_at, updated_at
         FROM projects ORDER BY updated_at DESC",
    )?;
    let rows = stmt.query_map([], row_to_project)?;
    rows.collect()
}

pub fn get_by_id(conn: &Connection, id: &str) -> rusqlite::Result<Option<Project>> {
    conn.prepare(
        "SELECT id, name, theme, target_platform, status, created_at, updated_at
         FROM projects WHERE id = ?1",
    )?
    .query_row(params![id], row_to_project)
    .optional()
}

pub fn update(
    conn: &Connection,
    id: &str,
    input: UpdateProjectInput,
) -> rusqlite::Result<Option<Project>> {
    let mut project = match get_by_id(conn, id)? {
        Some(p) => p,
        None => return Ok(None),
    };

    if let Some(name) = input.name {
        project.name = name;
    }
    if let Some(theme) = input.theme {
        project.theme = Some(theme);
    }
    if let Some(tp) = input.target_platform {
        project.target_platform = tp;
    }
    if let Some(status) = input.status {
        project.status = status;
    }
    project.updated_at = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE projects
         SET name = ?1, theme = ?2, target_platform = ?3, status = ?4, updated_at = ?5
         WHERE id = ?6",
        params![
            &project.name,
            project.theme.as_deref(),
            &project.target_platform,
            &project.status,
            &project.updated_at,
            &project.id
        ],
    )?;

    Ok(Some(project))
}

pub fn delete(conn: &Connection, id: &str) -> rusqlite::Result<bool> {
    let affected = conn.execute("DELETE FROM projects WHERE id = ?1", params![id])?;
    Ok(affected > 0)
}

fn row_to_project(row: &Row<'_>) -> rusqlite::Result<Project> {
    Ok(Project {
        id: row.get("id")?,
        name: row.get("name")?,
        theme: row.get("theme")?,
        target_platform: row.get("target_platform")?,
        status: row.get("status")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}
