/// <reference types="@types/jest" />;
import '@testing-library/jest-dom';

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
global.window.scrollTo = jest.fn();
