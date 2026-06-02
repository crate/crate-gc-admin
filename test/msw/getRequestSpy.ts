import { HttpMethod } from 'utils/api';
import { matchRequestUrl } from 'msw';
import type { Mock } from 'vitest';
import server from 'test/msw/server';

export const getRequestSpy = (method: HttpMethod, url: string): Mock => {
  const requestSpy = vi.fn();

  server.events.on('request:start', async ({ request }: { request: Request }) => {
    if (request.method === method && matchRequestUrl(new URL(request.url), url)) {
      requestSpy();
    }
  });
  return requestSpy;
};
