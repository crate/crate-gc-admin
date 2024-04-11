import { PolicyInput, TPolicyActionValue } from 'types';

export const PARTITIONING_TIME_VALUE_INVALID_VALUE_ERROR =
  'Time value is required and it should be a positive number.';
export const FORCE_MERGE_INVALID_VALUE_ERROR =
  'Number of segments is required and it should be a positive number.';
export const SET_REPLICAS_INVALID_VALUE_ERROR =
  'Number of replicas is not defined correctly. The value should be a number, a number followed by -all, or a number followed by a dash and another number.';

export const EMPTY_POLICY_FORM: PolicyInput = {
  name: '',
  enabled: true,
  targets: [],
  partitioning: {
    column_name: '',
    value: '1',
    unit: 'months',
    operation: '<',
  },
  actions: {
    forceMerge: {
      action: 'force_merge',
      enabled: false,
      value: '',
    },
    setReplicas: {
      action: 'set_replicas',
      enabled: false,
      value: '',
    },
    deletePartition: {
      action: 'delete',
      enabled: false,
      value: null,
    },
  },
} satisfies PolicyInput;

export const POLICY_NAMES: {
  [key in TPolicyActionValue]: string;
} = {
  force_merge: 'Force Merge',
  set_replicas: 'Set Replica(s)',
  delete: 'Delete',
};
