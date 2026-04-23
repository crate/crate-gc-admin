# Architecture

**Analysis Date:** 2026-04-23

## Pattern

Feature-sliced React SPA with a layered architecture:
- **Routes** — page-level features (colocated components, views, hooks)
- **Shared components** — reusable UI primitives in `src/components/`
- **Hooks** — data-fetching and business logic encapsulation
- **State** — Zustand stores for global app state
- **Utils** — pure helper functions

## Entry Points

- `src/main.tsx` — React DOM root render, wraps app in `BrowserRouter`
- `src/App.tsx` — Top-level routing, auth check, layout shell
- `src/index.ts` — Library entry point (for use as npm package via `vite.config.lib.ts`)

## Layers / Modules

**Routing layer (`src/routes/`)**
- Each route directory is a self-contained feature: `Auth`, `Automation`, `Nodes`, `Overview`, `SQLConsole`, `Tables`, `TablesShards`, `Users`, `Help`
- Route directories own their views, subcomponents, and feature-specific hooks
- Registered in `src/constants/routes.ts`, rendered in `App.tsx`

**Shared UI layer (`src/components/`)**
- ~40 reusable components: `Card`, `Button`, `DataTable`, `SQLEditor`, `StatusBar`, `Layout`, etc.
- Each component has its own directory with `index.ts` barrel export
- Design system mix: Ant Design + shadcn/ui (Tailwind-based)

**Data fetching layer (`src/swr/`, `src/hooks/`)**
- SWR-based hooks for CrateDB cluster data: `useClusterInfo`, `useSchemas`, `useTables`, `useShards`, etc.
- Custom hooks in `src/hooks/`: `useExecuteSql`, `useExecuteMultiSql`, `useApiCall`, `queryHooks.ts`
- `src/hooks/useGcApi.ts` creates an Axios instance with JWT auth header injected via interceptor

**State layer (`src/state/`)**
- Zustand stores:
  - `jwtManager.ts` — JWT tokens, GC URL, connection status, login/logout
  - `session.ts` — UI notifications, table display format, error trace toggle
  - `clusterHealth.ts` — cluster health polling state

**API layer (`src/utils/api.ts`)**
- `apiGet`, `apiPost`, `apiPut`, `apiDelete` wrappers over Axios
- Standardized `ApiOutput<T>` return type: `{ success, data, status }`
- Centralized error handling with auto-dispatch to session notification store

## Data Flow

```
User interaction
  → Route/View component
    → Custom hook (useExecuteSql / SWR hook)
      → useGcApi() [Axios instance with JWT interceptor]
        → CrateDB GC API (REST)
          ← Response
        ← ApiOutput<T>
      ← { data, loading } or ApiOutput
    ← Rendered UI with data
```

Auth flow:
```
App mounts → check JWT in jwtManager store
  → if no token → redirect to /auth, show login
  → if token → call GET /api/ to verify → set ConnectionStatus
```

## Key Abstractions

- **`ApiOutput<T>`** (`src/utils/api.ts`) — unified API response wrapper `{ success: boolean, data: T, status: number }`
- **`useGcApi()`** (`src/hooks/useGcApi.ts`) — returns configured Axios instance; all authenticated requests go through this
- **`useJWTManagerStore`** (`src/state/jwtManager.ts`) — Zustand store owning auth state (token, url, status)
- **`useSessionStore`** (`src/state/session.ts`) — Zustand store for transient UI state (notifications, display prefs)
- **`ConnectionStatus`** (`src/types/`) — enum: `CONNECTED | NOT_LOGGED_IN | ERROR`

## State Management

- **Zustand** for global state (auth, notifications, cluster health)
- **SWR** for remote data fetching and caching (cluster info, tables, shards)
- **Local component state** (`useState`) for form inputs and ephemeral UI
- **localStorage** used by `SQLEditor` for SQL history persistence

## Build Configuration

- **App build:** `vite.config.ts` → single-page app output
- **Library build:** `vite.config.lib.ts` → exports components as npm package
- **Docker:** `Dockerfile` for containerized deployment behind nginx (`conf/`)
