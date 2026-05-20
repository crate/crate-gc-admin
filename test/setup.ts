/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom/vitest';
// polyfill window.fetch
import 'whatwg-fetch';
import { type Mock } from 'vitest';
import { configure, cleanup, act } from '@testing-library/react';
import { message, notification } from 'antd';

// React 19 test mode: treat all state updates (incl. timer callbacks) as inside act().
// Without this, rc-motion's setTimeout-based animation updates are deferred and
// never committed, breaking Ant Design Tree expansion in tests.
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

configure({ asyncUtilTimeout: 5000 });
beforeEach(async () => {
  // Destroy lingering Ant Design messages/notifications from previous tests.
  // rc-motion's leave animations use setTimeout; flush them with fake timers so
  // the old elements are fully removed before the next test starts.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  await act(async () => {
    message.destroy();
    notification.destroy();
  });
  // Three passes: each covers one rc-motion step (rAFs → STEP_ACTIVE → deadline
  // → goMotionEnd → antd removes message → React unmounts element).
  await act(async () => { vi.runAllTimers(); });
  await act(async () => { vi.runAllTimers(); });
  await act(async () => { vi.runAllTimers(); });
  vi.useRealTimers();
});
afterEach(cleanup);
import { createRoot } from 'react-dom/client';
import { unstableSetRender } from 'antd';
import { actWrapper as messageActWrapper } from 'antd/lib/message';
import { actWrapper as notificationActWrapper } from 'antd/lib/notification';

// Wire antd's static message/notification APIs to RTL's act(), which sets
// IS_REACT_ACT_ENVIRONMENT=true so React 19 doesn't warn about out-of-act updates.
messageActWrapper(act);
notificationActWrapper(act);

// Make antd static APIs (message, notification) work in React 19's test environment.
// Without this, antd renders its floating UI outside act() and React 19 never
// commits those renders during tests.
//
// The cleanup is intentionally a no-op: showSuccessMessage() calls message.destroy()
// then message.success() synchronously. If cleanup unmounts the root, the
// immediately-following message.success() hits a half-torn-down container and the
// render is silently dropped. Keeping the root alive and letting antd manage content
// via re-renders avoids this race.
unstableSetRender((node, container) => {
  const containerWithRoot = container as Element & { _reactRoot?: ReturnType<typeof createRoot> };
  containerWithRoot._reactRoot ||= createRoot(container as Element);
  act(() => {
    containerWithRoot._reactRoot!.render(node);
  });
  return () => Promise.resolve();
});

// Vitest does NOT auto-apply __mocks__/ for node_modules without explicit vi.mock() calls.
vi.mock('react-router-dom');
vi.mock('react-ace');
vi.mock('react-syntax-highlighter');
vi.mock('react-resizable-panels');
vi.mock('ace-builds');

// D-12: Register zustand mock globally (replaces auto-hoisting).
// The factory is async because vi.importActual returns a Promise.
vi.mock('zustand', async () => {
  const factory = (await import('../__mocks__/zustand')).default;
  return factory();
});

import mockLocalStorage from '__mocks__/localStorageMock';
import { useLocation } from '__mocks__/react-router-dom';
import { storeResetFns } from '../__mocks__/zustand';
import server from './msw';

class ResizeObserver {
  observe: Mock;
  unobserve: Mock;
  disconnect: Mock;
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}

// required for testing Ant Design 4
global.window.matchMedia = query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

global.window.open = vi.fn();
global.window.ResizeObserver = ResizeObserver;
global.window.scrollTo = vi.fn();

// URL.createObjectURL / revokeObjectURL are not implemented in jsdom.
// Used by triggerDownload in SQLResultsTable and similar programmatic downloads.
global.URL.createObjectURL = jest.fn(() => 'blob:mock');
global.URL.revokeObjectURL = jest.fn();

// Prevent programmatic a.click() calls from triggering jsdom navigation.
HTMLAnchorElement.prototype.click = jest.fn();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const originalConsoleError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('trigger element and popup element should in same shadow root')
    ) {
      return;
    }
    originalConsoleError(...args);
  });
});

beforeEach(() => {
  server.listen();
  useLocation.mockReturnValue({
    pathname: '',
  });
});
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterEach(() => {
  act(() => {
    storeResetFns.forEach(resetFn => resetFn());
  });
});
afterAll(() => server.close());
