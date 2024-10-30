import { rest, RestHandler } from 'msw';

const clusterJWT: RestHandler = rest.get(
  '/api/v2/clusters/undefined/jwt',
  (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: { cluster_id: 'my-local-test-cluster' },
        status: 200,
        success: true,
      }),
    );
  },
);

const clusterAuth: RestHandler = rest.get(
  'http://localhost:5050/api/auth',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  },
);

export const jwtHandlers: RestHandler[] = [clusterJWT, clusterAuth];
