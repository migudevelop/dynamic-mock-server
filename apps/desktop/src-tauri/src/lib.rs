mod commands;
mod state;

use state::{ManagedServerState, ServerState};
use std::sync::Arc;
use tokio::sync::Mutex;

/// Initializes and runs the Tauri application.
///
/// Sets up managed state, registers all Tauri commands, and starts the event loop.
/// The server child process is automatically killed on app exit via `kill_on_drop(true)`.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let server_state: ManagedServerState = Arc::new(Mutex::new(ServerState::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(server_state)
        .invoke_handler(tauri::generate_handler![
            commands::config::detect_cli,
            commands::config::read_config,
            commands::server::start_server,
            commands::server::stop_server,
            commands::server::server_status,
            commands::server::get_server_logs,
            commands::admin::admin_request,
            commands::filesystem::read_file_content,
            commands::filesystem::write_file_content,
            commands::filesystem::list_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
