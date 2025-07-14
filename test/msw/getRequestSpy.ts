import { HttpMethod } from 'utils/api';
import { matchRequestUrl } from 'msw';
import server from 'test/msw/server';

export const getRequestSpy = (method: HttpMethod, url: string) => {
  const requestSpy = jest.fn();

  server.events.on('request:start', async ({ request }: { request: Request }) => {
    if (request.method === method && matchRequestUrl(new URL(request.url), url)) {
      requestSpy();
    }
  });
  return requestSpy;
};
