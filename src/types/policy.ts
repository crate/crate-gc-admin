import { z } from 'zod';
import { JobLog } from './job';
import { SET_REPLICAS_VALUE_REGEXP } from 'constants/database';
import { INTEGER_VALUE_REGEXP } from 'constants/utils';
import {
  FORCE_MERGE_INVALID_VALUE_ERROR,
  PARTITIONING_TIME_VALUE_INVALID_VALUE_ERROR,
  SET_REPLICAS_INVALID_VALUE_ERROR,
} from 'constants/policies';

// ZOD

// Target
const PolicyTargetType = z.enum(['', 'schema', 'table']);
const PolicyTargetInput = z.object({
  type: PolicyTargetType,
  name: z.string(),
});

// Partitioning
const PolicyPartitioningUnit = z.enum(['days', 'months', 'years']);
const PolicyPartitioningOperation = z.enum(['<=', '<']);
const PolicyPartitioningFormSchemaInput = z.object({
  column_name: z.string().min(1, {
    message: 'Time Column is a required field.',
  }),
  value: z.string().refine(
    value => {
      const isValueValid = INTEGER_VALUE_REGEXP.test(value);
      return isValueValid && parseInt(value) > 0;
    },
    {
      message: PARTITIONING_TIME_VALUE_INVALID_VALUE_ERROR,
    },
  ),
  unit: PolicyPartitioningUnit,
  operation: PolicyPartitioningOperation,
});

// Actions
const PolicyForceMergeInput = z
  .object({
    action: z.literal('force_merge'),
    enabled: z.boolean(),
    value: z.string(),
  })
  .refine(
    forceMerge => {
      if (!forceMerge.enabled) {
        return true;
      } else {
        const isValueValid = INTEGER_VALUE_REGEXP.test(forceMerge.value);
        return isValueValid && parseInt(forceMerge.value) > 0;
      }
    },
    {
      message: FORCE_MERGE_INVALID_VALUE_ERROR,
    },
  );

const PolicySetReplicasInput = z
  .object({
    action: z.literal('set_replicas'),
    enabled: z.boolean(),
    value: z.string(),
  })
  .refine(
    setReplicas => {
      if (!setReplicas.enabled) {
        return true;
      } else {
        const isValueValid = SET_REPLICAS_VALUE_REGEXP.test(setReplicas.value);
        return isValueValid;
      }
    },
    {
      message: SET_REPLICAS_INVALID_VALUE_ERROR,
    },
  );
const PolicyDeletePartitionInput = z.object({
  action: z.literal('delete'),
  enabled: z.boolean(),
  value: z.null(),
});

// Whole policy
export const PolicyFormSchemaInput = z.object({
  name: z.string().min(1, {
    message: 'Policy Name is a required field.',
  }),
  enabled: z.boolean().default(true),
  targets: z.array(PolicyTargetInput).min(1, {
    message: 'You must select at least one table or one schema.',
  }),
  partitioning: PolicyPartitioningFormSchemaInput,
  actions: z
    .object({
      forceMerge: PolicyForceMergeInput,
      setReplicas: PolicySetReplicasInput,
      deletePartition: PolicyDeletePartitionInput,
    })
    .refine(
      actions => {
        return (
          actions.forceMerge.enabled ||
          actions.setReplicas.enabled ||
          actions.deletePartition.enabled
        );
      },
      { message: 'You must select at least one action.' },
    ),
});

// TYPESCRIPT

// Target
export type TPolicyTargetType = z.infer<typeof PolicyTargetType>;

// Partitioning
export type TPolicyPartitioningUnit = z.infer<typeof PolicyPartitioningUnit>;
export type TPolicyPartitioningOperation = z.infer<
  typeof PolicyPartitioningOperation
>;

// Actions
export type TPolicyForceMergeActionInput = {
  action: 'force_merge';
  value: string;
};
export type TPolicySetReplicasActionInput = {
  action: 'set_replicas';
  value: string;
};
export type TPolicyDeletePartitionActionInput = {
  action: 'delete';
  value: null;
};
export type TPolicyAction =
  | Omit<TPolicyForceMergeActionInput, 'enabled'>
  | Omit<TPolicySetReplicasActionInput, 'enabled'>
  | Omit<TPolicyDeletePartitionActionInput, 'enabled'>;

// Whole Policy Input
export type PolicyInput = z.infer<typeof PolicyFormSchemaInput>;

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
};

export type EnrichedPolicy = Policy & {
  last_execution?: JobLog;
  running: boolean;
};

export type PolicyWithoutId = Omit<Policy, 'id'>;

// Eligible Columns
type EligibleColumnInfo = {
  table_name: string;
  table_schema: string;
};
export type EligibleColumnsApiOutput = {
  eligible_columns: Record<string, EligibleColumnInfo[]>;
};

// Policy Preview
export const PolicyPreviewBody = PolicyFormSchemaInput.omit({
  name: true,
  enabled: true,
  actions: true,
});

export type TPolicyPreviewBody = z.infer<typeof PolicyPreviewBody>;

export type EligibleTable = {
  partitions_affected: number;
  table_name: string;
  table_schema: string;
};

export type EligibleTablesApiOutput = {
  eligible_tables: EligibleTable[];
};
