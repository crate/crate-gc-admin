import { rest, RestHandler } from 'msw';
import scheduledJob from '../../__mocks__/scheduledJob';
import scheduledJobs from '../../__mocks__/scheduledJobs';
import scheduledJobLogs from '../../__mocks__/scheduledJobLogs';
import handlerFactory from '../handlerFactory';

export const scheduledJobGet: RestHandler = rest.get(
  '/api/scheduled-jobs/',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobs));
  },
);

export const scheduledJobPost: RestHandler = rest.post(
  '/api/scheduled-jobs/',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJob));
  },
);

export const scheduledJobPut: RestHandler = rest.put(
  '/api/scheduled-jobs/:jobId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJob));
  },
);

export const scheduledJobLogsGet: RestHandler = rest.get(
  '/api/scheduled-jobs/:jobId/log',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobLogs));
  },
);

export const scheduledJobLogsDelete: RestHandler = rest.delete(
  '/api/scheduled-jobs/:jobId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobLogs));
  },
);

export const scheduledJobHandlers: RestHandler[] = [
  scheduledJobGet,
  scheduledJobPost,
  scheduledJobPut,
  scheduledJobLogsGet,
  scheduledJobLogsDelete,
];

export const customScheduledJobLogsGetResponse = handlerFactory(
  '/api/scheduled-jobs/:jobId/log',
);
export const customScheduledJobGetResponse = handlerFactory('/api/scheduled-jobs/');
