import { matchRequestUrl } from 'msw';
import server from '.';
import { HttpMethod } from '../../src/hooks/api';

export const getRequestSpy = (method: HttpMethod, url: string) => {
  const requestSpy = jest.fn();
  server.events.on('request:start', async request => {
    if (request.method === method && matchRequestUrl(new URL(request.url), url)) {
      requestSpy();
    }
  });
  return requestSpy;
};
