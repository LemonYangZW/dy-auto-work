use std::{fs, path::PathBuf, sync::Mutex};

use rusqlite::Connection;
use tauri::{AppHandle, Manager, Runtime, State};

use crate::worker::manager::SharedWorkerManager;

pub struct AppState {
    pub db: Mutex<Connection>,
    pub worker_manager: SharedWorkerManager,
}

const DATABASE_FILE_NAME: &str = "dy_auto_work.sqlite3";

const MIGRATIONS: &[&str] = &[r#"
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    theme TEXT,
    target_platform TEXT NOT NULL DEFAULT 'douyin',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS script_versions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    version_no INTEGER NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    source TEXT CHECK(source IN ('ai', 'manual')),
    model TEXT,
    prompt_snapshot TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(project_id, version_no)
);

CREATE TABLE IF NOT EXISTS storyboard_scenes (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    script_version_id TEXT,
    scene_index INTEGER NOT NULL CHECK(scene_index >= 0),
    scene_text TEXT NOT NULL DEFAULT '',
    visual_prompt TEXT,
    duration_ms INTEGER NOT NULL DEFAULT 3000 CHECK(duration_ms > 0),
    camera_hint TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (script_version_id) REFERENCES script_versions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    scene_id TEXT,
    type TEXT NOT NULL CHECK(type IN ('image', 'video', 'audio', 'subtitle')),
    provider TEXT,
    local_path TEXT,
    meta_json TEXT,
    checksum TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES storyboard_scenes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_script_versions_project_id ON script_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_storyboard_scenes_project_id ON storyboard_scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_storyboard_scenes_script_version ON storyboard_scenes(script_version_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_scene_id ON assets(scene_id);
"#,
r#"
CREATE TABLE IF NOT EXISTS ai_tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    progress REAL NOT NULL DEFAULT 0.0,
    config_json TEXT,
    output_json TEXT,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_tasks_project_id ON ai_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status);
"#];

pub fn init_app_state<R: Runtime>(app: &AppHandle<R>) -> Result<AppState, String> {
    let db_path = resolve_database_path(app)?;
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("failed to create app data directory: {e}"))?;
    }

    let conn = Connection::open(&db_path)
        .map_err(|e| format!("failed to open database at {}: {e}", db_path.display()))?;

    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
         PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;",
    )
    .map_err(|e| format!("failed to set database pragmas: {e}"))?;

    run_migrations(&conn)?;

    let worker_manager = crate::worker::manager::WorkerManager::new();

    Ok(AppState {
        db: Mutex::new(conn),
        worker_manager,
    })
}

pub fn with_connection<T, F>(state: &State<'_, AppState>, op: F) -> Result<T, String>
where
    F: FnOnce(&Connection) -> Result<T, String>,
{
    let guard = state
        .db
        .lock()
        .map_err(|e| format!("database lock poisoned: {e}"))?;
    op(&guard)
}

fn resolve_database_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|dir| dir.join(DATABASE_FILE_NAME))
        .map_err(|e| format!("failed to resolve app_data_dir: {e}"))
}

fn run_migrations(conn: &Connection) -> Result<(), String> {
    for sql in MIGRATIONS {
        conn.execute_batch(sql)
            .map_err(|e| format!("migration failed: {e}"))?;
    }
    Ok(())
}
