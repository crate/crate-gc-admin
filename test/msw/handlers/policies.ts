import { RestHandler, rest } from 'msw';
import policies from 'test/__mocks__/policies';
import { policiesLogs, policiesLogsWithName } from 'test/__mocks__/policiesLogs';
import { policy, policyEligibleColumns, policyPreview } from 'test/__mocks__/policy';
import handlerFactory from 'test/msw/handlerFactory';

const getAllPolicy: RestHandler = rest.get(
  'http://localhost:5050/api/policies/',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policies));
  },
);

const getAllPoliciesLogs: RestHandler = rest.get(
  'http://localhost:5050/api/policies/logs',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policiesLogsWithName));
  },
);

const getPolicy: RestHandler = rest.get(
  'http://localhost:5050/api/policies/:policyId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policy));
  },
);

const createPolicy: RestHandler = rest.post(
  'http://localhost:5050/api/policies/',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policy));
  },
);

const updatePolicy: RestHandler = rest.put(
  'http://localhost:5050/api/policies/:policyId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policy));
  },
);

const deletePolicy: RestHandler = rest.delete(
  'http://localhost:5050/api/policies/:policyId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(null));
  },
);

const getPolicyLogs: RestHandler = rest.get(
  'http://localhost:5050/api/policies/:policyId/log',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policiesLogs));
  },
);

const getPolicyPreview: RestHandler = rest.post(
  'http://localhost:5050/api/policies/preview',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(policyPreview));
  },
);

const getEligibleColumn: RestHandler = rest.post(
  'http://localhost:5050/api/policies/eligible-columns/',
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

export const customGetAllPolicies = handlerFactory(
  'http://localhost:5050/api/policies/',
);

export const customAllPoliciesLogsGetResponse = handlerFactory(
  'http://localhost:5050/api/policies/logs',
);

export const customGetPolicyLogs = handlerFactory(
  'http://localhost:5050/api/policies/:policyId/log',
);

export const customGetEligibleColumns = handlerFactory(
  'http://localhost:5050/api/policies/eligible-columns/',
  'POST',
);
