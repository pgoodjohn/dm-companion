mod character;
mod configuration;
mod encounter;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let configuration = configuration::Configuration::init().unwrap();

    log::info!("Starting DM Companion!");
    log::debug!("Configuration loaded {:?}", configuration);

    let db_pool = storage::setup_database(&configuration).expect("Could not set up database.");

    tauri::Builder::default()
        .manage(configuration)
        .manage(db_pool)
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            configuration::load_configuration_command,
            character::create_character_command,
            character::load_characters_command,
            encounter::load_encounters_command,
            encounter::create_encounter_command,
            encounter::load_encounter_detail_command,
            encounter::add_character_to_encounter_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
