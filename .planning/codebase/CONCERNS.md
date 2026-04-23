# Concerns & Technical Debt

**Analysis Date:** 2026-04-23

## Known Issues

- **Intermittent test failures:** Documented cases of flaky async tests in hook tests; may be timing-sensitive `waitFor` usage
- **Timestamp crashes:** Previously fixed; history indicates fragile date/time handling in certain display components

## Technical Debt

- **Hardcoded environment handling:** Environment-specific configuration spread across multiple places rather than a single config boundary
- **Missing error handling in async operations:** Some async hooks do not have comprehensive error boundaries; callers must defensively check `success` flag
- **Race conditions in hooks:** Multiple concurrent SWR fetches or useEffect-triggered async calls may race in edge cases (e.g., rapid route switching)
- **Deprecated dependencies:**
  - `moment.js` — large bundle weight; should be replaced with `date-fns` or `dayjs`
  - `lodash` — heavy; most usages replaceable with native JS
- **Large component files:** Some feature components (e.g., `PolicyForm`, `JobForm` in Automation) exceed 700 lines; should be decomposed
- **Dual design systems:** Mix of Ant Design and shadcn/ui (Tailwind-based) creates inconsistency; ongoing migration implied by `CrateTabsShad` component name

## Security Concerns

- **JWT tokens in query parameters:** Some API call patterns may expose tokens in URLs (visible in server logs, browser history)
- **Missing CSRF protection:** REST API calls rely on Bearer token only; no CSRF token mechanism
- **Unencrypted localStorage:** `SQLEditor` persists SQL history to localStorage in plaintext; could expose sensitive queries on shared machines
- **Session token storage:** JWT stored in memory via Zustand (non-persistent), but the mechanism for token refresh and expiry handling needs review

## Performance Concerns

- **Large component files:** 700+ line components increase parse time and hinder code splitting
- **No lazy loading:** Routes appear to be eagerly imported; adding `React.lazy()` per route would improve initial bundle size
- **SWR polling:** Cluster health polling interval should be reviewed to avoid excessive API load on large clusters
- **Bundle size:** `moment.js` and `lodash` are known large dependencies that inflate the bundle

## Fragile Areas

- **`src/components/SQLEditor/`** — Uses localStorage for query history; state can be corrupted by concurrent tabs or storage quota limits
- **`src/routes/Automation/`** — Complex form logic for `PolicyForm` and `JobForm` with many conditional fields; high coupling between form state and API types
- **`src/state/jwtManager.ts`** — Global auth state; token refresh logic or expiry edge cases could leave users in inconsistent auth states
- **`src/hooks/useGcApi.ts`** — Creates a new Axios instance on every render; should be stabilized with `useMemo` to prevent unnecessary re-renders and interceptor accumulation

## TODOs / FIXMEs

- TODO comments exist in the codebase (exact count not surveyed); concentrated in Automation routes and SWR hooks
- Some type assertions (`as AxiosError<T>`) indicate areas where proper type narrowing is missing

## Missing Coverage

- **JWT authentication flow:** No tests for token expiry, refresh, or invalid token scenarios
- **Error scenario paths:** Many components lack tests for API error states (5xx, network failure)
- **Async hook edge cases:** Race conditions and cancellation paths in `useExecuteSql` / `useExecuteMultiSql` not covered
- **E2E tests:** No end-to-end test suite; entire user flows are untested at the integration level
- **Automation forms:** `PolicyForm` and `JobForm` complexity is not matched by test coverage
