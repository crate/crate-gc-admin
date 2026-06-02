import { type Mock } from 'vitest';
import mockLocalStorage from '__mocks__/localStorageMock';

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

global.window.matchMedia = query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

global.window.open = vi.fn();
global.window.ResizeObserver = ResizeObserver;
global.window.scrollTo = vi.fn();

global.URL.createObjectURL = vi.fn(() => 'blob:mock');
global.URL.revokeObjectURL = vi.fn();

const nativeGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element: Element, pseudoElement?: string | null) => {
  if (pseudoElement) {
    return {
      getPropertyValue: () => '',
      animationName: 'none',
      animationDuration: '0s',
    } as unknown as CSSStyleDeclaration;
  }
  return nativeGetComputedStyle(element);
};

document.addEventListener(
  'click',
  event => {
    const el = event.target;
    if (el instanceof Element && el.closest('a')?.getAttribute('href')?.startsWith('data:')) {
      event.preventDefault();
    }
  },
  { capture: true },
);

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});
