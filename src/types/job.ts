import { z } from 'zod';
import { PolicyLogWithName } from './policies';

export type Job = {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  sql: string;
  next_run_time?: string;
  running: boolean;
  last_job_logs: JobLog[] | null;
  last_execution: JobLog | null;
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
  task_type: 'sql';
} & (ErrorJobLog | SuccessJobLog);

export type JobLogWithName = JobLog & {
  job_name: string;
};

export const JobFormSchemaInput = z.object({
  name: z.string(),
  cron: z.string(),
  enabled: z.boolean().default(true),
  sql: z.string(),
});

export type JobInput = z.infer<typeof JobFormSchemaInput>;

export type TaskLog = JobLogWithName | PolicyLogWithName;
