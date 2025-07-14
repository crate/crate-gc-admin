import { http, HttpResponse } from 'msw';
import { policy, policyEligibleColumns, policyPreview } from 'test/__mocks__/policy';
import { policiesLogs, policiesLogsWithName } from 'test/__mocks__/policiesLogs';
import handlerFactory from 'test/msw/handlerFactory';
import policies from 'test/__mocks__/policies';

const getAllPolicy = http.get('http://localhost:5050/api/policies/', () => {
  return HttpResponse.json(policies);
});

const getAllPoliciesLogs = http.get(
  'http://localhost:5050/api/policies/logs',
  () => {
    return HttpResponse.json(policiesLogsWithName);
  },
);

const getPolicy = http.get('http://localhost:5050/api/policies/:policyId', () => {
  return HttpResponse.json(policy);
});

const createPolicy = http.post('http://localhost:5050/api/policies/', () => {
  return HttpResponse.json(policy);
});

const updatePolicy = http.put('http://localhost:5050/api/policies/:policyId', () => {
  return HttpResponse.json(policy);
});

const deletePolicy = http.delete(
  'http://localhost:5050/api/policies/:policyId',
  () => {
    return HttpResponse.json(null);
  },
);

const getPolicyLogs = http.get(
  'http://localhost:5050/api/policies/:policyId/log',
  () => {
    return HttpResponse.json(policiesLogs);
  },
);

const getPolicyPreview = http.post(
  'http://localhost:5050/api/policies/preview',
  () => {
    return HttpResponse.json(policyPreview);
  },
);

const getEligibleColumn = http.post(
  'http://localhost:5050/api/policies/eligible-columns/',
  () => {
    return HttpResponse.json(policyEligibleColumns);
  },
);

export const policiesHandlers = [
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
