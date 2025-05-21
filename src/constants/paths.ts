import { Path } from 'path-parser';

export const root = new Path('/');

// auth
export const auth = new Path('/auth');

// help
export const help = new Path('/help');

// sql
export const sql = new Path('/sql');

// automation
export const automationScheduledJobs = new Path('/automation/scheduled-jobs');
export const automationCreateJob = new Path('/automation/scheduled-jobs/create-job');
export const automationEditJob = new Path(
  '/automation/scheduled-jobs/edit-job/:jobId',
);
export const automationTablePolicies = new Path('/automation/table-policies');
export const automationCreatePolicy = new Path(
  '/automation/table-policies/create-policy',
);
export const automationEditPolicy = new Path(
  '/automation/table-policies/edit-policy/:policyId',
);
export const automationLogs = new Path('/automation/logs');

// tables
export const tables = new Path('/tables');

// nodes
export const nodes = new Path('/nodes');

// users
export const users = new Path('/users');

// tables shards
export const tablesShards = new Path('/shards');
