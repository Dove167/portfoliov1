use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::Json as JsonResponse,
    routing::post,
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::db::AppState;

#[derive(Deserialize)]
pub struct ContactRequest {
    name: String,
    email: String,
    subject: String,
    message: String,
}

#[derive(Serialize)]
pub struct ContactResponse {
    success: bool,
    message: String,
}

pub fn router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/", post(submit_contact))
        .with_state(state)
}

async fn submit_contact(
    State(state): State<Arc<AppState>>,
    Json(request): Json<ContactRequest>,
) -> Result<JsonResponse<ContactResponse>, StatusCode> {
    let conn = state.conn.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Insert contact submission into database
    conn.execute(
        "INSERT INTO contacts (name, email, subject, message) VALUES (?1, ?2, ?3, ?4)",
        [
            &request.name,
            &request.email,
            &request.subject,
            &request.message,
        ],
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // TODO: Send email using Resend API
    // For now, just store in database

    Ok(JsonResponse(ContactResponse {
        success: true,
        message: "Thank you! Your message has been received.".to_string(),
    }))
}
