import { RestHandler, rest } from 'msw';
import policies from 'test/__mocks__/policies';
import { policiesLogs, policiesLogsWithName } from 'test/__mocks__/policiesLogs';
import { policy, policyEligibleColumns, policyPreview } from 'test/__mocks__/policy';
import handlerFactory from '../handlerFactory';

const getAllPolicy: RestHandler = rest.get('/api/policies/', (_, res, ctx) => {
  return res(ctx.status(200), ctx.json(policies));
});

const getAllPoliciesLogs: RestHandler = rest.get(
  '/api/policies/logs',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policiesLogsWithName));
  },
);

const getPolicy: RestHandler = rest.get('/api/policies/:policyId', (_, res, ctx) => {
  return res(ctx.status(200), ctx.json(policy));
});

const createPolicy: RestHandler = rest.post('/api/policies/', (_, res, ctx) => {
  return res(ctx.status(200), ctx.json(policy));
});

const updatePolicy: RestHandler = rest.put(
  '/api/policies/:policyId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policy));
  },
);

const deletePolicy: RestHandler = rest.delete(
  '/api/policies/:policyId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(null));
  },
);

const getPolicyLogs: RestHandler = rest.get(
  '/api/policies/:policyId/log',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policiesLogs));
  },
);

const getPolicyPreview: RestHandler = rest.post(
  '/api/policies/preview',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policyPreview));
  },
);

const getEligibleColumn: RestHandler = rest.post(
  '/api/policies/eligible-columns/',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policyEligibleColumns));
  },
);

export const policiesHandlers: RestHandler[] = [
  getAllPolicy,
  getAllPoliciesLogs,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPolicyLogs,
  getPolicyPreview,
  getEligibleColumn,
];

export const customGetAllPolicies = handlerFactory('/api/policies/');

export const customAllPoliciesLogsGetResponse = handlerFactory('/api/policies/logs');

export const customGetPolicyLogs = handlerFactory('/api/policies/:policyId/log');

export const customGetEligibleColumns = handlerFactory(
  '/api/policies/eligible-columns/',
  'POST',
);
