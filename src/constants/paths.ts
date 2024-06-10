import { Path } from 'path-parser';

export const root = new Path('/');

// auth
export const auth = new Path('/auth');

// help
export const help = new Path('/help');

// sql
export const sql = new Path('/sql');

// automation
export const automation = new Path('/automation');
export const automationCreateJob = new Path('/create-job');
export const automationCreateJobFull = new Path(`${automation.path}/create-job`);
export const automationEditJob = new Path('/edit-job/:jobId');
export const automationEditJobFull = new Path(`${automation.path}/edit-job/:jobId`);
export const automationCreatePolicy = new Path('/create-policy');
export const automationCreatePolicyFull = new Path(
  `${automation.path}/create-policy`,
);
export const automationEditPolicy = new Path('/edit-policy/:policyId');
export const automationEditPolicyFull = new Path(
  `${automation.path}/edit-policy/:policyId`,
);

// tables
export const tables = new Path('/tables');

// nodes
export const nodes = new Path('/nodes');

// users
export const users = new Path('/users');
