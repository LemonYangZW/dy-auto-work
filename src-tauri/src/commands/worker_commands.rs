use tauri::{AppHandle, Runtime, State};

use crate::{
    database::AppState,
    worker::{
        dispatcher::{SubmitTaskInput, TaskInfo},
        manager::{WorkerManager, WorkerStatus},
    },
};

#[tauri::command]
pub fn get_worker_status(state: State<'_, AppState>) -> Result<WorkerStatus, String> {
    WorkerManager::get_status(&state.worker_manager)
}

#[tauri::command]
pub fn submit_task<R: Runtime + 'static>(
    app: AppHandle<R>,
    state: State<'_, AppState>,
    input: SubmitTaskInput,
) -> Result<String, String> {
    WorkerManager::submit_task(&state.worker_manager, &app, input)
}

#[tauri::command]
pub fn cancel_task<R: Runtime>(
    app: AppHandle<R>,
    state: State<'_, AppState>,
    task_id: String,
) -> Result<bool, String> {
    WorkerManager::cancel_task(&state.worker_manager, &app, &task_id)
}

#[tauri::command]
pub fn list_tasks(state: State<'_, AppState>) -> Result<Vec<TaskInfo>, String> {
    WorkerManager::list_tasks(&state.worker_manager)
}

#[tauri::command]
pub fn start_worker<R: Runtime + 'static>(
    app: AppHandle<R>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    WorkerManager::start(&state.worker_manager, &app)
}

#[tauri::command]
pub fn stop_worker<R: Runtime>(
    app: AppHandle<R>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    WorkerManager::stop(&state.worker_manager, &app)
}
