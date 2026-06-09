# Testing guide

## MSW (API mocking)

MSW is started once globally in [`test/setup.ts`](setup.ts):

```typescript
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Do **not** call `server.listen()` or `server.close()` in individual test files. Use `server.use(...)` when a test needs custom handlers.

Unhandled requests log a warning (not a hard failure). Treat warnings as a backlog of missing handlers.

## Mock reset

Global `vi.clearAllMocks()` in [`test/setup.ts`](setup.ts) runs after every test. It clears call history on module-level mocks (`navigateMock`, `useLocation`, per-test spies) so tests do not leak mock state. Individual tests should still create fresh spies in `beforeEach` when needed.

## Fake timers

Ant Design uses [rc-motion](https://github.com/react-component/motion) for enter/leave animations. jsdom does not fire CSS `transitionend` or `animationend` events, so leave animations stall and portal DOM (messages, notifications, modals) can persist between tests.

Fake timers are **not** a Vitest requirement. They are a **jsdom + Ant Design workaround** used only where needed.

### When fake timers are needed

| Scenario | Utility / pattern | Example |
| --- | --- | --- |
| Message/notification portal cleanup | `withAntdPortalCleanup()` in the relevant `describe` | `CopyToClipboard.test.tsx`, `NotificationHandler.test.tsx` |
| Ant Design Tree expand/collapse | `vi.useFakeTimers({ shouldAdvanceTime: true })` for the describe block, plus `vi.runAllTimers()` after clicks | `SQLEditorSchemaTree.test.tsx` |
| Synchronous notification API calls | `actWithFakeTimers()` | `notificationPresets.test.tsx` |
| Modal close in jsdom | Assert leave class or `queryByRole` absence — **not** fake timers | `Logs.test.tsx` |

### When fake timers are not needed

- Default for all other tests (~440).
- Never in global setup files.
- Do not enable `shouldAdvanceTime: true` globally — it interferes with real `waitFor` and user-event timing.

### Why `shouldAdvanceTime: true` matters

- **Tree tests** keep it enabled for the whole describe so `waitFor` and SWR polling still advance while fake timers are active.
- **Portal flush** (`flushAntdPortals`) enables it briefly, runs cleanup, then restores real timers immediately.

### Utilities

#### `withAntdPortalCleanup()`

Registers an `afterEach` that calls `flushAntdPortals()`. Use in the innermost `describe` that renders Ant Design `message` or `notification` UI (including via `useMessage()`):

```typescript
import { render, screen, withAntdPortalCleanup } from 'test/testUtils';

describe('MyComponent', () => {
  describe('when copying', () => {
    withAntdPortalCleanup();
    // ...
  });
});
```

Defined in [`test/testUtils/withAntdPortalCleanup.ts`](testUtils/withAntdPortalCleanup.ts).

#### `flushAntdPortals()`

Lower-level cleanup used by `withAntdPortalCleanup()`. Prefer the helper unless you need custom hook ordering.

Defined in [`test/testUtils/flushAntdPortals.ts`](testUtils/flushAntdPortals.ts).

#### `actWithFakeTimers()`

Use when testing notification preset logic synchronously (spy on `notification.open` without waiting for real timers). **Not** for portal cleanup.

Defined in [`test/testUtils/actWithFakeTimers.ts`](testUtils/actWithFakeTimers.ts).

#### `expectAntdMessage(text)`

Use when asserting a visible antd **`message`** toast. Targets the `appear-active` wrapper because `message.destroy()` + `message.success()` leaves both leave-active and appear-active copies in the DOM briefly.

**Do not use for `notification` portals** — query by notification class instead (see `NotificationHandler.test.tsx`).

```typescript
await user.click(screen.getByText('Copy'));
await expectAntdMessage('Copied');
```

Defined in [`test/testUtils/expectAntdMessage.ts`](testUtils/expectAntdMessage.ts).

## Setup file layout

| File | Purpose |
| --- | --- |
| [`setupMocks.ts`](setupMocks.ts) | Global `vi.mock(...)` registrations |
| [`setupPolyfills.ts`](setupPolyfills.ts) | jsdom polyfills (`matchMedia`, `ResizeObserver`, etc.) |
| [`setupConsole.ts`](setupConsole.ts) | Filtered `console.error` for known antd/jsdom noise |
| [`setup.ts`](setup.ts) | RTL, antd static APIs, MSW lifecycle, zustand store reset |

## Performance

Vitest uses `pool: 'threads'` and pre-bundles heavy dependencies (`antd`, `lodash`, `recharts`, etc.) via `server.deps.optimizer` in [`vitest.config.ts`](../vitest.config.ts). CI caches `node_modules/.vite` between runs.

## Checklist for new tests

1. Does the component call `message.*`, `notification.*`, or `useMessage()`? → add `withAntdPortalCleanup()` to the relevant `describe`.
2. Does it test Ant Design Tree/Menu expand/collapse? → scoped describe-level fake timers (see `SQLEditorSchemaTree.test.tsx`).
3. Does it need custom API responses? → `server.use(...)` in the test; do not start/stop MSW locally.
4. Otherwise → no fake timers.
