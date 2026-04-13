# SRP Backend

REST API for the **Strata Reserve Planning (SRP)** application — a platform for managing strata property reserves, inspections, appointments, document submissions, and client surveys.

Built with [Hono](https://hono.dev/), TypeScript, Prisma ORM, and Supabase Auth, deployed on [Render](https://render.com/).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Server](#running-the-server)
- [API Overview](#api-overview)
  - [Health Check](#health-check)
  - [Public Routes](#public-routes)
  - [Authenticated Routes](#authenticated-routes)
  - [Admin Routes](#admin-routes)
  - [Client Routes](#client-routes)
- [Authentication & Authorization](#authentication--authorization)
- [Email Notifications](#email-notifications)
- [Scripts](#scripts)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Hono](https://hono.dev/) 4.x |
| Language | TypeScript (CommonJS output) |
| ORM | [Prisma](https://www.prisma.io/) 7.x |
| Database | PostgreSQL (via Supabase) |
| Auth | [Supabase Auth](https://supabase.com/auth) (JWT) |
| Email | [Resend](https://resend.com/) |
| PDF Generation | [PDFKit](https://pdfkit.org/) |
| Runtime | Node.js |
| CI | GitHub Actions (Super Linter) |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Prisma migration history
│   └── seeds/                 # Seed and reset scripts
├── src/
│   ├── index.ts               # App entry point, middleware, route mounting
│   ├── admin/
│   │   ├── controllers/       # Admin business logic handlers
│   │   └── routes/            # Admin route definitions
│   ├── client/
│   │   ├── controllers/       # Client business logic handlers
│   │   └── routes/            # Client route definitions
│   └── shared/
│       ├── config/            # Route exemption configs for RBAC
│       ├── constants/         # Validation patterns, location codes, rules
│       ├── controllers/       # Shared controllers (lookups, help, notifications)
│       ├── helpers/           # Date utilities, response formatting, parsers
│       ├── lib/               # Prisma client, Supabase client, email service
│       ├── middleware/        # Auth, role checks, delete restrictions
│       ├── routes/            # Shared public and authenticated routes
│       ├── services/          # Core business logic services (22+)
│       └── types/             # TypeScript interfaces (email, appointments, etc.)
├── .github/
│   └── workflows/
│       └── super-linter.yml   # Lint CI pipeline
├── package.json
├── tsconfig.json
└── prisma.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A Supabase project (for auth and hosted PostgreSQL)
- A Resend account (for transactional email)

### Installation

```bash
git clone https://github.com/IDSP-Strata-Reserve-Planning/backend.git
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Supabase
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# PostgreSQL (via Supabase connection pooler)
DATABASE_URL=postgresql://postgres.<your-project>:<password>@<host>:6543/postgres?pgbouncer=true

# Email (Resend)
RESEND_API_KEY=re_<your-key>
RESEND_FROM_EMAIL=Your App <noreply@yourdomain.com>
ADMIN_EMAIL=admin@yourdomain.com

# App
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:5173
```

### Database Setup

Apply migrations and seed the database:

```bash
# Apply all pending migrations
npx prisma migrate deploy

# Seed with sample data
npx prisma db seed

# (Optional) Reset database for development
npx tsx prisma/seeds/reset.ts
```

### Running the Server

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm run start
```

The server listens on `http://localhost:3000` by default.

---

## API Overview

### Health Check

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ status: "ok" }` |

### Public Routes

No authentication required.

| Prefix | Description |
|---|---|
| `/public/*` | Public help resources |

### Authenticated Routes

Require a valid Supabase JWT (`Authorization: Bearer <token>`).

| Prefix | Description |
|---|---|
| `/api/lookups/*` | Reference/lookup data (user types, property types, sections, services, document types, etc.) |
| `/api/*` | Help resources |

### Admin Routes

Require auth + an internal user role (Administrator, Inspector, or Assistant). Delete operations are restricted to Administrators. Inspectors are read-only on most routes.

| Prefix | Description |
|---|---|
| `/admin/strata` | Strata property CRUD, notes, sections, employees, timelines |
| `/admin/users` | User management |
| `/admin/appointments` | Appointment scheduling |
| `/admin/inspector-availability` | Inspector availability configuration |
| `/admin/company-holidays` | Company holiday management |
| `/admin/documents` | Document management |
| `/admin/file-numbers` | File number management |
| `/admin/surveys` | Survey management |
| `/admin/questions` | Survey question management |
| `/admin/document-requirements` | Document requirement definitions per property type |
| `/admin/survey-questions` | File-number-specific survey questions |
| `/admin/document-reviews` | Document review tracking |
| `/admin/property-type-requests` | Property type change requests |
| `/admin/activation-requests` | Account activation request management |
| `/admin/notifications` | Notification management |

### Client Routes

Require auth with a Client role.

| Prefix | Description |
|---|---|
| `/client/*` | Active file numbers |
| `/client/profile/*` | Profile management |
| `/client/documents/*` | Document uploads and submission status |
| `/client/surveys/*` | Survey responses |
| `/client/appointments/*` | Appointment booking |
| `/client/notifications/*` | In-app notifications |

---

## Authentication & Authorization

Authentication is handled via **Supabase Auth** JWT tokens passed as `Authorization: Bearer <token>` headers.

Role-based access is enforced through layered middleware:

| Middleware | Purpose |
|---|---|
| `authMiddleware` | Validates JWT with Supabase; attaches user profile to context |
| `internalUserMiddleware` | Restricts routes to internal roles (Admin, Inspector, Assistant) |
| `adminAssistantOnlyMiddleware` | Blocks inspectors from specific admin-only operations |
| `inspectorReadOnlyMiddleware` | Prevents inspectors from performing write operations |
| `noDeleteMiddleware` | Restricts DELETE operations to Administrators, with configurable exemptions |

**User Roles** (mapped via `userTypeId`):

| ID | Role |
|---|---|
| 1 | Administrator |
| 2 | Inspector |
| 3 | Client |
| 4 | Assistant |

---

## Email Notifications

Transactional emails are sent via [Resend](https://resend.com/). Triggered events include:

- New strata property created
- File number created
- Document review completed
- Appointment booked or cancelled
- Survey/document finalization
- Property type update
- Account activation requests and approvals

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Generate Prisma client + compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npx prisma migrate deploy` | Apply pending database migrations |
| `npx prisma db seed` | Seed the database with sample data |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
