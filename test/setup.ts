/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom/vitest';
// polyfill window.fetch
import 'whatwg-fetch';
import { type Mock } from 'vitest';
import { act } from '@testing-library/react';
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
unstableSetRender((node, container) => {
  const containerWithRoot = container as Element & { _reactRoot?: ReturnType<typeof createRoot> };
  containerWithRoot._reactRoot ||= createRoot(container as Element);
  act(() => {
    containerWithRoot._reactRoot!.render(node);
  });
  return async () => {
    await act(async () => {
      containerWithRoot._reactRoot?.unmount();
    });
    delete containerWithRoot._reactRoot;
  };
});

// D-13: Vitest does NOT auto-apply __mocks__/react-router-dom.tsx for node_modules
// without an explicit vi.mock() call. Required for all 13+ components using useNavigate,
// useLocation, etc. to receive the mock instead of the real implementation.
vi.mock('react-router-dom');

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
