import { Job } from 'types';

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
    id: '0EW5P6ASFFX8G',
    name: 'Job 41',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'select 4;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5P6SHXFX8B',
    name: 'Job 42',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'select 4;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5C6YHCFX8G',
    name: 'Job 7',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'select 4;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5P6YHXBX8G',
    name: 'Job 48',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'select 4;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5P6YTYDX8G',
    name: 'Job 009',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'select 4;',
  },
  {
    cron: '* * * * *',
    enabled: true,
    id: '0EW5P6YTYDS8G',
    name: 'New Job 009',
    next_run_time: '2024-01-19T10:25:00+00:00',
    sql: 'select 4;',
  },
].sort((a: Job, b: Job) => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
});

export default scheduledJobs;
