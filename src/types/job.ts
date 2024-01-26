export type Job = {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  sql: string;
  next_run_time?: string;
  last_execution?: JobLog;
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
  statements: TJobLogStatementsError;
};
export type SuccessJobLog = {
  error: null;
  statements: TJobLogStatementsSuccess;
};

export type JobLog = {
  job_id: string;
  start: string;
  end: string;
} & (ErrorJobLog | SuccessJobLog);

export type JobInput = {
  name: string;
  cron: string;
  enabled: boolean;
  sql: string;
};
