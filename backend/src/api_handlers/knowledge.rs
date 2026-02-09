use axum::{
    extract::Query,
    response::Json,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::db::AppState;

#[derive(Serialize, Deserialize, Clone)]
pub struct KnowledgeSection {
    pub title: String,
    pub content: String,
}

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

pub fn router(_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/search", get(search_knowledge))
}

async fn search_knowledge(
    Query(params): Query<SearchQuery>,
) -> Json<Vec<KnowledgeSection>> {
    let query = params.q.to_lowercase();
    let sections = parse_knowledge_file();
    
    let results: Vec<KnowledgeSection> = sections
        .into_iter()
        .filter(|s| {
            s.title.to_lowercase().contains(&query) || 
            s.content.to_lowercase().contains(&query)
        })
        .collect();

    Json(results)
}

fn parse_knowledge_file() -> Vec<KnowledgeSection> {
    // summary_of_me.md is in the root directory, backend is in /backend
    let path = std::env!("CARGO_MANIFEST_DIR").to_owned() + "/../summary_of_me.md";
    let content = std::fs::read_to_string(path).unwrap_or_default();
    
    let mut sections = Vec::new();
    let mut current_title = String::from("Introduction");
    let mut current_content = Vec::new();

    for line in content.lines() {
        if line.starts_with("## ") {
            if !current_content.is_empty() {
                sections.push(KnowledgeSection {
                    title: current_title.clone(),
                    content: current_content.join("\n").trim().to_string(),
                });
                current_content.clear();
            }
            current_title = line.trim_start_matches("## ").to_string();
        } else if line.starts_with("# ") {
            // Skip H1 (The main title)
            continue;
        } else {
            current_content.push(line);
        }
    }

    // Push the last section
    if !current_content.is_empty() {
        sections.push(KnowledgeSection {
            title: current_title,
            content: current_content.join("\n").trim().to_string(),
        });
    }

    sections
}
