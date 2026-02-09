use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::Json as JsonResponse,
    routing::{post, get},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::db::AppState;

#[derive(Deserialize)]
pub struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    success: bool,
    message: String,
    token: Option<String>,
}

#[derive(Serialize)]
pub struct ContactSubmission {
    id: i64,
    name: String,
    email: String,
    subject: String,
    message: String,
    created_at: String,
    read: bool,
}

#[derive(Serialize)]
pub struct ContactsResponse {
    contacts: Vec<ContactSubmission>,
}

pub fn router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/login", post(login))
        .route("/contacts", get(list_contacts))
        .route("/contacts/:id/read", post(mark_contact_read))
        .with_state(state)
}

async fn login(
    State(state): State<Arc<AppState>>,
    Json(request): Json<LoginRequest>,
) -> Result<JsonResponse<LoginResponse>, StatusCode> {
    let conn = state.conn.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Get stored password hash
    let stored_hash: String = conn.query_row(
        "SELECT password_hash FROM admin_users WHERE username = ?1",
        [&request.username],
        |row| row.get(0),
    ).map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Verify password
    let valid = bcrypt::verify(&request.password, &stored_hash)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if valid {
        // In production, generate a proper JWT token
        // For now, using a simple token
        Ok(JsonResponse(LoginResponse {
            success: true,
            message: "Login successful".to_string(),
            token: Some("admin-token-12345".to_string()),
        }))
    } else {
        Ok(JsonResponse(LoginResponse {
            success: false,
            message: "Invalid credentials".to_string(),
            token: None,
        }))
    }
}

async fn list_contacts(
    State(state): State<Arc<AppState>>,
) -> Result<JsonResponse<ContactsResponse>, StatusCode> {
    let conn = state.conn.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut stmt = conn.prepare(
        "SELECT id, name, email, subject, message, created_at, read 
         FROM contacts ORDER BY created_at DESC"
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let contacts = stmt.query_map([], |row| {
        Ok(ContactSubmission {
            id: row.get(0)?,
            name: row.get(1)?,
            email: row.get(2)?,
            subject: row.get(3)?,
            message: row.get(4)?,
            created_at: row.get(5)?,
            read: row.get::<_, i64>(6)? != 0,
        })
    }).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let contact_list: Vec<ContactSubmission> = contacts.filter_map(|c| c.ok()).collect();

    Ok(JsonResponse(ContactsResponse { contacts: contact_list }))
}

async fn mark_contact_read(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<StatusCode, StatusCode> {
    let conn = state.conn.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    conn.execute(
        "UPDATE contacts SET read = 1 WHERE id = ?1",
        [id],
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}
