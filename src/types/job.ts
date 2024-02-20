export type Job = {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  sql: string;
  next_run_time?: string;
};

export type EnrichedJob = Job & {
  last_execution?: JobLog;
  running: boolean;
};

export type TJobLogStatementError = {
  error: string;
  sql: string;
};
export type TJobLogStatementSuccess = {
  duration: number;
  sql: string;
};

export type TJobLogStatementsError = {
  [key: string]: TJobLogStatementError;
};
export type TJobLogStatementsSuccess = {
  [key: string]: TJobLogStatementSuccess;
};

export type ErrorJobLog = {
  error: string;
  statements: TJobLogStatementsError | null;
};
export type SuccessJobLog = {
  error: null;
  statements: TJobLogStatementsSuccess | null;
};

export type JobLog = {
  job_id: string;
  start: string;
  end: string | null;
} & (ErrorJobLog | SuccessJobLog);

export type JobLogWithName = JobLog & {
  job_name: string;
};

export type JobInput = {
  name: string;
  cron: string;
  enabled: boolean;
  sql: string;
};
