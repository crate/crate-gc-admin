import { http, HttpResponse } from 'msw';
import handlerFactory from 'test/msw/handlerFactory';
import scheduledJob from 'test/__mocks__/scheduledJob';
import scheduledJobs from 'test/__mocks__/scheduledJobs';
import {
  scheduledJobLogs,
  scheduledJobLogsWithName,
} from 'test/__mocks__/scheduledJobLogs';

const getAllScheduledJobs = http.get(
  'http://localhost:5050/api/scheduled-jobs/',
  () => {
    return HttpResponse.json(scheduledJobs);
  },
);

const createJobPost = http.post('http://localhost:5050/api/scheduled-jobs/', () => {
  return HttpResponse.json(scheduledJob);
});

const updateJobPut = http.put(
  'http://localhost:5050/api/scheduled-jobs/:jobId',
  () => {
    return HttpResponse.json(scheduledJob);
  },
);

const getScheduledJobLogs = http.get(
  'http://localhost:5050/api/scheduled-jobs/:jobId/log',
  () => {
    return HttpResponse.json(scheduledJobLogs);
  },
);

const getAllScheduledJobLogs = http.get(
  'http://localhost:5050/api/scheduled-jobs/logs',
  () => {
    return HttpResponse.json(scheduledJobLogsWithName);
  },
);

const getAllLogs = http.get(
  'http://localhost:5050/api/scheduled-jobs/all/logs',
  () => {
    return HttpResponse.json(scheduledJobLogsWithName);
  },
);

const getScheduledJob = http.get(
  'http://localhost:5050/api/scheduled-jobs/:jobId',
  () => {
    return HttpResponse.json(scheduledJob);
  },
);

const deleteScheduledJob = http.delete(
  'http://localhost:5050/api/scheduled-jobs/:jobId',
  () => {
    return HttpResponse.json(null);
  },
);

export const scheduledJobHandlers = [
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
