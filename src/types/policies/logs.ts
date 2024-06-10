// Policy Logs
export type TPolicyActionValue = 'force_merge' | 'set_replicas' | 'delete';
export type TPolicyLogStatementError = {
  action: TPolicyActionValue;
  partition: {
    partitioned_by: {
      [key: string]: number;
    };
    table_name: string;
    table_schema: string;
  };
};
export type TPolicyLogStatementSuccess = {
  duration: number;
  sql: string;
};

export type TPolicyLogStatementsError = {
  [key: string]: TPolicyLogStatementError;
};
export type TPolicyLogStatementsSuccess = {
  [key: string]: TPolicyLogStatementSuccess;
};

export type ErrorPolicyLog = {
  error: string;
  statements: TPolicyLogStatementsError | null;
};
export type SuccessPolicyLog = {
  error: null;
  statements: TPolicyLogStatementsSuccess | null;
};

export type PolicyLog = {
  job_id: string;
  start: string;
  end: string | null;
  task_type: 'policy';
} & (ErrorPolicyLog | SuccessPolicyLog);

export type PolicyLogWithName = PolicyLog & {
  job_name: string;
};
