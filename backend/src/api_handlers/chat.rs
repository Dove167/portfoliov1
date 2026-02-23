use axum::{
    extract::Json,
    response::IntoResponse,
    routing::post,
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::db::AppState;
use tracing::{info};

#[derive(Deserialize)]
pub struct ChatRequest {
    pub message: String,
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub content: String,
}

pub fn router(_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/", post(handle_chat))
}

async fn handle_chat(
    Json(req): Json<ChatRequest>,
) -> impl IntoResponse {
    info!("Received chat request: {}", req.message);
    
    Json(ChatResponse { content: "AI chat is currently unavailable. Please try again later.".to_string() })
}
