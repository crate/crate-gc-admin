<!-- refreshed: 2026-05-19 -->
# Architecture

**Analysis Date:** 2026-05-19

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser SPA                                │
│                      `src/main.tsx` (entry)                         │
├───────────────────────────────┬─────────────────────────────────────┤
│        App Shell              │          Route Views                │
│  `src/App.tsx`                │  `src/routes/` (PascalCase dirs)   │
│  Layout, Nav, StatusBar       │  Auth, Overview, SQLConsole,        │
│  ClusterHealthManager         │  Tables, TablesShards, Nodes,       │
│  NotificationHandler          │  Users, Automation/*               │
└────────────┬──────────────────┴──────────────────┬──────────────────┘
             │                                     │
             ▼                                     ▼
┌────────────────────────┐         ┌───────────────────────────────────┐
│     Shared Components  │         │      Data Fetching Layer          │
│  `src/components/`     │         │  SWR hooks  `src/swr/jwt/`        │
│  ~50 UI components     │         │  Axios API  `src/hooks/`          │
│  (design system)       │         │  Direct SQL `useExecuteSql.ts`    │
└────────────────────────┘         └──────────────┬────────────────────┘
                                                  │
             ┌────────────────────────────────────┘
             ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Global State (Zustand)                           │
│  `src/state/jwtManager.ts`   Auth + cluster URL management         │
│  `src/state/clusterHealth.ts` Node health metrics cache            │
│  `src/state/session.ts`       UI notifications + display prefs     │
└────────────────────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────┐
│                    External Backends                                │
│  CrateDB HTTP API  `/_sql` (direct SQL queries)                    │
│  Grand Central API `/api/*` (REST — scheduled jobs, policies)      │
└────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| App | Root shell, routing, connection check | `src/App.tsx` |
| Layout | Sidebar nav + topbar frame | `src/components/Layout/Layout.tsx` |
| ClusterHealthManager | Polls node status, writes to health store | `src/components/ClusterHealthManager/ClusterHealthManager.tsx` |
| NotificationHandler | Renders toast notifications from session store | `src/components/NotificationHandler/NotificationHandler.tsx` |
| EnterpriseScreen | Guards enterprise-only routes by GC connection status | `src/components/EnterpriseScreen/EnterpriseScreen.tsx` |
| StatusBar | Topbar cluster connection indicator | `src/components/StatusBar/StatusBar.tsx` |
| useJWTManagerStore | JWT auth, cluster URL, connection status | `src/state/jwtManager.ts` |
| useClusterHealthStore | Node load/fs stats accumulation | `src/state/clusterHealth.ts` |
| useSessionStore | Toast notifications + SQL display prefs | `src/state/session.ts` |
| useExecuteSql | Raw POST to CrateDB `/_sql` endpoint | `src/hooks/useExecuteSql.ts` |
| useExecuteMultiSql | Multi-statement parse + sequential SQL execution | `src/hooks/useExecuteMultiSql.ts` |
| useGcApi | Axios instance with JWT Bearer auth for GC REST API | `src/hooks/useGcApi.ts` |
| swr/jwt/* | SWR data hooks that query CrateDB `sys.*` tables via SQL | `src/swr/jwt/` |
| swrHooks (hooks/) | SWR data hooks for Grand Central REST API endpoints | `src/hooks/swrHooks.ts` |

## Pattern Overview

**Overall:** Single-Page Application (SPA) — React 19 with client-side routing via React Router v6.

**Key Characteristics:**
- Dual-mode deployment: standalone admin UI (local CrateDB connection) and embedded cloud component (CrateDB Cloud with JWT auth)
- Ships as both a runnable SPA (`vite build`) and a publishable npm library (`vite build --config vite.config.lib.ts`)
- Feature access gated by GC (Grand Central) connection status via `EnterpriseScreen`
- No server-side rendering — all data fetching happens in the browser

## Layers

**Route Views:**
- Purpose: Page-level components corresponding to URL paths
- Location: `src/routes/`
- Contains: Route component folders (Auth, Automation, Help, Nodes, Overview, SQLConsole, Tables, TablesShards, Users)
- Depends on: shared components, hooks, swr hooks, state stores
- Used by: `src/constants/routes.tsx` (route config), `src/App.tsx`

**Shared Component Library:**
- Purpose: Reusable UI primitives and composite widgets
- Location: `src/components/`
- Contains: ~50 components from primitives (Button, Input, Label) to complex (SQLEditor, DataTable, GCChart)
- Depends on: Ant Design, Radix UI, TanStack Table, Recharts, Tailwind CSS
- Used by: route views, App shell

**Data Fetching — SWR/CrateDB SQL:**
- Purpose: Fetch cluster metrics and schema data by running SQL against `sys.*` tables
- Location: `src/swr/jwt/`
- Contains: `useClusterNodeStatus`, `useClusterInfo`, `useTables`, `useTablesShards`, `useShards`, `useAllocations`, `useSchemaTree`, `useCurrentUser`, `useQueryStats`, `useUsersRoles`
- Depends on: `swrJWTFetch.ts`, `useJWTManagerStore` (for auth headers and cluster URL)
- Used by: route views, `ClusterHealthManager`

**Data Fetching — SWR/GC REST API:**
- Purpose: Fetch Grand Central automation data (scheduled jobs, table policies, logs)
- Location: `src/hooks/swrHooks.ts`
- Contains: `useGCGetScheduledJobs`, `useGCGetPolicies`, `useGCGetPoliciesLogs`, `useGCGetSchemas`, etc.
- Depends on: `swrCORSFetch.ts`, `useGcApi`, `useJWTManagerStore`
- Used by: `src/routes/Automation/` views and hooks

**API Utilities — Imperative REST:**
- Purpose: One-shot axios-based calls for mutations (create/update/delete jobs and policies)
- Location: `src/utils/api.ts`
- Contains: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`, `apiHead` — all return `ApiOutput<T>`
- Depends on: `useSessionStore` (to dispatch error notifications)
- Used by: form submit handlers in Automation routes

**Global State (Zustand):**
- Purpose: Cross-component shared state without prop drilling
- Location: `src/state/`
- Contains: `jwtManager.ts`, `clusterHealth.ts`, `session.ts`
- Depends on: nothing (leaf layer)
- Used by: hooks, components, API utils

**Constants:**
- Purpose: App-wide configuration literals
- Location: `src/constants/`
- Contains: `paths.ts` (path-parser Path objects), `routes.tsx` (route definitions), `navigation.tsx` (nav config), `queries.ts`, `policies.ts`, `database.ts`, `defaults.ts`, `colors.ts`

**Types:**
- Purpose: TypeScript type definitions and enums
- Location: `src/types/`
- Contains: `cratedb.ts` (CrateDB response shapes), `query.ts` (SQL result types + ColumnType enum), `job.ts`, `route.ts`, `policies/`

**Utilities:**
- Purpose: Pure helper functions
- Location: `src/utils/`
- Contains: `api.ts`, `nodes.ts`, `statusChecks.ts`, `sqlFormatter.ts`, `bytes.ts`, `numbers.ts`, `compare.ts`, `filtering.ts`, `sorting.ts`, `cron.ts`, `strings.ts`, `arrays.ts`, `cn.ts`

## Data Flow

### Primary SQL Query Path (CrateDB `/_sql`)

1. Component calls `useExecuteSql()` hook (`src/hooks/useExecuteSql.ts`)
2. Hook reads auth headers from `useJWTManagerStore.getState().getHeaders()`
3. Hook reads the target URL from `useJWTManagerStore.getState().getUrl(identifier)`
4. Raw `fetch()` POST to `/_sql?error_trace&types` with JSON body `{ stmt: sql }`
5. Response returned as `ExecuteSqlResult { data, status, success }`

### SWR Polling Path (cluster metrics)

1. SWR hook in `src/swr/jwt/` declares a SQL query constant
2. `useSWR(key, swrJWTFetch)` polls on a timer (e.g., 5 s for node status)
3. `swrJWTFetch` (`src/swr/swrJWTFetch.ts`) posts SQL via `useJWTManagerStore` auth
4. Optional `postFetch` transform maps raw `rows[][]` to typed objects
5. SWR cache provides deduplication and revalidation

### Grand Central REST API Path

1. Component calls `useGcApi()` to get an axios instance (`src/hooks/useGcApi.ts`)
2. Axios interceptor attaches `Authorization: Bearer <token>` from JWT store
3. SWR hook in `src/hooks/swrHooks.ts` uses `swrCORSFetch(axiosInstance)` as fetcher
4. Mutations (create/edit/delete) call `apiPost` / `apiPut` / `apiDelete` directly
5. API errors trigger `useSessionStore.setNotification()` → `NotificationHandler` renders toast

### Connection Mode Branching

- **Local admin UI mode** (`isLocalConnection: true`): direct HTTP to `http://localhost:4200/_sql`, no JWT header
- **Cloud mode** (`isLocalConnection: false`, `isJWTEnabled: true`): JWT Bearer token to CrateDB cluster FQDN `/_sql`, or proxied through GC URL when JWT not enabled

**State Management:**
- Zustand stores are module-level singletons (`create<T>()`)
- `useJWTManagerStore` is accessed both as a React hook (components) and imperatively via `.getState()` (hooks, utils that run outside React render cycle)
- No context providers for state — Zustand handles subscription internally

## Key Abstractions

**Route:**
- Purpose: Typed route descriptor combining path, element, label, and key
- Examples: `src/constants/routes.tsx`, `src/types/route.ts`
- Pattern: array of `Route[]` iterated in `App.tsx` to render `<Routes>`

**Path:**
- Purpose: Typed path objects using `path-parser` library for URL construction and parameter extraction
- Examples: `src/constants/paths.ts` — `root`, `auth`, `automationEditJob` (with `:jobId` param)
- Pattern: `new Path('/automation/scheduled-jobs/edit-job/:jobId')`, use `.path` for string, `.build(params)` for filled URL

**swrJWTFetch:**
- Purpose: Adapter that runs SQL queries through the JWT auth layer for SWR consumption
- Examples: `src/swr/swrJWTFetch.ts`, used by all `src/swr/jwt/` hooks
- Pattern: `useSWR(key, ([url]) => swrJWTFetch(url, SQL_QUERY, postFetch))`

**ApiOutput:**
- Purpose: Normalized response envelope for all REST mutations
- Examples: `src/utils/api.ts` — `{ success, data, status, errors? }`
- Pattern: all `apiGet/Post/Put/Patch/Delete` functions return `Promise<ApiOutput<T>>`

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Vite HTML shell (`index.html`) loads the bundle
- Responsibilities: Mounts React root, wraps app in `BrowserRouter`

**Library Entry:**
- Location: `src/index.ts`
- Triggers: npm consumers import from `@cratedb/crate-gc-admin`
- Responsibilities: Re-exports selected components, hooks, state stores, and types for use in host apps (e.g., CrateDB Cloud UI)

**App Component:**
- Location: `src/App.tsx`
- Triggers: Rendered by `main.tsx`
- Responsibilities: Checks GC connection on mount, renders `Layout` with navigation, maps route config to `<Routes>`, mounts `ClusterHealthManager` and `NotificationHandler`

## Architectural Constraints

- **Dual-use library/app:** The codebase builds as both a standalone SPA and an ES/UMD library. Components exported from `src/index.ts` must work when consumed by a host app that provides its own `BrowserRouter`. Avoid any component that assumes it is the top-level app.
- **`useJWTManagerStore` used imperatively:** `src/hooks/useExecuteSql.ts` and `src/swr/swrJWTFetch.ts` call `useJWTManagerStore.getState()` outside the React render cycle. This is intentional but means these modules are coupled to the Zustand store singleton.
- **No React Context for state:** All cross-component state flows through Zustand stores, not React context. Do not introduce context providers for state that needs to be shared widely.
- **SWR deduplication:** SWR keys in `src/swr/jwt/` use a tuple `[url, clusterId]`. Changing the key shape breaks caching. Keep key format consistent.
- **Enterprise gating:** Routes that require Grand Central must be wrapped in `<EnterpriseScreen>`. Do not render GC-dependent UI without this wrapper.
- **Path aliases:** TypeScript path aliases defined in `tsconfig.json` map bare module names (`components`, `hooks`, `routes`, `state`, `types`, `utils`, `constants/*`) to `src/` subdirectories. Always use bare alias imports, not relative paths that cross layer boundaries.

## Anti-Patterns

### Calling `useJWTManagerStore` as a hook inside async functions

**What happens:** Some new code may attempt `const store = useJWTManagerStore()` inside a callback or async function.
**Why it's wrong:** React hooks cannot be called outside render functions. The correct escape hatch already exists.
**Do this instead:** Use `useJWTManagerStore.getState()` for imperative access, as done in `src/hooks/useExecuteSql.ts` and `src/swr/swrJWTFetch.ts`.

### Fetching data with plain `fetch` or `axios` directly in components

**What happens:** A component makes its own API call without using an existing hook.
**Why it's wrong:** Bypasses JWT injection, SWR caching/deduplication, and error notification handling.
**Do this instead:** Use an existing SWR hook from `src/swr/jwt/` or `src/hooks/swrHooks.ts`, or create a new SWR hook following the same pattern. For mutations, use `apiPost`/`apiPut` from `src/utils/api.ts` with the `useGcApi()` axios instance.

### Adding navigation items without a corresponding path constant

**What happens:** A hardcoded string like `'/nodes'` appears in navigation config.
**Why it's wrong:** Creates a disconnected path that can silently diverge from the route definition. Note: `'/nodes'` in `src/constants/navigation.tsx` line 56 is an existing example of this issue.
**Do this instead:** Define a `new Path(...)` export in `src/constants/paths.ts` and reference `.path` in both `navigation.tsx` and `routes.tsx`.

## Error Handling

**Strategy:** Centralized notification dispatch through `useSessionStore`.

**Patterns:**
- `src/utils/api.ts` catches non-2xx responses and calls `dispatchNotification('error', message)` automatically, so callers do not need to handle HTTP errors individually
- `NotificationHandler` component reads `useSessionStore.notification` and renders an Ant Design toast
- SQL errors from CrateDB are returned in the response body as `{ error: { message, code } }` — callers check `'error' in res.data` to detect failures
- `useExecuteMultiSql` tracks per-statement `QueryStatus` with states: `WAITING | EXECUTING | SUCCESS | ERROR | NOT_EXECUTED`

## Cross-Cutting Concerns

**Logging:** No structured logging library — browser `console.*` only. No log aggregation.
**Validation:** `react-hook-form` with `zod` resolvers for form validation in Automation routes.
**Authentication:** JWT stored in `sessionStorage` under a per-cluster key (e.g., `grand-central-token` or `grand-central-token.<clusterId>`). Token validity checked by decoding expiry; refreshed automatically via `getToken()` in `jwtManager`.

---

*Architecture analysis: 2026-05-19*
