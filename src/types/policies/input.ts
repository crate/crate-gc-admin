import { SET_REPLICAS_VALUE_REGEXP } from 'constants/database';
import {
  FORCE_MERGE_INVALID_VALUE_ERROR,
  PARTITIONING_TIME_VALUE_INVALID_VALUE_ERROR,
  SET_REPLICAS_INVALID_VALUE_ERROR,
} from 'constants/policies';
import { INTEGER_VALUE_REGEXP } from 'constants/utils';
import { z } from 'zod';

// ZOD section

// Target
const PolicyTargetType = z.enum(['', 'schema', 'table']);
export const PolicyTargetInput = z.object({
  type: PolicyTargetType,
  name: z.string(),
});

// Partitioning
const PolicyPartitioningUnit = z.enum(['days', 'weeks', 'months', 'years']);
const PolicyPartitioningOperation = z.enum(['<=', '<']);
export const PolicyPartitioningFormSchemaInput = z.object({
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

// Whole policy input (form)
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
        // Delete action can be used only alone
        if (
          (actions.forceMerge.enabled || actions.setReplicas.enabled) &&
          actions.deletePartition.enabled
        ) {
          return false;
        }

        return (
          actions.forceMerge.enabled ||
          actions.setReplicas.enabled ||
          actions.deletePartition.enabled
        );
      },
      {
        message: 'You must select at least one action.',
      },
    ),
});

// TYPESCRIPT section

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
