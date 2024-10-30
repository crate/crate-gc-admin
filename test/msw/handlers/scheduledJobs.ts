import { rest, RestHandler } from 'msw';
import handlerFactory from 'test/msw/handlerFactory';
import scheduledJob from 'test/__mocks__/scheduledJob';
import scheduledJobs from 'test/__mocks__/scheduledJobs';
import {
  scheduledJobLogs,
  scheduledJobLogsWithName,
} from 'test/__mocks__/scheduledJobLogs';

const getAllScheduledJobs: RestHandler = rest.get(
  'http://localhost:5050/api/scheduled-jobs/',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobs));
  },
);

const createJobPost: RestHandler = rest.post(
  'http://localhost:5050/api/scheduled-jobs/',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJob));
  },
);

const updateJobPut: RestHandler = rest.put(
  'http://localhost:5050/api/scheduled-jobs/:jobId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJob));
  },
);

const getScheduledJobLogs: RestHandler = rest.get(
  'http://localhost:5050/api/scheduled-jobs/:jobId/log',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobLogs));
  },
);

const getAllScheduledJobLogs: RestHandler = rest.get(
  'http://localhost:5050/api/scheduled-jobs/logs',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobLogsWithName));
  },
);

const getAllLogs: RestHandler = rest.get(
  'http://localhost:5050/api/scheduled-jobs/all/logs',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJobLogsWithName));
  },
);

const getScheduledJob: RestHandler = rest.get(
  'http://localhost:5050/api/scheduled-jobs/:jobId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(scheduledJob));
  },
);

const deleteScheduledJob: RestHandler = rest.delete(
  'http://localhost:5050/api/scheduled-jobs/:jobId',
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(null));
  },
);

export const scheduledJobHandlers: RestHandler[] = [
  getAllScheduledJobs,
  createJobPost,
  updateJobPut,
  getScheduledJobLogs,
  getAllLogs,
  getAllScheduledJobLogs,
  getScheduledJob,
  deleteScheduledJob,
];

export const customAllScheduledJobLogsGetResponse = handlerFactory(
  'http://localhost:5050/api/scheduled-jobs/logs',
);
export const customScheduledJobLogsGetResponse = handlerFactory(
  'http://localhost:5050/api/scheduled-jobs/:jobId/log',
);
export const customAllLogsGetResponse = handlerFactory(
  'http://localhost:5050/api/scheduled-jobs/all/logs',
);
export const customScheduledJobGetResponse = handlerFactory(
  'http://localhost:5050/api/scheduled-jobs/',
);
