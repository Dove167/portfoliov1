use axum::{
    extract::Json,
    response::IntoResponse,
    routing::post,
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::db::AppState;
use reqwest::Client;

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
    let api_key = std::env::var("OPENROUTER_API_KEY").expect("OPENROUTER_API_KEY must be set");
    let model = std::env::var("OPENROUTER_MODEL").unwrap_or_else(|_| "google/gemini-2.0-flash-lite-preview-02-05:free".to_string());
    
    let client = Client::new();
    
    let summary_path = std::env::var("CARGO_MANIFEST_DIR")
        .map(|dir| std::path::PathBuf::from(dir).join("../summary_of_me.md"))
        .unwrap_or_else(|_| std::path::PathBuf::from("summary_of_me.md"));
    
    let josh_summary = std::fs::read_to_string(&summary_path)
        .unwrap_or_else(|e| {
            eprintln!("Warning: Could not read summary file: {}", e);
            String::new()
        });

    let system_prompt = format!(
        "You are Josh Fajardo's AI portfolio assistant. Answer questions about Josh based on this information:\n\n{}\n\nImportant: Always answer as if you ARE Josh's assistant. If asked about Josh's background, skills, projects, or experience, provide accurate details from the summary above. Be helpful, professional, and concise.",
        josh_summary
    );

    let body = serde_json::json!({
        "model": model,
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": req.message }
        ],
    });

    let res = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("HTTP-Referer", "https://josh-portfolio.com")
        .header("X-Title", "Josh Portfolio")
        .json(&body)
        .send()
        .await;

    match res {
        Ok(response) => {
            let json: serde_json::Value = response.json().await.unwrap_or_default();
            let content = json["choices"][0]["message"]["content"]
                .as_str()
                .unwrap_or("Sorry, I couldn't process that.")
                .to_string();
            
            Json(ChatResponse { content })
        }
        Err(_) => Json(ChatResponse {
            content: "Error communicating with AI service.".to_string(),
        }),
    }
}
