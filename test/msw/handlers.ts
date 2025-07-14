import { executeQueryHandlers, executeJWTQueryHandlers } from './handlers/queries';
import { scheduledJobHandlers } from './handlers/scheduledJobs';
import { policiesHandlers } from './handlers/policies';
import { jwtHandlers } from './handlers/jwt';

export const handlers = [
  ...scheduledJobHandlers,
  ...policiesHandlers,
  ...executeQueryHandlers,
  ...executeJWTQueryHandlers,
  ...jwtHandlers,
];
