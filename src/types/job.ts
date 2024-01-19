export type Job = {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  sql: string;
  next_run_time?: string;
  last_execution?: JobLog;
};

export type JobLog = {
  job_id: string;
  start: string;
  end: string;
  error: string | null;
  statements: unknown;
};

export type JobInput = {
  name: string;
  cron: string;
  enabled: boolean;
  sql: string;
};
