import { Job } from '../../src/types';
import scheduledJobLogs from './scheduledJobLogs';

const scheduledJob: Job = {
  cron: '* * * * *',
  enabled: true,
  id: '0EVG6M77HN6ZQ',
  name: 'JobName',
  next_run_time: '2024-01-18T14:38:00+00:00',
  sql: 'SELECT 1;',
  last_executions: [scheduledJobLogs[0], scheduledJobLogs[1]],
};

export default scheduledJob;
