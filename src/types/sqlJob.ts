export type SQLJob = {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  sql: string;
  next_run_time?: string;
  last_execution?: string;
};

export type SQLJobLog = {
  job_id: string;
  start: string;
  end: string;
  error: string;
  statements: JSON;
};
