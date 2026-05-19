# Testing

## Framework

| Tool | Version | Purpose |
|------|---------|---------|
| Jest | 29.x | Test runner and assertion library |
| ts-jest | — | TypeScript transpilation for Jest |
| jest-fixed-jsdom | — | JSDOM environment with React 19 fixes |
| @testing-library/react | — | Component rendering and queries |
| @testing-library/jest-dom | — | DOM matchers (`toBeInTheDocument`, etc.) |
| @testing-library/user-event | — | User interaction simulation |
| MSW 2.x | — | API mocking via Service Worker |

## Test File Organization

Tests are co-located with the code they test:
- Component tests: `src/components/ComponentName/ComponentName.test.tsx`
- Route tests: `src/routes/RouteName/RouteName.test.tsx`
- Hook tests: `src/hooks/__test__/hookName.test.ts`
- DataTable tests: `src/components/DataTable/test/*.test.tsx`

Test files match the regex: `(/__tests__/*.test.js|\.(test))\.(jsx|js|tsx|ts)$`

## Configuration (jest.config.js)

```
testEnvironment: jest-fixed-jsdom
preset: ts-jest/presets/js-with-ts
rootDir: .
collectCoverage: false          ← thresholds defined but not enforced by default
globalSetup: ./test/global-setup.ts
setupFilesAfterEnach: ./test/setup.ts
transformIgnorePatterns: node_modules except until-async and pretty-bytes
```

Coverage thresholds (active only when `collectCoverage: true`):
- branches: 80%
- functions: 80%
- lines: 80%
- statements: 80%

## Global Setup (test/global-setup.ts)

Sets `process.env.TZ = 'Europe/Vienna'` — all date tests assume this timezone.

## Per-Test Setup (test/setup.ts)

Runs before every test file:
- Imports `@testing-library/jest-dom`
- Polyfills `window.fetch` via `whatwg-fetch`
- Patches `antd` static APIs (`message`, `notification`) for React 19 compatibility using `unstableSetRender`
- Mocks `window.matchMedia`, `window.ResizeObserver`, `window.open`, `window.scrollTo`
- Mocks `window.localStorage` with a custom `localStorageMock`
- Starts the MSW server via `test/msw/server.ts`

## Root-Level Mocks (`__mocks__/`)

Module-level mocks applied automatically:
- `react-router-dom` — provides `useLocation` mock and navigation helpers
- `zustand` — store reset between tests
- `ace-builds` — no-op for the SQL editor (heavy browser dependency)
- `localStorageMock` — synchronous in-memory implementation

## MSW Mock Strategy (`test/msw/`)

| File | Purpose |
|------|---------|
| `server.ts` | Creates and exports the MSW `setupServer` instance |
| `handlers.ts` | Default handler list registered on every test |
| `handlers/` | Per-feature handler modules (imported by `handlers.ts`) |
| `handlerFactory.ts` | Factory functions to create reusable request handlers |
| `getRequestSpy.ts` | Utility to spy on specific MSW requests within a test |

**Server lifecycle pattern:**
```ts
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Per-test handler overrides: `server.use(...customHandlers)` within individual tests.

## Test Utilities (`test/testUtils/`)

| File | Purpose |
|------|---------|
| `renderWithTestWrapper.tsx` | Wraps component under test with providers (Router, theme, etc.) |
| `createLocationTestUtil.ts` | Creates mock location objects for route testing |
| `actWithFakeTimers.ts` | Combines `jest.useFakeTimers()` with `act()` for timed effects |
| `disableConsole.ts` | Suppresses expected console errors in tests |
| `treeUtils.ts` | Helpers for querying tree-structured components |

## Common Patterns

**Async render:**
```ts
render(<Component />, { wrapper: renderWithTestWrapper })
await screen.findByText('Expected Text')
```

**User interactions:**
```ts
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: /submit/i }))
```

**API spying:**
```ts
const spy = getRequestSpy(server, 'POST', '/api/endpoint')
await user.click(submitButton)
expect(spy).toHaveBeenCalledWith(expect.objectContaining({ body: '...' }))
```

**Hook testing:**
```ts
const { result } = renderHook(() => useMyHook(), { wrapper: renderWithTestWrapper })
await waitFor(() => expect(result.current.data).toBeDefined())
```

## Running Tests

```bash
yarn test           # run all tests (watch mode)
yarn test --ci      # single-pass, no watch (CI)
yarn test --coverage  # enable coverage collection (enforces 80% thresholds)
```
