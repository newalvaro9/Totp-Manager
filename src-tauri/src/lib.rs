// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::{env, path::PathBuf};
use tauri::Manager;

#[tauri::command]
fn get_app_path() -> String {
    env::current_exe()
        .ok()
        .and_then(|path| path.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."))
        .display()
        .to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default().plugin(tauri_plugin_os::init());

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }));
    }

    /* This will only be ran in --debug or dev builds */
    #[cfg(debug_assertions)]
    {
        builder = builder.setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.open_devtools();
            Ok(())
        });
    }

    builder
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![get_app_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
