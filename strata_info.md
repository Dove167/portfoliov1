# SRP Frontend — Strata Reserve Planning

A data collection portal for Strata Reserve Planning, built for managing strata corporations, inspections, surveys, documents, and timelines across multiple user roles.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Routing | React Router DOM 7 |
| Auth & Database | Supabase |
| Styling | SCSS / Sass with Stylelint |
| Notifications | React Hot Toast |
| Drag & Drop | dnd-kit |

---

## Project Structure

```
src/
├── shared/               # Shared across all roles
│   ├── components/       # Reusable UI components (BookingCalendar, Modal, DataTable, etc.)
│   ├── contexts/         # AuthContext — global auth state
│   ├── hooks/            # Custom hooks (useAuth, useFileNumbers, useClientDocuments, etc.)
│   ├── lib/              # Core utilities (supabaseClient, apiClient, documentService)
│   ├── pages/            # Public pages (Login, ResetPassword, SetPassword, Help, etc.)
│   ├── routes/           # Route definitions and guards (ProtectedRoute, DashboardRouter)
│   ├── styles/           # Global SCSS variables, utilities, and component styles
│   └── types/            # Shared TypeScript interfaces
│
├── admin/                # Admin-only features
│   ├── components/       # Admin modals & components
│   ├── hooks/            # Admin-specific hooks
│   ├── pages/            # Dashboard, Strata, Users, Appointments, Documents, Questions, Timelines, Profile
│   └── routes/           # Admin route definitions
│
└── client/               # Client-facing features
    ├── components/       # Client-specific UI components
    ├── pages/            # Dashboard, Documents, Survey, StrataInformation, Timelines, InspectionDate
    └── routes/           # Client route definitions
```

---

## User Roles

| Role | user_type_id | Access |
|---|---|---|
| Admin | 1 | Full system access |
| Inspector | 2 | Inspection scheduling |
| Client | 3 | Surveys, documents, strata info |
| Assistant | 4 | Support role, can manage questions |

Role-based routing is enforced via the `<ProtectedRoute>` component using `requireAdmin`, `requireClient`, and `allowedRoles` props.

---

## Routes

**Public**
- `/login` — Authentication
- `/set-password` — First-time password setup (via invite link)
- `/reset-password` — Password recovery
- `/auth/callback` — OAuth / email link callback
- `/accept-invite` — Invitation acceptance

**Admin** (`/admin/...`)
- `dashboard`, `strata`, `strata/:id`, `users`, `appointments`, `documents`, `questions`, `timelines`, `profile`

**Client** (`/client/...`)
- `dashboard`, `strata-information`, `strata-members`, `documents`, `survey`, `survey/:section`, `timelines`, `inspection-date`

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running instance of the SRP backend (default: `http://localhost:3000`)
- A Supabase project

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Authentication

Authentication is handled by Supabase using the **implicit auth flow**, which supports server-generated email invite and password recovery links without requiring client-side code verifiers.

After login, the app fetches the user's profile from the `profiles` table to determine their role and populate auth context. The auth system includes:

- Race condition prevention via a generation counter (`signOutGenerationRef`) that discards in-flight profile fetches on logout
- A backend warmup step that waits for the backend `/health` endpoint before displaying the app
- Helpers: `isAdmin`, `isInspector`, `isAssistant`, `isClient`

---

## API Client

All requests to the backend go through `src/shared/lib/apiClient.ts`, which wraps `fetch` with:

- GET, POST, PUT, DELETE helpers
- Request timeout support with `AbortSignal`
- A public client for unauthenticated endpoints
- Expects responses in the shape `{ success: boolean, data: T, error?: string }`

---

## Styling

SCSS is used throughout the project with strict linting via Stylelint (`stylelint-config-standard-scss`). Conventions:

- Variables follow the pattern `$[a-z0-9-]+`
- Maximum nesting depth of 3
- Styles are split into variables, utilities, components, and page-level files
