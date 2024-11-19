import { RestHandler } from 'msw';
import { scheduledJobHandlers } from './handlers/scheduledJobs';
import { executeQueryHandlers, executeJWTQueryHandlers } from './handlers/queries';
import { policiesHandlers } from './handlers/policies';
import { jwtHandlers } from './handlers/jwt';

export const handlers: RestHandler[] = [
  ...scheduledJobHandlers,
  ...policiesHandlers,
  ...executeQueryHandlers,
  ...executeJWTQueryHandlers,
  ...jwtHandlers,
];
