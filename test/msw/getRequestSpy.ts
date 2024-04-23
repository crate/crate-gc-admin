import { matchRequestUrl } from 'msw';
import server from 'test/msw/server';
import { HttpMethod } from 'utils/api';

export const getRequestSpy = (method: HttpMethod, url: string) => {
  const requestSpy = jest.fn();
  server.events.on('request:start', async request => {
    if (request.method === method && matchRequestUrl(new URL(request.url), url)) {
      requestSpy();
    }
  });
  return requestSpy;
};
