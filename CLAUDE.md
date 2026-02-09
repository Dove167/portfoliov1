# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered personal portfolio for Josh Fajardo ("The Phoenix Developer"). Hybrid architecture: Astro + React frontend served by a Rust/Axum backend, with SQLite for persistence and OpenRouter for AI chat.

## Build & Development Commands

```bash
# Install frontend dependencies
npm install

# Development
npm run dev                # Astro dev server only (frontend)
npm run backend            # Watch & run Rust backend (cargo watch)
npm run backend:build      # Build Rust release binary

# Full pipeline: build frontend → build backend → run server
npm run launch

# Build frontend to dist/
npm run build

# Run Rust backend directly
cd backend && cargo run
cd backend && cargo run --release

# Run Rust tests
cd backend && cargo test
```

## Architecture

### Frontend (Astro + React)

- **Framework:** Astro v4 with React integration for interactive components
- **Styling:** Tailwind CSS v4 with a custom 4-color palette (darkblue, navy, tan, beige) defined in `src/styles/global.css`
- **Pages:** `src/pages/` — Astro file-based routing (index, projects, resume, contact, chat, admin/)
- **Components:** `src/components/` — Mix of `.astro` and `.tsx` (React) components
- **Path alias:** `@/*` maps to `src/*` in imports
- **Key component:** `AIChat.tsx` — floating chat widget (Ctrl+Q toggle) that calls `/api/chat`
- **Data:** `src/data/projects.json` — featured project entries

### Backend (Rust + Axum)

Located in `backend/`. Single-binary server that handles API routes and serves the Astro `dist/` folder as a static fallback.

**Source structure:**
- `src/main.rs` — server setup, routing, middleware (CORS, gzip, static files, cache headers)
- `src/db.rs` — SQLite schema init and connection (tables: contacts, projects, admin_users)
- `src/api_handlers/` — route handlers split by domain:
  - `chat.rs` — proxies to OpenRouter API using `summary_of_me.md` as system context
  - `contact.rs` — saves contact form submissions to SQLite
  - `projects.rs` — CRUD for projects
  - `admin.rs` — admin login (bcrypt) and contact management
  - `knowledge.rs` — searches `summary_of_me.md` sections by query string

### Data Flow

1. Astro builds static HTML/CSS/JS into `dist/`
2. Rust backend serves `dist/` as fallback for non-API routes
3. React components make fetch calls to `/api/*` endpoints
4. Chat endpoint reads `summary_of_me.md` (repo root) and forwards to OpenRouter API

## Environment Variables

Set in `backend/.env`:

- `OPENROUTER_API_KEY` — required for AI chat
- `OPENROUTER_MODEL` — model ID (default: `google/gemini-2.0-flash-lite-preview-02-05:free`)
- `PUBLIC_HOST` — server bind address (default: `localhost:3000`)

## Key Files

- `summary_of_me.md` — Josh's background info, consumed by chat AI and knowledge search endpoint
- `.pages.yml` — Pages CMS collection config
- `opencode.json` — MCP tool integrations (Context7, Exa)
