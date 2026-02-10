mod commands;
mod database;
mod models;
mod repository;

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            let state = database::init_app_state(&app.handle()).map_err(|e| {
                std::io::Error::new(std::io::ErrorKind::Other, e)
            })?;
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::project_commands::create_project,
            commands::project_commands::list_projects,
            commands::project_commands::get_project,
            commands::project_commands::update_project,
            commands::project_commands::delete_project,
            commands::script_commands::create_script_version,
            commands::script_commands::get_latest_script,
            commands::script_commands::list_script_versions,
            commands::scene_commands::create_scene,
            commands::scene_commands::list_scenes,
            commands::scene_commands::update_scene,
            commands::scene_commands::delete_scene,
            commands::scene_commands::reorder_scenes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
