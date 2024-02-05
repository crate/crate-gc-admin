import { RestHandler } from 'msw';
import { scheduledJobHandlers } from './handlers/scheduledJobs';
import { executeQueryHandlers } from './handlers/queries';

export const handlers: RestHandler[] = [
  ...scheduledJobHandlers,
  ...executeQueryHandlers,
];
