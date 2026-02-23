mod api_handlers;
mod db;

use crate::db::AppState;
use axum::{
    extract::{OriginalUri, Request},
    routing::get,
    RequestPartsExt, Router,
};
use dotenv::dotenv;
use std::sync::Arc;
use tower::util::ServiceExt;
use tower_http::compression::CompressionLayer;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tracing_subscriber::fmt;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    dotenv().ok();

    // Initialize tracing
    fmt::init();

    let api_host = std::env::var("PUBLIC_HOST").unwrap_or_else(|_| "localhost:3000".to_string());

    let app_state = Arc::new(AppState::new().expect("Failed to initialize database"));

    // Serve static files from the dist folder (where Astro builds to)
    let public_path = "/app/dist";
    println!("Serving static files from: {}", public_path);
    let fallback_service = ServeDir::new(public_path).append_index_html_on_directories(true);

    let compression_layer = CompressionLayer::new().gzip(true);
    let cors_layer = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        // API routes
        .nest("/api/contact", api_handlers::contact::router(app_state.clone()))
        .nest("/api/admin", api_handlers::admin::router(app_state.clone()))
        .nest("/api/projects", api_handlers::projects::router(app_state.clone()))
        .nest("/api/knowledge", api_handlers::knowledge::router(app_state.clone()))
        .nest("/api/chat", api_handlers::chat::router(app_state.clone()))
        // Static files fallback (serves the Astro frontend)
        .fallback(get(|req: Request| async move {
            let (mut parts, body) = req.into_parts();
            let uri: OriginalUri = parts.extract().await?;
            let req = Request::from_parts(parts, body);
            match fallback_service.oneshot(req).await {
                Ok(mut res) => {
                    if uri.path().contains("/_static/") {
                        res.headers_mut()
                            .insert("Cache-Control", "public, max-age=31536000".parse().unwrap());
                    }
                    Ok(res)
                }
                Err(e) => Err(e),
            }
        }))
        .layer(compression_layer)
        .layer(cors_layer);

    let listener = tokio::net::TcpListener::bind(api_host.clone()).await.unwrap();
    println!("🚀 Portfolio server running on http://{}", api_host);
    axum::serve(listener, app).await.unwrap();
}
