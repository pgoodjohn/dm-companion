use chrono::{DateTime, Utc};
use r2d2::{Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::{params, Connection, Result, Row, Statement};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

use crate::character::{self, Character};

#[derive(Debug, Serialize)]
pub struct EncounterCharacter {
    pub id: Uuid,
    pub character: Character,
    pub encounter: Encounter,
    pub initiative: Option<i32>,
    pub status_effects: Vec<String>,
}

impl EncounterCharacter {
    pub fn new(character: Character, encounter: Encounter) -> Self {
        Self {
            id: Uuid::new_v4(),
            character,
            encounter,
            initiative: None,
            status_effects: Vec::new(),
        }
    }

    pub fn save(&self, db_pool: &Pool<SqliteConnectionManager>) -> Result<(), rusqlite::Error> {
        let conn = db_pool.get().unwrap();
        conn.execute(
            "INSERT INTO encounter_characters (id, character_id, encounter_id, initiative) VALUES (?1, ?2, ?3, ?4)",
            params![
                self.id.to_string(),
                self.character.id.to_string(),
                self.encounter.id.to_string(),
                self.initiative
            ],
        )?;

        Ok(())
    }

    pub fn load_for_encounter(
        encounter: Encounter,
        conn: &PooledConnection<SqliteConnectionManager>,
    ) -> Vec<Self> {
        let mut statement = conn
            .prepare("SELECT * FROM encounter_characters WHERE encounter_id = ?")
            .unwrap();

        let characters = statement
            .query_map(params![encounter.id.to_string()], |row| {
                let uuid: String = row.get("id")?;
                let character_id: String = row.get("character_id")?;
                let character =
                    Character::load_by_id(Uuid::parse_str(&character_id).unwrap(), conn).unwrap();

                Ok(EncounterCharacter {
                    id: Uuid::parse_str(&uuid).unwrap(),
                    character,
                    encounter: encounter.clone(),
                    initiative: row.get("initiative")?,
                    status_effects: Vec::new(),
                })
            })
            .unwrap()
            .map(|character| character.unwrap())
            .collect();

        characters
    }
}

#[derive(Debug, Serialize, Clone)]
pub struct Encounter {
    pub id: Uuid,
    pub encounter_title: String,
}

impl Encounter {
    pub fn new(encounter_title: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            encounter_title,
        }
    }

    pub fn save(&self, db_pool: &Pool<SqliteConnectionManager>) -> Result<(), rusqlite::Error> {
        let conn = db_pool.get().unwrap();
        conn.execute(
            "INSERT INTO encounters (id, encounter_title) VALUES (?1, ?2)",
            params![self.id.to_string(), self.encounter_title],
        )?;

        Ok(())
    }

    fn from_row(row: &Row) -> Result<Self> {
        let encounter_id: String = row.get("id")?;

        Ok(Encounter {
            id: Uuid::parse_str(&encounter_id).unwrap(),
            encounter_title: row.get("encounter_title")?,
        })
    }

    pub fn load_all_encounters(
        db_pool: &Pool<SqliteConnectionManager>,
    ) -> Result<Vec<Self>, rusqlite::Error> {
        let conn = db_pool.get().unwrap();
        let mut statement = conn.prepare("SELECT * FROM encounters")?;

        let encounters = statement
            .query_map([], |row| Self::from_row(row))?
            .map(|encounter| encounter.unwrap())
            .collect();

        Ok(encounters)
    }

    pub fn load_by_id(
        db_pool: &Pool<SqliteConnectionManager>,
        encounter_id: Uuid,
    ) -> Result<Self, rusqlite::Error> {
        let conn = db_pool.get().unwrap();
        let mut statement = conn.prepare("SELECT * FROM encounters WHERE id = ?")?;

        let encounter = statement
            .query_map(params![encounter_id.to_string()], |row| Self::from_row(row))?
            .map(|encounter| encounter.unwrap())
            .next()
            .unwrap();

        Ok(encounter)
    }
}

#[derive(Debug, Serialize)]
pub struct EncounterDetail {
    pub encounter: Encounter,
    pub characters: Vec<EncounterCharacter>,
}

impl EncounterDetail {
    pub fn load_by_id(
        db_pool: &Pool<SqliteConnectionManager>,
        encounter_id: Uuid,
    ) -> Result<Self, rusqlite::Error> {
        let conn = db_pool.get().unwrap();
        let encounter = Encounter::load_by_id(&db_pool, encounter_id).unwrap();

        let encounter_characters = EncounterCharacter::load_for_encounter(encounter.clone(), &conn);

        Ok(EncounterDetail {
            encounter,
            characters: encounter_characters,
        })
    }
}

#[tauri::command]
pub fn create_encounter_command(
    db_pool: State<Pool<SqliteConnectionManager>>,
    encounter_title: String,
) -> Result<(), String> {
    log::debug!("Creating encounter with title: {}", encounter_title);
    let encounter = Encounter::new(encounter_title);
    match encounter.save(&db_pool) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn load_encounters_command(
    db_pool: State<Pool<SqliteConnectionManager>>,
) -> Result<String, String> {
    let encounters = Encounter::load_all_encounters(&db_pool).unwrap();

    Ok(serde_json::to_string(&encounters).unwrap())
}

#[tauri::command]
pub fn load_encounter_detail_command(
    db_pool: State<Pool<SqliteConnectionManager>>,
    encounter_id: String,
) -> Result<String, String> {
    log::debug!(
        "Running load_encounter_detail_command for encounter_id: {}",
        encounter_id
    );

    let encounter_detail =
        EncounterDetail::load_by_id(&db_pool, Uuid::parse_str(&encounter_id).unwrap()).unwrap();

    Ok(serde_json::to_string(&encounter_detail).unwrap())
}

#[tauri::command]
pub fn add_character_to_encounter_command(
    db_pool: State<Pool<SqliteConnectionManager>>,
    encounter_id: String,
    character_id: String,
) -> Result<String, String> {
    log::debug!(
        "Adding character {} to encounter {}",
        character_id,
        encounter_id
    );
    let conn = db_pool.get().unwrap();

    let character =
        character::Character::load_by_id(Uuid::parse_str(&character_id).unwrap(), &conn).unwrap();

    let encounter =
        Encounter::load_by_id(&db_pool, Uuid::parse_str(&encounter_id).unwrap()).unwrap();

    let encounter_character = EncounterCharacter::new(character, encounter);
    encounter_character.save(&db_pool).unwrap();

    Ok(serde_json::to_string("").unwrap())
}

// impl EncounterCharacter {
//     pub fn new(character: Character) -> Self {
//         Self {
//             character,
//             initiative: None,
//             status_effects: Vec::new(),
//         }
//     }
// }
