/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom/vitest';
import 'whatwg-fetch';
import { configure, cleanup, act } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { unstableSetRender } from 'antd';
import { actWrapper as messageActWrapper } from 'antd/lib/message';
import { actWrapper as notificationActWrapper } from 'antd/lib/notification';
import { useLocation } from '__mocks__/react-router-dom';
import { storeResetFns } from '../__mocks__/zustand';
import server from './msw';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

configure({ asyncUtilTimeout: 5000 });
afterEach(cleanup);

messageActWrapper(act);
notificationActWrapper(act);

unstableSetRender((node, container) => {
  const containerWithRoot = container as Element & { _reactRoot?: ReturnType<typeof createRoot> };
  containerWithRoot._reactRoot ||= createRoot(container as Element);
  act(() => {
    containerWithRoot._reactRoot!.render(node);
  });
  return () => Promise.resolve();
});

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

beforeEach(() => {
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
