use chrono::{DateTime, Utc};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::{Connection, Result, Row, Statement};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

use crate::configuration::Configuration;

#[derive(Debug, Serialize, Deserialize)]
pub struct Character {
    pub id: Uuid,
    pub name: String,
    pub class: String,
    pub race: String,
    pub background: Option<String>,
    pub level: i32,
    pub experience: i32,
    pub hit_points: i32,
    pub current_hit_points: i32,
    pub armor_class: i32,
    pub initiative: Option<i32>,
    pub alive: bool,
    pub notes: String,
    pub created_at_utc: DateTime<Utc>,
    pub updated_at_utc: DateTime<Utc>,
}

impl Character {
    pub fn new(
        name: String,
        class: String,
        race: String,
        background: Option<String>,
        level: i32,
        experience: i32,
        hit_points: i32,
        armor_class: i32,
        notes: String,
    ) -> Self {
        Character {
            id: Uuid::new_v4(),
            name: name,
            class: class,
            race: race,
            background: background,
            level: level,
            experience: experience,
            hit_points: hit_points,
            current_hit_points: hit_points,
            armor_class: armor_class,
            initiative: None,
            alive: true,
            notes: notes,
            created_at_utc: Utc::now(),
            updated_at_utc: Utc::now(),
        }
    }

    pub fn is_stored(&self) -> bool {
        false
    }

    pub fn save(&self, connection: &Connection) -> Result<&Self, ()> {
        if self.is_stored() {
            return Ok(self);
        }

        connection.execute(
            "INSERT INTO characters (id, name, class, race, background, level, experience, hit_points, current_hit_points, armor_class, initiative, alive, notes, created_at_utc, updated_at_utc) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            rusqlite::params![
                &self.id.to_string(),
                &self.name,
                &self.class,
                &self.race,
                &self.background,
                &self.level,
                &self.experience,
                &self.hit_points,
                &self.current_hit_points,
                &self.armor_class,
                &self.initiative,
                &self.alive,
                &self.notes,
                &self.created_at_utc.to_rfc3339(),
                &self.updated_at_utc.to_rfc3339()],
        ).unwrap();

        Ok(self)
    }

    fn from_row(row: &Row) -> Result<Self> {
        let uuid_string: String = row.get("id").unwrap();
        let created_at_string: String = row.get("created_at_utc").unwrap();
        let updated_at_string: String = row.get("updated_at_utc").unwrap();
        let initiative: Option<i32> = row.get("initiative").ok();

        Ok(Character {
            id: Uuid::parse_str(&uuid_string).unwrap(),
            name: row.get("name").unwrap(),
            class: row.get("class").unwrap(),
            race: row.get("race").unwrap(),
            background: row.get("background").ok(),
            level: row.get("level").unwrap(),
            experience: row.get("experience").unwrap(),
            hit_points: row.get("hit_points").unwrap(),
            current_hit_points: row.get("current_hit_points").unwrap(),
            armor_class: row.get("armor_class").unwrap(),
            initiative: initiative,
            alive: row.get("alive").unwrap(),
            notes: row.get("notes").unwrap(),
            created_at_utc: DateTime::<Utc>::from(
                DateTime::parse_from_rfc3339(&created_at_string).unwrap(),
            ),
            updated_at_utc: DateTime::<Utc>::from(
                DateTime::parse_from_rfc3339(&updated_at_string).unwrap(),
            ),
        })
    }

    pub fn load_by_id(id: Uuid, connection: &Connection) -> Result<Self> {
        let mut stmt = connection
            .prepare("SELECT * FROM characters WHERE id = ?1")
            .unwrap();
        let mut rows = stmt.query(rusqlite::params![id.to_string()]).unwrap();

        let row = rows.next().unwrap().unwrap();

        Ok(Character::from_row(&row).unwrap())
    }
}

#[tauri::command]
pub fn create_character_command(
    name: String,
    class: String,
    race: String,
    background: Option<String>,
    level: i32,
    experience: i32,
    hit_points: i32,
    armor_class: i32,
    notes: String,
    db: State<Pool<SqliteConnectionManager>>,
    configuration: State<Configuration>,
) -> Result<String, String> {
    log::debug!("Running create character command for: {:?}", name);
    let character = Character::new(
        name,
        class,
        race,
        background,
        level,
        experience,
        hit_points,
        armor_class,
        notes,
    );

    character.save(&db.get().unwrap()).unwrap();

    Ok(serde_json::to_string(&character).unwrap())
}

#[tauri::command]
pub fn load_characters_command(
    db: State<Pool<SqliteConnectionManager>>,
    configuration: State<Configuration>,
) -> Result<String, String> {
    log::debug!("Running load characters command");
    let conn = db.get().unwrap(); // Get a connection from the pool

    let mut stmt = conn.prepare("SELECT * FROM characters").unwrap(); // Prepare the SQL statement
    let character_iter = stmt
        .query_map([], |row| Character::from_row(row))
        .map_err(|e| e.to_string())?;

    let mut characters = Vec::new();
    for character in character_iter {
        characters.push(character.unwrap()); // Collect all characters into a vector
    }

    Ok(serde_json::to_string(&characters).unwrap())
}

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Task {
//     pub id: Uuid,
//     pub title: String,
//     pub description: Option<String>,
//     pub project: Option<Project>,
//     pub due_at_utc: Option<DateTime<Utc>>,
//     pub created_at_utc: DateTime<Utc>,
//     pub completed_at_utc: Option<DateTime<Utc>>,
//     pub updated_at_utc: DateTime<Utc>,
// }

// impl Task {
//     pub fn new(title: String, description: Option<String>, project: Option<Project>, due_at_utc: Option<DateTime<Utc>>) -> Self {
//         Task {
//             id: Uuid::now_v7(),
//             title: title,
//             description: description,
//             project: project,
//             due_at_utc: due_at_utc,
//             created_at_utc: Utc::now(),
//             completed_at_utc: None,
//             updated_at_utc: Utc::now(),
//         }
//     }

//     fn is_stored(&self) -> bool {
//         false
//     }

//     pub fn save(&self, connection: &Connection) -> Result<&Self, ()> {
//         if self.is_stored() {
//             return Ok(self);
//         }

//         connection.execute(
//             "INSERT INTO tasks (id, title, description, project_id, due_at_utc, created_at_utc, updated_at_utc) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
//             rusqlite::params![
//                 &self.id.to_string(),
//                 &self.title,
//                 &self.description,
//                 &self.project.as_ref().map(|project| project.id.to_string()),
//                 &self.due_at_utc.map(|date| date.to_rfc3339()),
//                 &self.created_at_utc.to_rfc3339(),
//                 &self.updated_at_utc.to_rfc3339()],
//         ).unwrap();

//         Ok(self)
//     }

//     fn from_row(row: &Row, connection: &Connection) -> Result<Self> {
//         let uuid_string: String = row.get("id").unwrap();
//         let project_uuid_string: Option<String> = row.get("project_id").ok();
//         let created_at_string: String = row.get("created_at_utc").unwrap();
//         let updated_at_string: String = row.get("updated_at_utc").unwrap();
//         let completed_at_string: Option<String> = row.get("completed_at_utc").ok();

//         Ok(Task {
//             id: Uuid::parse_str(&uuid_string).unwrap(),
//             title: row.get("title").unwrap(),
//             description: row.get("description").ok(),
//             project: match project_uuid_string {
//                 Some(uuid) => Project::load_by_id(Uuid::parse_str(&uuid).unwrap(), &connection).unwrap(),
//                 None => None
//             },
//             due_at_utc: row.get("due_at_utc").ok().map(|date: String| DateTime::<Utc>::from(DateTime::parse_from_rfc3339(&date).unwrap())),
//             created_at_utc: DateTime::<Utc>::from(DateTime::parse_from_rfc3339(&created_at_string).unwrap()),
//             completed_at_utc: completed_at_string.map(|s| DateTime::<Utc>::from(DateTime::parse_from_rfc3339(&s).unwrap())),
//             updated_at_utc: DateTime::<Utc>::from(DateTime::parse_from_rfc3339(&updated_at_string).unwrap())
//         })
//     }
// }

// #[tauri::command]
// pub fn save_task_command(
//     title: String,
//     description: Option<String>,
//     due_date: Option<String>,
//     project_id: Option<String>,
//     db: State<Pool<SqliteConnectionManager>>,
//     configuration: State<Configuration>
// ) -> Result<String, String> {
//     log::debug!("Running save task command for: {:?} | {:?} | {:?}", title, description, due_date);
//     let task = Task::new(
//         title,
//         description,
//         match project_id {
//             Some(id) => Some(Project {
//                 id: Uuid::parse_str(&id).unwrap(),
//                 title: String::from(""),
//                 description: None,
//                 created_at_utc: Utc::now(),
//                 updated_at_utc: Utc::now(),
//             }),
//             None => None
//         },
//         match due_date {
//             Some(date) => Some(DateTime::<Utc>::from(DateTime::parse_from_rfc3339(&date).unwrap())),
//             None => None
//         }
//     );

//     task.save(&db.get().unwrap()).unwrap();

//     Ok(serde_json::to_string(&task).unwrap())
// }

// #[tauri::command]
// pub fn load_tasks_command(
//     include_completed: bool,
//     db: State<Pool<SqliteConnectionManager>>,
//     configuration: State<Configuration>,
// ) -> Result<String, String> {
//     log::debug!("Running load tasks command - include_completed: {:?}", include_completed);

//     let conn = db.get().unwrap(); // Get a connection from the pool
//     let query = if include_completed {
//         "SELECT * FROM tasks WHERE created_at_utc IS NOT NULL ORDER BY created_at_utc DESC"
//     } else {
//         "SELECT * FROM tasks WHERE created_at_utc IS NOT NULL AND completed_at_utc IS NULL ORDER BY created_at_utc DESC"
//     };
//     let mut stmt = conn.prepare(query).unwrap(); // Prepare the SQL statement
//     let task_iter = stmt.query_map([], |row| {
//         Task::from_row(row, &conn) // Map each row to a Card object
//     }).unwrap();

//     let mut tasks = Vec::new();
//     for task in task_iter {
//         tasks.push(task.unwrap()); // Collect all cards into a vector
//     }

//     Ok(serde_json::to_string(&tasks).unwrap())
// }

// #[tauri::command]
// pub fn delete_task_command(
//     task_id: String,
//     db: State<Pool<SqliteConnectionManager>>,
//     configuration: State<Configuration>,
// ) -> Result<String, String> {
//     log::debug!("Running delete task command for card ID: {}", task_id);
//     let conn = db.get().unwrap(); // Get a connection from the pool

//     let uuid = Uuid::parse_str(&task_id).map_err(|e| e.to_string())?;

//     conn.execute(
//         "DELETE FROM tasks WHERE id = ?1",
//         rusqlite::params![&uuid.to_string()],
//     ).map_err(|e| e.to_string())?;

//     Ok(format!("Task with ID {} deleted successfully", &task_id))
// }

// #[tauri::command]
// pub fn complete_task_command(
//     task_id: String,
//     db: State<Pool<SqliteConnectionManager>>,
//     configuration: State<Configuration>,
// ) -> Result<String, String> {
//     log::debug!("Running complete task command for card ID: {}", task_id);
//     let conn = db.get().unwrap(); // Get a connection from the pool

//     let uuid = Uuid::parse_str(&task_id).map_err(|e| e.to_string())?;

//     conn.execute(
//         "UPDATE tasks SET completed_at_utc = ?1 WHERE id = ?2",
//         rusqlite::params![Utc::now().to_rfc3339(), &uuid.to_string()],
//     ).map_err(|e| e.to_string())?;

//     Ok(format!("Card with ID {} completed successfully", task_id))
// }

// #[tauri::command]
// pub fn load_projects_command(
//     db: State<Pool<SqliteConnectionManager>>,
//     configuration: State<Configuration>,
// ) -> Result<String, String> {
//     log::debug!("Running list projects command");
//     let conn = db.get().unwrap(); // Get a connection from the pool
//     let mut stmt = conn.prepare("SELECT * FROM projects ORDER BY title ASC").unwrap(); // Prepare the SQL statement
//     let project_iter = stmt.query_map([], |row| {
//         Project::from_row(row) // Map each row to a Card object
//     }).unwrap();

//     let mut projects = Vec::new();
//     for project in project_iter {
//         projects.push(project.unwrap()); // Collect all cards into a vector
//     }

//     Ok(serde_json::to_string(&projects).unwrap())
// }

// #[tauri::command]
// pub fn create_project_command(
//     title: String,
//     description: Option<String>,
//     db: State<Pool<SqliteConnectionManager>>,
//     configuration: State<Configuration>,
// ) -> Result<String, String> {
//     log::debug!("Running create project command for: {:?} | {:?}", title, description);
//     let project = Project::new(
//         title,
//         description
//     );

//     project.save(&db.get().unwrap()).unwrap();

//     Ok(serde_json::to_string(&project).unwrap())
// }
