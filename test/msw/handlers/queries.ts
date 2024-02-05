import { RestHandler, rest } from 'msw';
import query from '../../__mocks__/query';

export const executeQueryPost: RestHandler = rest.post(
  '/api/_sql',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(query));
  },
);

export const executeQueryHandlers: RestHandler[] = [executeQueryPost];
