import { JobLog, JobLogWithName } from 'types';

const scheduledJobLogs: JobLog[] = [
  {
    end: '2024-01-19T07:58:00.033000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:58:00.023000+00:00',
    statements: {
      '0': {
        duration: 0.0032863449999922523,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:57:00.016000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:57:00.009000+00:00',
    statements: {
      '0': {
        duration: 0.0025099029999182676,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:56:00.019000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:56:00.008000+00:00',
    statements: {
      '0': {
        duration: 0.0033043180000049688,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:55:00.018000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:55:00.009000+00:00',
    statements: {
      '0': {
        duration: 0.0028941809999878387,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:54:00.018000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:54:00.010000+00:00',
    statements: {
      '0': {
        duration: 0.0026393809999945006,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:53:00.017000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:53:00.009000+00:00',
    statements: {
      '0': {
        duration: 0.0026951419999932114,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:52:00.020000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:52:00.012000+00:00',
    statements: {
      '0': {
        duration: 0.0026266440000313196,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:51:00.019000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:51:00.011000+00:00',
    statements: {
      '0': {
        duration: 0.002706217999985938,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:50:00.038000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:50:00.031000+00:00',
    statements: {
      '0': {
        duration: 0.0020520429999919543,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:49:00.052000+00:00',
    error: null,
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:49:00.013000+00:00',
    statements: {
      '0': {
        duration: 0.004335838000002923,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
];

const scheduledJobLogsWithName: JobLogWithName[] = [
  {
    end: '2024-01-19T07:58:00.033000+00:00',
    error: null,
    job_name: 'JOB_NAME1',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:58:00.023000+00:00',
    statements: {
      '0': {
        duration: 0.0032863449999922523,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:57:00.016000+00:00',
    error: null,
    job_name: 'JOB_NAME2',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:57:00.009000+00:00',
    statements: {
      '0': {
        duration: 0.0025099029999182676,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:56:00.019000+00:00',
    error: null,
    job_name: 'JOB_NAME3',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:56:00.008000+00:00',
    statements: {
      '0': {
        duration: 0.0033043180000049688,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:55:00.018000+00:00',
    error: null,
    job_name: 'JOB_NAME4',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:55:00.009000+00:00',
    statements: {
      '0': {
        duration: 0.0028941809999878387,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:54:00.018000+00:00',
    error: null,
    job_name: 'JOB_NAME5',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:54:00.010000+00:00',
    statements: {
      '0': {
        duration: 0.0026393809999945006,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:53:00.017000+00:00',
    error: null,
    job_name: 'JOB_NAME6',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:53:00.009000+00:00',
    statements: {
      '0': {
        duration: 0.0026951419999932114,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:52:00.020000+00:00',
    error: null,
    job_name: 'JOB_NAME7',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:52:00.012000+00:00',
    statements: {
      '0': {
        duration: 0.0026266440000313196,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:51:00.019000+00:00',
    error: null,
    job_name: 'JOB_NAME8',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:51:00.011000+00:00',
    statements: {
      '0': {
        duration: 0.002706217999985938,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:50:00.038000+00:00',
    error: null,
    job_name: 'JOB_NAME9',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:50:00.031000+00:00',
    statements: {
      '0': {
        duration: 0.0020520429999919543,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
  {
    end: '2024-01-19T07:49:00.052000+00:00',
    error: null,
    job_name: 'JOB_NAME10',
    job_id: '0EVG6M77HN6ZQ',
    start: '2024-01-19T07:49:00.013000+00:00',
    statements: {
      '0': {
        duration: 0.004335838000002923,
        sql: 'SELECT 1;',
      },
    },
    task_type: 'sql',
  },
];

const scheduledJobLog: JobLogWithName = {
  ...scheduledJobLogsWithName[0],
  error: null,
  statements: {
    '0': {
      duration: 0.1,
      sql: 'SELECT 1;',
    },
  },
};
const scheduledJobErrorLog: JobLogWithName = {
  ...scheduledJobLog,
  error: 'Query error',
  statements: {
    '0': {
      error: 'QUERY_ERROR',
      sql: 'SELECT 1;',
    },
  },
};
const scheduledJobRunning: JobLogWithName = {
  ...scheduledJobLog,
  end: null,
};

export {
  scheduledJobLogs,
  scheduledJobLogsWithName,
  scheduledJobLog,
  scheduledJobErrorLog,
  scheduledJobRunning,
};
