import { RestHandler } from 'msw';
import { scheduledJobHandlers } from './handlers/scheduledJobs';
import { executeQueryHandlers } from './handlers/queries';
import { policiesHandlers } from './handlers/policies';

export const handlers: RestHandler[] = [
  ...scheduledJobHandlers,
  ...policiesHandlers,
  ...executeQueryHandlers,
];
