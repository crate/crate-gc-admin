/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="@types/jest" />;
import '@testing-library/jest-dom';
// polyfill window.fetch
import 'whatwg-fetch';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { unstableSetRender } from 'antd';

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
import mockLocalStorage from '__mocks__/localStorageMock';
import { useLocation } from '__mocks__/react-router-dom';
import server from './msw';

class ResizeObserver {
  observe: jest.Mock<any, any, any>;
  unobserve: jest.Mock<any, any, any>;
  disconnect: jest.Mock<any, any, any>;
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
}

// required for testing Ant Design 4
global.window.matchMedia = query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

global.window.open = jest.fn();
global.window.ResizeObserver = ResizeObserver;
global.window.scrollTo = jest.fn();

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
  jest.clearAllMocks();
});
afterAll(() => server.close());
