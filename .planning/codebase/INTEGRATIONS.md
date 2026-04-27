# External Integrations

**Analysis Date:** 2026-04-23

## Data & Backend Connectivity

**Primary Backend - CrateDB Grand Central:**
- Service: CrateDB Grand Central (admin cluster management API)
- Base URLs:
  - Local development: `http://localhost:5050` (Grand Central) and `http://localhost:4200` (CrateDB cluster)
  - Production: Dynamic HTTPS URLs from cluster metadata
- HTTP Client: Axios with JWT Bearer token authentication
- Implementation: `src/hooks/useGcApi.ts` creates configured axios instance with interceptors
- API Reference Pattern:
  - Base: `${gcUrl}/api/` endpoints
  - SQL execution: `${clusterUrl}/_sql?error_trace&types` (local or JWT-enabled clusters)
  - Scheduled jobs: `/api/scheduled-jobs/`, `/api/scheduled-jobs/{jobId}/log`
  - Policies: `/api/policies/`, `/api/policies/{policyId}`, `/api/policies/{policyId}/log`
  - Data schemas: `/api/data/schemas/?include_tables=true`
  - Auth: `/api/auth` endpoint with query parameters
  - JWT tokens: `/api/v2/clusters/{clusterId}/jwt/` endpoint

**SQL Execution:**
- Dual-mode execution:
  - Local connection mode: Direct HTTP POST to CrateDB `/_sql` endpoint via `src/hooks/useExecuteSql.ts`
  - Cloud connection mode: Via Grand Central with JWT authentication
- Formatter: `src/utils/sqlFormatter.ts` uses `sql-formatter` library with PostgreSQL dialect
- Query parser: `@cratedb/cratedb-sqlparse` for SQL analysis in schema trees

## Authentication & Authorization

**JWT Token Management:**
- Store: `src/state/jwtManager.ts` (Zustand store)
- Storage: `sessionStorage` with key `grand_central_token` (local) or `grand-central-token.{clusterId}` (cloud)
- Token lifecycle:
  - Validation: Decoded via `jwt-decode` with 10-second expiry buffer
  - Refresh: Auto-fetched if expired or missing from `/api/v2/clusters/{clusterId}/jwt/`
  - Optional refresh token support via login endpoint
- Minimum CrateDB version for JWT: 5.8.2 (checked via `compare-versions`)
- Implementation:
  - Token injected via Axios interceptor in `src/hooks/useGcApi.ts`
  - Authorization header: `Bearer {token}`
  - Credentials: `withCredentials: true` for cookie support

## API Data Fetching Patterns

**SWR (Stale While Revalidate):**
- Hook: `useSWR` from `swr@2.4.1`
- CORS handling: Custom `src/swr/swrCORSFetch.ts` wrapper
- Key builder: `${gcUrl}{endpoint}` for cache key construction
- Refresh intervals: 30 seconds for jobs and policies (via `refreshInterval`)
- Hooks in `src/hooks/swrHooks.ts`:
  - `useGCGetScheduledJobs()` - List all jobs with 30s refresh
  - `useGCGetScheduledJob(jobId)` - Get single job
  - `useGCGetScheduledJobLogs(job)` - Job execution logs with 30s refresh
  - `useGCGetScheduledJobsLogs()` - Recent logs (limit 100) with 30s refresh
  - `useGCGetScheduledJobsAllLogs()` - All task logs (limit 100) with 30s refresh
  - `useGCGetPolicy(policyId)` - Get single policy
  - `useGCGetPolicies()` - List all policies with 30s refresh
  - `useGCGetSchemas(includeTables)` - Get database schemas with table metadata

**Generic API Call Hook:**
- Hook: `src/hooks/useApiCall.ts`
- Supports: GET, POST, PUT, PATCH, DELETE, HEAD methods
- Axios instance injection
- Optional body and request options

**Wrapped HTTP Methods:**
- Location: `src/utils/api.ts`
- Methods: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`, `apiHead`
- Error handling: Extracts Axios errors, preserves response status
- Notifications: Auto-dispatches error notifications to session store unless disabled
- Response shape: `ApiOutput<T> = { success, data, status, errors? }`

## Cloud Multi-Cluster Support

**Dynamic Connection Parameters:**
- Cluster identification: `clusterId`, `clusterUrl`, `clusterVersion`
- Grand Central URL: `gcUrl` (Dynamic HTTPS domain per environment)
- Cluster FQDN pattern: `fqdn` → `https://{fqdn.replace(/\.$/, ':4200')}`
- Grand Central FQDN pattern: `fqdn` → `https://{fqdn.replace('.', '.gc.').replace(/\.$/, '')}`
- Update mechanism: `src/components/JWTManagerWrapper` receives cluster updates and calls `useJWTManagerStore.updateCluster()`

## Data Storage

**Client-Side:**
- SessionStorage: JWT tokens for authentication
- LocalStorage: 
  - SQL editor content: `crate.gc.admin.{localStorageKey}.{clusterId}`
  - SQL query history: `crate.gc.admin.{localStorageKey}-history`
  - Temporary history: `crate.gc.admin.{localStorageKey}-history-temp`
  - Implementation: `src/components/SQLEditor/SQLEditor.tsx`

**No persistent database:**
- All data flows through Grand Central API
- No ORM or direct database connection in frontend

## State Management

**Zustand Stores:**
- `src/state/jwtManager.ts` - JWT tokens, cluster info, connection status
- `src/state/session.ts` - Notifications (type, message)
- `src/state/clusterHealth.ts` - Cluster connection status
- Implementation pattern: Global store with hooks for selectors

## Testing & Mocking

**Mock Service Worker (MSW):**
- Version: 2.12.7
- Configuration: `test/msw/` directory
- API mocking for tests via request interception
- Used in Jest tests for HTTP endpoint mocking

**Mocked Dependencies:**
- Mock files in `__mocks__/`:
  - `ace-builds`
  - `react-ace`
  - `react-syntax-highlighter`
  - `react-resizable-panels`

## Internationalization (i18n)

**Provider:**
- Library: `react-intl@7.1.11`
- Configuration: Language/locale support via provider wrapper

## Browser APIs Used

**Web Vitals:**
- Library: `web-vitals@4.2.4`
- Measures: Core Web Vitals metrics (LCP, FID, CLS, etc.)

## Performance & Observability

**No external monitoring:**
- Error tracking: Notifications handled via session store, no external service
- Logging: Console-based (no external APM tool detected)

## Webhooks & Real-Time

**Not detected** - All communication is request/response over HTTP

---

*Integration audit: 2026-04-23*
