# External Integrations

**Analysis Date:** 2026-05-19

## Overview

This app is a pure browser SPA with no backend of its own. All external communication is to two targets:

1. **CrateDB HTTP API** — direct SQL queries via `/_sql` endpoint
2. **Grand Central (GC) API** — CrateDB Cloud management backend via `/api/` endpoints

## CrateDB HTTP API

**Purpose:** Execute SQL queries against a CrateDB cluster directly from the browser.

**Protocol:** HTTP POST to `/_sql?error_trace&types`

**Endpoint pattern:**
```
{clusterUrl}/_sql?error_trace&types[&ident={identifier}]
```

**Auth modes (chosen at runtime):**
- **Local / Admin UI mode** — no authentication header; relies on HTTP Basic Auth handled by the browser/CrateDB directly. Default `clusterUrl` is `http://localhost:4200`.
- **JWT mode** — `Authorization: Bearer {token}` header. Used when `isJWTEnabled=true` (CrateDB >= 5.8.2) or `isLocalConnection=false`.

**Client:** Native `fetch` API via `src/swr/swrJWTFetch.ts`

**SWR hooks (all under `src/swr/jwt/`):**
| Hook | SQL target | Poll interval |
|------|-----------|---------------|
| `useClusterInfo.ts` | `sys.cluster` | 2 min |
| `useClusterNodeStatus.ts` | `sys.nodes` | — |
| `useCurrentUser.ts` | `sys.users` / session | — |
| `useQueryStats.ts` | `sys.jobs_log` | — |
| `useSchemaTree.ts` | `information_schema` | — |
| `useShards.ts` | `sys.shards` | — |
| `useTables.ts` | `information_schema.tables` | — |
| `useTablesShards.ts` | `sys.shards` + `information_schema` | — |
| `useUsersRoles.ts` | `sys.users`, `sys.privileges` | — |
| `useAllocations.ts` | `sys.allocations` | — |

**Query identifier pattern:** Queries include `&ident=/{hook-name}` in the URL for MSW routing in tests.

## Grand Central (GC) API

**Purpose:** CrateDB Cloud management plane — scheduled jobs, table policies, schema data, authentication.

**Base URL:** Configured at runtime via `useJWTManagerStore.gcUrl`. Defaults to `http://localhost:5050` in local mode; dynamically set to `https://{cluster.fqdn.replace('.', '.gc.')}` in cloud mode.

**Auth:** JWT Bearer token obtained from `/api/v2/clusters/{clusterId}/jwt/` (cloud-ui provides this endpoint) and validated/stored in `sessionStorage`.

**HTTP Client:** axios instance created per-request in `src/hooks/useGcApi.ts`, with `withCredentials: true` and `Authorization: Bearer {token}` injected via interceptor.

**Endpoints consumed:**

| Method | Path | Purpose | Source |
|--------|------|---------|--------|
| GET | `/api/` | Health / connection check | `src/App.tsx` |
| GET/POST | `/api/_sql` | SQL via GC proxy (non-JWT mode) | `src/state/jwtManager.ts` |
| GET | `/api/auth?token=...` | Authenticate JWT token with GC | `src/state/jwtManager.ts` |
| GET | `/api/scheduled-jobs/` | List scheduled jobs | `src/hooks/swrHooks.ts` |
| GET | `/api/scheduled-jobs/{id}` | Get single scheduled job | `src/hooks/swrHooks.ts` |
| POST | `/api/scheduled-jobs/` | Create scheduled job | `src/routes/Automation/views/JobForm.tsx` |
| PUT | `/api/scheduled-jobs/{id}` | Update scheduled job | `src/routes/Automation/views/JobsTable.tsx` |
| DELETE | `/api/scheduled-jobs/{id}` | Delete scheduled job | `src/routes/Automation/views/JobsTable.tsx` |
| GET | `/api/scheduled-jobs/{id}/log` | Job execution log | `src/hooks/swrHooks.ts` |
| GET | `/api/scheduled-jobs/logs?limit=100` | All job logs | `src/hooks/swrHooks.ts` |
| GET | `/api/scheduled-jobs/all/logs?limit=100` | All task logs | `src/hooks/swrHooks.ts` |
| GET | `/api/policies/` | List table policies | `src/hooks/swrHooks.ts` |
| GET | `/api/policies/{id}` | Get single policy | `src/hooks/swrHooks.ts` |
| POST | `/api/policies/` | Create policy | `src/routes/Automation/views/PolicyForm.tsx` |
| PUT | `/api/policies/{id}` | Update policy | `src/routes/Automation/views/PoliciesTable.tsx` |
| DELETE | `/api/policies/{id}` | Delete policy | `src/routes/Automation/views/PoliciesTable.tsx` |
| GET | `/api/policies/{id}/log?limit=2` | Policy execution log | `src/hooks/swrHooks.ts` |
| GET | `/api/policies/logs?limit=100` | All policy logs | `src/hooks/swrHooks.ts` |
| GET | `/api/policies/eligible-columns/` | Columns eligible for policy | `src/routes/Automation/hooks/useEligibleColumns.ts` |
| POST | `/api/policies/preview/` | Preview policy effect | `src/routes/Automation/hooks/usePolicyPreview.ts` |
| GET | `/api/data/schemas/` | Schema list (with tables) | `src/hooks/swrHooks.ts` |

**Cloud-UI JWT endpoint (external, not GC):**
- GET `/api/v2/clusters/{clusterId}/jwt/` — returns `{ token, refresh }`. This URL is relative, so it is served by whatever host the cloud-ui runs on. Called only in cloud (non-local) mode.

## Authentication

**Two authentication modes, determined at runtime by `useJWTManagerStore`:**

### Local / Admin UI Mode (`isLocalConnection: true`)

- No token required
- HTTP Basic Auth handled natively by the browser when CrateDB prompts
- `gcStatus` tracks connection state (`PENDING`, `CONNECTED`, `NOT_LOGGED_IN`, `ERROR`)
- Session storage key: `grand_central_token`

### Cloud / JWT Mode (`isLocalConnection: false`)

- JWT token fetched from cloud-ui's `/api/v2/clusters/{clusterId}/jwt/`
- Token stored in `sessionStorage` under key `grand-central-token.{clusterId}`
- Token validated on each use via `jwt-decode` — reacquired if expiry < 10 seconds
- Token passed as `Authorization: Bearer` to both GC API (axios) and CrateDB direct (fetch)
- JWT direct-to-CrateDB enabled only when `clusterVersion >= 5.8.2` (`isJWTEnabled` flag)
- Auth flow entry: `src/routes/Auth/Auth.tsx` — accepts `?token=` + `?refresh=` URL params, calls `login()` which hits `{gcUrl}/api/auth`

**State management:** `src/state/jwtManager.ts` (Zustand store) owns all auth state and is the single source of truth for URLs and headers.

## Data Storage

**Databases:**
- CrateDB — the app's only data store; no relational or document DB of its own

**File Storage:**
- None — no file storage integration

**Caching:**
- SWR in-memory cache for all API responses
- `sessionStorage` — JWT tokens only (key: `grand_central_token` or `grand-central-token.{clusterId}`)
- No localStorage usage for data (mocked out in tests)

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or similar SDK detected

**Logs:**
- No structured logging library; errors surfaced to users via Ant Design notification system (managed by `src/state/session.ts`)

## External Documentation Links

The app links out to `cratedb.com` docs from constants:
- `CRATEDB_PRIVILEGES_DOCS` — `src/constants/defaults.ts`
- `CRATEDB_ERROR_CODES_DOCS` — `src/constants/defaults.ts`
- `CRATEDB_CLUSTER_DOCS` — `src/constants/defaults.ts`

These are UI links only, not API integrations.

## Mock / Stub Layer for Tests

**Framework:** MSW (Mock Service Worker) 2.13.x — `test/msw/`

**Server setup:** `test/msw/server.ts`, started/stopped in `test/setup.ts`

**Handler groups:**
| File | Intercepts |
|------|-----------|
| `test/msw/handlers/queries.ts` | `POST http://localhost:4200/_sql` (JWT) and `POST /api/_sql` (CORS) |
| `test/msw/handlers/scheduledJobs.ts` | GC scheduled job endpoints |
| `test/msw/handlers/policies.ts` | GC policy endpoints |
| `test/msw/handlers/jwt.ts` | JWT auth endpoints |

**Query routing in tests:** JWT SQL queries are routed by the `?ident=` param to return fixture data from `test/__mocks__/` (e.g., `useClusterNodeStatusMock.ts`, `useTablesShardsMock.ts`).

**Additional module mocks (`__mocks__/`):**
- `zustand.ts` — resets store state between tests
- `react-router-dom.tsx` — stubs `useLocation`, `useNavigate`, etc.
- `react-ace/index.tsx` — no-op editor
- `react-syntax-highlighter/index.tsx` — no-op highlighter
- `react-resizable-panels/index.tsx` — no-op panels
- `ace-builds/` — empty mode/theme stubs
- `localStorageMock.ts` — in-memory localStorage replacement

## CI/CD & Deployment

**Hosting:**
- Standalone: nginx (Docker image `nginx` referenced in Dependabot config)
- Embedded: served from within CrateDB itself as the Admin UI

**CI Pipeline:** GitHub Actions
- `.github/workflows/pr.yml` — lint, build (app + lib), test on every PR
- `.github/workflows/publish.yml` — publishes to NPM on merge to main

**NPM Registry:** `https://registry.npmjs.org` (public, package `@cratedb/crate-gc-admin`)

## Environment Configuration

**`.env` file:** Present at repo root (contents not read — may contain local dev overrides).

**No `VITE_*` environment variables** were found referenced in source code. All runtime configuration (cluster URL, GC URL, JWT settings) is passed programmatically via the `useJWTManagerStore.updateCluster()` API rather than build-time env vars.

**Secrets location:**
- JWT tokens: `sessionStorage` in browser only
- No server-side secrets (frontend-only project)

---

*Integration audit: 2026-05-19*
