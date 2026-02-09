use axum::{
    extract::{Json, State, Path},
    http::StatusCode,
    response::Json as JsonResponse,
    routing::{get},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::db::AppState;

#[derive(Serialize, Deserialize)]
pub struct Project {
    id: Option<i64>,
    title: String,
    description: String,
    technologies: String,
    github_url: Option<String>,
    demo_url: Option<String>,
    image_urls: String,
    featured: bool,
    created_at: Option<String>,
    updated_at: Option<String>,
}

#[derive(Serialize)]
pub struct ProjectsResponse {
    projects: Vec<Project>,
}

pub fn router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/", get(list_projects).post(create_project))
        .route("/:id", get(get_project).put(update_project).delete(delete_project))
        .with_state(state)
}

async fn list_projects(
    State(state): State<Arc<AppState>>,
) -> Result<JsonResponse<ProjectsResponse>, StatusCode> {
    let conn = state.conn.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut stmt = conn.prepare(
        "SELECT id, title, description, technologies, github_url, demo_url, image_urls, featured, created_at, updated_at 
         FROM projects ORDER BY created_at DESC"
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let projects = stmt.query_map([], |row| {
        Ok(Project {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            technologies: row.get(3)?,
            github_url: row.get(4)?,
            demo_url: row.get(5)?,
            image_urls: row.get(6)?,
            featured: row.get::<_, i64>(7)? != 0,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    }).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let project_list: Vec<Project> = projects.filter_map(|p| p.ok()).collect();

    Ok(JsonResponse(ProjectsResponse { projects: project_list }))
}

async fn get_project(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>,
) -> Result<JsonResponse<Project>, StatusCode> {
    let conn = state.conn.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let project = conn.query_row(
        "SELECT id, title, description, technologies, github_url, demo_url, image_urls, featured, created_at, updated_at 
         FROM projects WHERE id = ?1",
        [id],
        |row| {
            Ok(Project {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                technologies: row.get(3)?,
                github_url: row.get(4)?,
                demo_url: row.get(5)?,
                image_urls: row.get(6)?,
                featured: row.get::<_, i64>(7)? != 0,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        }
    ).map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(JsonResponse(project))
}

async fn create_project(
    State(state): State<Arc<AppState>>,
    Json(project): Json<Project>,
) -> Result<JsonResponse<Project>, StatusCode> {
    let conn = state.conn.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    conn.execute(
        "INSERT INTO projects (title, description, technologies, github_url, demo_url, image_urls, featured) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        [
            &project.title,
            &project.description,
            &project.technologies,
            &project.github_url.clone().unwrap_or_default(),
            &project.demo_url.clone().unwrap_or_default(),
            &project.image_urls,
            &(if project.featured { "1".to_string() } else { "0".to_string() }),
        ],
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let id = conn.last_insert_rowid();

    Ok(JsonResponse(Project {
        id: Some(id),
        ..project
    }))
}

async fn update_project(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>,
    Json(project): Json<Project>,
) -> Result<JsonResponse<Project>, StatusCode> {
    let conn = state.conn.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    conn.execute(
        "UPDATE projects SET 
         title = ?1, description = ?2, technologies = ?3, github_url = ?4, 
         demo_url = ?5, image_urls = ?6, featured = ?7, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?8",
        [
            &project.title,
            &project.description,
            &project.technologies,
            &project.github_url.clone().unwrap_or_default(),
            &project.demo_url.clone().unwrap_or_default(),
            &project.image_urls,
            &(if project.featured { "1".to_string() } else { "0".to_string() }),
            &id.to_string(),
        ],
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(JsonResponse(project))
}

async fn delete_project(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>,
) -> Result<StatusCode, StatusCode> {
    let conn = state.conn.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    conn.execute(
        "DELETE FROM projects WHERE id = ?1",
        [id],
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}
