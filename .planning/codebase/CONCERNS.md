# Codebase Concerns

Technical health concerns across 7 categories. Each entry includes location, description, and severity.

---

## 1. Code Quality

| Severity | Location | Issue |
|----------|----------|-------|
| **High** | `src/utils/api.ts:47` | `axiosError.response!` non-null assertion crashes if network is completely unreachable (no response object) |
| **Medium** | `src/types/query.ts`, `src/hooks/useExecuteMultiSql.ts` | Direct `node_modules/` path imports (`import { Statement } from 'node_modules/@cratedb/cratedb-sqlparse/dist/parser'`) — brittle and non-portable |
| **Medium** | `src/routes/Automation/views/PolicyForm.tsx` (729 lines) | Oversized file — should be split |
| **Medium** | `src/components/SQLEditor/SQLEditor.tsx` (428 lines) | Oversized file |
| **Medium** | `src/components/DataTable/DataTable.tsx` (397 lines) | Oversized file |
| **Medium** | `src/routes/Automation/views/JobsTable.tsx` (392 lines) | Oversized file |
| **Medium** | `src/types/query.ts` | `rows: any[][]` propagates `any` through all SQL result handling |
| **Low** | Various | Inconsistent `src/` prefix vs bare alias imports across 10+ files |
| **Low** | `src/App.tsx`, `src/state/jwtManager.ts`, `src/utils/numbers.ts` | `==` instead of `===` comparisons |

---

## 2. Architecture Concerns

| Severity | Location | Issue |
|----------|----------|-------|
| **High** | App-wide | No React error boundaries anywhere — any render error blanks the entire UI |
| **High** | `src/hooks/swrHooks.ts:79–123` (`useGCGetPoliciesEnriched`) | N+1 API pattern: one request per policy on every render and SWR refresh. Acknowledged with `// NOTE: This Hook will be removed when API will return the last_execution` comment |
| **Medium** | `src/hooks/useApiCall.ts` | `}, [])` empty dependency array — stale closure bug; URL/method/body changes after mount are silently ignored |
| **Medium** | `src/hooks/useGcApi.ts` | `axios.create()` called on every render without `useMemo`; 14+ components affected |
| **Medium** | App-wide | Two parallel HTTP strategies (Axios + `useGcApi` vs native `fetch` + `swrJWTFetch`) with no documented boundary |
| **Medium** | `src/hooks/useExecuteSql.ts` | Always returns `success: true` regardless of HTTP status |

---

## 3. Dependency Concerns

| Severity | Package | Issue |
|----------|---------|-------|
| **Medium** | `moment` v2.30.1 | Legacy/maintenance-mode library used in 5 files — ~300KB bundle cost; `date-fns` or `dayjs` preferred |
| **Low** | `lodash` | Full default import (`import _ from 'lodash'`) in `src/components/SQLResults/SQLResultsTable.tsx` and `src/routes/Automation/tablePoliciesUtils/tableTree.tsx` — should use named imports for tree-shaking |
| **Low** | `jest.config.js` | `collectCoverage: false` — the 80% coverage threshold is defined but never enforced |

---

## 4. Test Coverage Gaps

| Severity | Area | Issue |
|----------|------|-------|
| **High** | `src/hooks/` | All 8 hooks have no tests, including critical `useExecuteSql`, `useExecuteMultiSql`, `swrHooks` |
| **High** | `src/utils/` | All 11 utility files have no tests, including `api.ts`, `nodes.ts` (217 lines of health calculations), `statusChecks.ts` |
| **High** | Routes | 10 route components have no tests: `Overview`, `SQLConsole`, `Auth`, `Tables/*`, `Nodes/Nodes`, `Users/Users`, `TablesShards/TablesShards`, `Help` |
| **High** | `src/state/` | All 3 Zustand stores have no tests (JWT manager, session, cluster health) |

---

## 5. Security Concerns

| Severity | Location | Issue |
|----------|----------|-------|
| **High** | `src/state/jwtManager.ts:109` | JWT tokens sent as URL query parameters (`?token=...&refresh=...`) — logged by proxies and servers |
| **Medium** | `src/state/jwtManager.ts` | JWT stored in `sessionStorage` — accessible via XSS |

---

## 6. Performance Concerns

| Severity | Location | Issue |
|----------|----------|-------|
| **Medium** | App-wide | No `React.lazy()` or `Suspense` anywhere — all routes eagerly bundled, inflating initial load |

---

## 7. Operational Concerns

| Severity | Location | Issue |
|----------|----------|-------|
| **High** | App-wide | No error boundaries — any render crash produces a blank screen with no recovery |
| **Medium** | App-wide | Zero `console.error`/structured logging in production code; API errors dispatch UI notifications but leave no trace for debugging |
| **Low** | `src/hooks/useApiCall.ts` | Requests fire with no `AbortController` cleanup on unmount — memory leak risk |
| **Low** | Config | `gcUrl` hardcoded to `http://localhost:5050` default with no warning if not overridden in production |

---

## Summary

- **High severity**: 7 issues (no error boundaries, N+1 API calls, JWT in URL params, critical hooks/utils/routes/stores untested)
- **Medium severity**: 11 issues (large files, dual HTTP strategies, stale closures, `moment` dep, XSS-accessible tokens, no lazy loading)
- **Low severity**: 6 issues (import style, `==` comparisons, `lodash` imports, coverage not enforced, memory leaks)
