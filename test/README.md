# Testing guide

## Fake timers

Ant Design uses [rc-motion](https://github.com/react-component/motion) for enter/leave animations. jsdom does not fire CSS `transitionend` or `animationend` events, so leave animations stall and portal DOM (messages, notifications, modals) can persist between tests.

Fake timers are **not** a Vitest requirement. They are a **jsdom + Ant Design workaround** used only where needed.

### When fake timers are needed

| Scenario | Utility / pattern | Example |
| --- | --- | --- |
| Message/notification portal cleanup | `flushAntdPortals()` in `afterEach` | `CopyToClipboard.test.tsx`, `NotificationHandler.test.tsx` |
| Ant Design Tree expand/collapse | `vi.useFakeTimers({ shouldAdvanceTime: true })` for the describe block, plus `vi.runAllTimers()` after clicks | `SQLEditorSchemaTree.test.tsx` |
| Synchronous notification API calls | `actWithFakeTimers()` | `notificationPresets.test.tsx` |
| Modal close in jsdom | Assert leave class or `queryByRole` absence — **not** fake timers | `Logs.test.tsx` |

### When fake timers are not needed

- Default for all other tests (~440).
- Never in global `test/setup.ts`.
- Do not enable `shouldAdvanceTime: true` globally — it interferes with real `waitFor` and user-event timing.

### Why `shouldAdvanceTime: true` matters

- **Tree tests** keep it enabled for the whole describe so `waitFor` and SWR polling still advance while fake timers are active.
- **Portal flush** (`flushAntdPortals`) enables it briefly, runs cleanup, then restores real timers immediately.

### Utilities

#### `flushAntdPortals()`

Use in `afterEach` when a test file renders Ant Design `message` or `notification` UI (including via `useMessage()`):

```typescript
import { flushAntdPortals, render, screen } from 'test/testUtils';

describe('MyComponent', () => {
  afterEach(async () => {
    await flushAntdPortals();
  });
});
```

Defined in [`test/testUtils/flushAntdPortals.ts`](testUtils/flushAntdPortals.ts).

#### `actWithFakeTimers()`

Use when testing notification preset logic synchronously (spy on `notification.open` without waiting for real timers). **Not** for portal cleanup.

Defined in [`test/testUtils/actWithFakeTimers.ts`](testUtils/actWithFakeTimers.ts).

#### `expectAntdMessage(text)`

Use when asserting a visible antd **message** toast (not notification). Targets the `appear-active` wrapper because `message.destroy()` + `message.success()` leaves both leave-active and appear-active copies in the DOM briefly.

```typescript
await user.click(screen.getByText('Copy'));
await expectAntdMessage('Copied');
```

Defined in [`test/testUtils/expectAntdMessage.ts`](testUtils/expectAntdMessage.ts).

### Checklist for new tests

1. Does the component call `message.*`, `notification.*`, or `useMessage()`? → add `afterEach(flushAntdPortals)`.
2. Does it test Ant Design Tree/Menu expand/collapse? → scoped describe-level fake timers (see `SQLEditorSchemaTree.test.tsx`).
3. Otherwise → no fake timers.
