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

    conn.execute(
        "INSERT INTO contacts (name, email, subject, message) VALUES (?1, ?2, ?3, ?4)",
        [&request.name, &request.email, &request.subject, &request.message],
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    drop(conn);

    let name = request.name.clone();
    let email = request.email.clone();
    let subject = request.subject.clone();
    let message = request.message.clone();

    tokio::spawn(async move {
        let _ = send_mailgun_email(&name, &email, &subject, &message).await;
    });

    Ok(JsonResponse(ContactResponse {
        success: true,
        message: "Thank you! Your message has been received.".to_string(),
    }))
}

async fn send_mailgun_email(name: &str, email: &str, subject: &str, message: &str) -> Result<(), String> {
    use reqwest::Client;

    let api_key = std::env::var("MAILGUN_API_KEY")
        .map_err(|_| "MAILGUN_API_KEY not set")?;
    let domain = std::env::var("MAILGUN_DOMAIN")
        .map_err(|_| "MAILGUN_DOMAIN not set")?;
    let recipient = std::env::var("CONTACT_EMAIL")
        .unwrap_or_else(|_| "jfajardo7@my.bcit.ca".to_string());

    tracing::info!("Sending email via Mailgun: domain={}, to={}", domain, recipient);

    let client = Client::new();
    let url = format!("https://api.mailgun.net/v3/{}/messages", domain);

    let form_params = [
        ("from", format!("Portfolio Contact <mailgun@{}>", domain)),
        ("to", recipient.clone()),
        ("subject", format!("{} - {}", subject, name)),
        ("text", format!("From: {} <{}>\n\n{}", name, email, message)),
    ];

    let response = client
        .post(&url)
        .basic_auth("api", Some(&api_key))
        .form(&form_params)
        .send()
        .await
        .map_err(|e| format!("Failed to send email: {}", e))?;

    let status = response.status();
    let body = response.text().await.unwrap_or_default();
    tracing::info!("Mailgun response: status={}, body={}", status, body);

    if !status.is_success() {
        return Err(format!("Mailgun error: {} - {}", status, body));
    }

    Ok(())
}
