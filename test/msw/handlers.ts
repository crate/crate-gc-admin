import { RestHandler } from 'msw';
import { scheduledJobHandlers } from './handlers/scheduledJobs';

export const handlers: RestHandler[] = [...scheduledJobHandlers];
