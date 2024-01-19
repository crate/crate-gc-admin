import { Job } from '../../src/types';

const scheduledJobs: Job[] = [
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EVG6M77HN6ZQ',
    name: 'Test',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'SELECT 1;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5P96WWT5QC',
    name: 'Job 6',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'SELECT 6;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5P57JF7QTF',
    name: 'Test 3',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'SELECT 3;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5P3ZYF2JZH',
    name: 'Job 2',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'SELECT 1;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5P82HQPFAN',
    name: 'Job 5',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'SELECT 5;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5P6YHXFX8G',
    name: 'Job 4',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'select 4;',
  },
];

export default scheduledJobs;
