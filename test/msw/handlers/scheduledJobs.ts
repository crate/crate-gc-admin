import { rest, RestHandler } from 'msw';
import scheduledJob from '../../__mocks__/scheduledJob';
import scheduledJobs from '../../__mocks__/scheduledJobs';
import {
  scheduledJobLogs,
  scheduledJobLogsWithName,
} from '../../__mocks__/scheduledJobLogs';
import handlerFactory from '../handlerFactory';

const getAllScheduledJobs: RestHandler = rest.get(
  '/api/scheduled-jobs/',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobs));
  },
);

const createJobPost: RestHandler = rest.post(
  '/api/scheduled-jobs/',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJob));
  },
);

const updateJobPut: RestHandler = rest.put(
  '/api/scheduled-jobs/:jobId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJob));
  },
);

const getScheduledJobLogs: RestHandler = rest.get(
  '/api/scheduled-jobs/:jobId/log',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobLogs));
  },
);

const getAllScheduledJobLogs: RestHandler = rest.get(
  '/api/scheduled-jobs/logs',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobLogsWithName));
  },
);

const getScheduledJob: RestHandler = rest.get(
  '/api/scheduled-jobs/:jobId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJob));
  },
);

const deleteScheduledJob: RestHandler = rest.delete(
  '/api/scheduled-jobs/:jobId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(null));
  },
);

export const scheduledJobHandlers: RestHandler[] = [
  getAllScheduledJobs,
  createJobPost,
  updateJobPut,
  getScheduledJobLogs,
  getAllScheduledJobLogs,
  getScheduledJob,
  deleteScheduledJob,
];

export const customAllScheduledJobLogsGetResponse = handlerFactory(
  '/api/scheduled-jobs/logs',
);
export const customScheduledJobLogsGetResponse = handlerFactory(
  '/api/scheduled-jobs/:jobId/log',
);
export const customScheduledJobGetResponse = handlerFactory('/api/scheduled-jobs/');
