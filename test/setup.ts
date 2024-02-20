/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="@types/jest" />;
import '@testing-library/jest-dom';

// polyfill window.fetch
import 'whatwg-fetch';
import server from './msw';
import { useLocation } from '__mocks__/react-router-dom';

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
