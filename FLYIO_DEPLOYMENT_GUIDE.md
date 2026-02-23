# Deploying Rust + Astro to Fly.io

This guide documents how to deploy a full-stack application with Astro (frontend) and Rust/Axum (backend) to Fly.io.

## Prerequisites

- [Fly.io Account](https://fly.io/signup)
- [Fly CLI installed](https://fly.io/docs/flyctl/install/)
- Rust toolchain (rustc, cargo)
- Node.js (for Astro)

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Fly.io CLI Basics](#flyio-cli-basics)
3. [Project Structure](#project-structure)
4. [Configuration Files](#configuration-files)
5. [Environment Variables](#environment-variables)
6. [Deployment](#deployment)
7. [Monitoring & Logs](#monitoring--logs)
8. [Troubleshooting](#troubleshooting)
9. [OpenRouter API Setup](#openrouter-api-setup)

---

## Initial Setup

### Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export FLYCTL_INSTALL="$HOME/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"
```

### Authenticate

```bash
fly auth login
```

### Create a New App

```bash
# Create app in existing directory
fly apps create josh-portfolio

# Or launch with preset resources
fly launch --name josh-portfolio --region ord --memory 1gb
```

---

## Fly.io CLI Basics

| Command | Description |
|---------|-------------|
| `flyctl auth login` | Authenticate with Fly.io |
| `fly apps list` | List all your apps |
| `fly apps create <name>` | Create a new app |
| `fly secrets list -a <app>` | List secrets for an app |
| `fly secrets set KEY=value -a <app>` | Set a secret |
| `fly secrets unset KEY -a <app>` | Remove a secret |
| `fly deploy` | Deploy the app |
| `fly logs -a <app>` | View application logs |
| `fly ssh console -a <app>` | SSH into the machine |
| `fly status -a <app>` | Check deployment status |
| `fly machines list -a <app>` | List running machines |
| `fly machine stop <machine-id> -a <app>` | Stop a machine |
| `fly machine restart <machine-id> -a <app>` | Restart a machine |

---

## Project Structure

```
outkast-main/
├── backend/                    # Rust Axum backend
│   ├── src/
│   │   ├── main.rs            # App entry point & routing
│   │   ├── api_handlers/     # API route handlers
│   │   │   ├── chat.rs       # Chat endpoint
│   │   │   ├── contact.rs    # Contact form
│   │   │   ├── projects.rs   # Projects API
│   │   │   └── ...
│   │   └── db.rs             # Database setup
│   ├── Cargo.toml            # Rust dependencies
│   └── target/               # Build output
├── src/                       # Astro frontend
│   ├── pages/                # Astro pages
│   ├── components/           # React/Astro components
│   └── ...
├── dist/                      # Built static files (generated)
├── Dockerfile                # Multi-stage Docker build
├── fly.toml                  # Fly.io configuration
└── package.json              # Node dependencies
```

---

## Configuration Files

### fly.toml

```toml
app = 'josh-portfolio'
primary_region = 'ord'

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
  memory_mb = 1024
```

Key settings:
- `internal_port`: Must match the port your app listens on (8080 for Axum)
- `primary_region`: Your primary deployment region (ord = Oregon)
- `auto_stop_machines`: Saves costs by stopping idle machines

### Dockerfile (Multi-stage Build)

```dockerfile
# Stage 1: Build Astro frontend
FROM node:25.6.0-slim AS astro-build

WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Rust backend
FROM rust:1.84 AS rust-build

WORKDIR /app/backend
COPY backend/Cargo.toml .
COPY backend/src ./src/
COPY --from=astro-build /app/summary_of_me.md ./
COPY --from=astro-build /app/dist ./dist/
RUN cargo build --release

# Stage 3: Final runtime image
FROM debian:bookworm-slim AS runtime

RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=rust-build /app/backend/target/release/josh-portfolio-backend /app/portfolio-backend
COPY --from=rust-build /app/backend/summary_of_me.md ./
COPY --from=astro-build /app/dist /app/dist

ENV PUBLIC_HOST="0.0.0.0:8080"
EXPOSE 8080

CMD ["./portfolio-backend"]
```

### Backend main.rs (Static File Serving)

```rust
use tower_http::services::ServeDir;

let public_path = "/app/dist";
let fallback_service = ServeDir::new(public_path)
    .append_index_html_on_directories(true);

let app = Router::new()
    .nest("/api", api_handlers::chat::router(app_state.clone()))
    .fallback(get(|req: Request| async move {
        // Serve static files for all non-API routes
        fallback_service.oneshot(req).await
    }))
    .layer(compression_layer)
    .layer(cors_layer);
```

---

## Environment Variables

### Setting Secrets

```bash
# API Keys and sensitive data
fly secrets set OPENROUTER_API_KEY="sk-or-v1-..." -a josh-portfolio
fly secrets set OPENROUTER_MODEL="google/gemini-2.0-flash-lite-preview-02-05:free" -a josh-portfolio

# View secrets
fly secrets list -a josh-portfolio
```

### App Configuration

```bash
# For local development, use .env file
echo "OPENROUTER_API_KEY=sk-or-v1-..." > .env

# For production, Fly.io secrets are automatically available
# No need to set PUBLIC_HOST in Fly.io - it's in fly.toml
```

---

## Deployment

### First Deployment

```bash
# Make sure you're in the project root
cd /home/jpfaj/projects/outkast-main

# Deploy
fly deploy
```

### Subsequent Deployments

```bash
# Just run deploy - it will rebuild and deploy
fly deploy

# Deploy with specific Docker build options
fly deploy --build-only  # Just build, don't deploy
fly deploy --image-tag v1.0.0  # Tag the image
```

### Deploy from Local Build

```bash
# Build locally first
cd backend && cargo build --release

# Then deploy
fly deploy --local-only
```

---

## Monitoring & Logs

### View Logs

```bash
# Real-time logs
fly logs -a josh-portfolio

# Last 100 lines
fly logs -a josh-portfolio -n 100

# JSON output (for parsing)
fly logs -a josh-portfolio --json

# Filter by machine
fly logs -a josh-portfolio --machine <machine-id>
```

### Check Status

```bash
# Deployment status
fly status -a josh-portfolio

# Machine status
fly machines list -a josh-portfolio
```

### SSH into Machine

```bash
# Interactive shell
fly ssh console -a josh-portfolio

# Run a command
fly ssh console -a josh-portfolio -C "ls -la /app"
fly ssh console -a josh-portfolio -C "cat /app/summary_of_me.md"
```

---

## Troubleshooting

### Port Issues

If you see `InvalidHeaderValue` or connection errors:

```rust
// Make sure you're listening on the correct port
let port = std::env::var("PORT")
    .unwrap_or_else(|_| "8080".to_string())
    .parse()
    .unwrap();

let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
```

### Static Files Not Serving

```bash
# Check if files exist in the container
fly ssh console -a josh-portfolio -C "ls -la /app/dist/"
fly ssh console -a josh-portfolio -C "ls -la /app/dist/index.html"
```

### Database Issues

```bash
# Check database file
fly ssh console -a josh-portfolio -C "ls -la /app/"
fly ssh console -a josh-portfolio -C "file /app/portfolio.db"
```

### Out of Memory

Increase memory in `fly.toml`:

```toml
[[vm]]
  memory = '2gb'  # Increase from 1gb
  cpu_kind = 'shared'
  cpus = 2
```

---

## OpenRouter API Setup

### Getting an API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to [Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-...`)

### Setting the API Key

```bash
fly secrets set OPENROUTER_API_KEY="sk-or-v1-your-key-here" -a josh-portfolio
```

### Choosing a Model

```bash
# Set a specific model
fly secrets set OPENROUTER_MODEL="google/gemini-2.0-flash-lite-preview-02-05:free" -a josh-portfolio

# Popular free models:
# - google/gemini-2.0-flash-lite-preview-02-05:free
# - nvidia/nemotron-3-nano-30b-a3b:free
# - deepseek/deepseek-chat:free
```

### Chat Handler Code (To Re-enable)

The chat handler is in `backend/src/api_handlers/chat.rs`:

```rust
use reqwest::Client;
use serde_json::json;

async fn handle_chat(Json(req): Json<ChatRequest>) -> impl IntoResponse {
    let api_key = std::env::var("OPENROUTER_API_KEY")
        .expect("OPENROUTER_API_KEY must be set");
    let model = std::env::var("OPENROUTER_MODEL")
        .unwrap_or_else(|_| "google/gemini-2.0-flash-lite-preview-02-05:free".to_string());

    let client = Client::new();

    let body = json!({
        "model": model,
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": req.message }
        ],
    });

    let response = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await;

    // Handle response...
}
```

### Re-enabling the Chat

1. Set your OpenRouter API key:
   ```bash
   fly secrets set OPENROUTER_API_KEY="sk-or-v1-your-key" -a josh-portfolio
   ```

2. Restore the chat handler code (the placeholder is currently in place)

3. Add dependencies to `backend/Cargo.toml`:
   ```toml
   reqwest = { version = "0.11", features = ["json"] }
   serde_json = "1.0"
   tracing = "0.1"
   ```

4. Deploy:
   ```bash
   fly deploy
   ```

5. Test:
   ```bash
   curl -X POST https://josh-portfolio.fly.dev/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}'
   ```

### Troubleshooting OpenRouter

If you see `InvalidHeaderValue` errors:

1. **Check the API key format** - Some keys have special characters that cause issues
2. **Try without optional headers** (Referer, X-Title) to isolate the issue
3. **Verify the key works locally**:
   ```bash
   curl https://openrouter.ai/api/v1/models \
     -H "Authorization: Bearer sk-or-v1-your-key"
   ```
4. **Check OpenRouter status** - There may be outages

---

## Cost Management

### Free Tier

Fly.io offers:
- 3 shared-CPU VMs
- 3GB volume storage
- 160GB bandwidth/month

### Reduce Costs

```bash
# Stop machines when not in use
fly machine stop <machine-id> -a josh-portfolio

# Configure auto-stop
fly machine update <machine-id> -a josh-portfolio \
  --autostart \
  --autostop
```

### Check Usage

```bash
fly dashboard  # Opens Fly.io web dashboard
```

---

## Quick Reference

```bash
# Setup
fly auth login
fly apps create josh-portfolio

# Secrets
fly secrets set OPENROUTER_API_KEY="..." -a josh-portfolio
fly secrets list -a josh-portfolio

# Deploy
cd /home/jpfaj/projects/outkast-main
fly deploy

# Monitor
fly logs -a josh-portfolio
fly status -a josh-portfolio
fly ssh console -a josh-portfolio

# Manage machines
fly machines list -a josh-portfolio
fly machine stop <id> -a josh-portfolio
fly machine restart <id> -a josh-portfolio
```

---

## Useful Links

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io CLI Reference](https://fly.io/docs/flyctl/)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Axum Framework](https://docs.rs/axum/latest/axum/)
- [Astro Documentation](https://docs.astro.build/)

---

*Last updated: February 2026*
