import { PolicyLog } from '.';
import {
  TPolicyAction,
  TPolicyPartitioningOperation,
  TPolicyPartitioningUnit,
  TPolicyTargetType,
} from './input';

// Policy (from DB)

export type TPolicyTarget = {
  type: TPolicyTargetType;
  name: string;
};

export type TPolicyPartitioning = {
  column_name: string;
  operation: TPolicyPartitioningOperation;
  value: number;
  unit: TPolicyPartitioningUnit;
};

export type Policy = {
  id: string;
  name: string;
  enabled: boolean;
  targets: TPolicyTarget[];
  partitioning: TPolicyPartitioning;
  actions: TPolicyAction[];
  next_run_time?: string;
};

export type EnrichedPolicy = Policy & {
  last_execution?: PolicyLog;
  running: boolean;
};

export type PolicyWithoutId = Omit<Policy, 'id'>;
