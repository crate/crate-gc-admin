import { Policy, TPolicyAction, PolicyInput, PolicyWithoutId } from 'types';

export const mapPolicyToPolicyInput = (policy: Policy): PolicyInput => {
  const forceMerge = policy.actions.find(el => el.action === 'force_merge');
  const setReplica = policy.actions.find(el => el.action === 'set_replicas');
  const deletePartition = policy.actions.find(el => el.action === 'delete');

  return {
    name: policy.name,
    enabled: policy.enabled,
    targets: policy.targets,
    partitioning: {
      ...policy.partitioning,
      value: policy.partitioning.value.toString(),
    },
    actions: {
      forceMerge: {
        action: 'force_merge',
        enabled: typeof forceMerge !== 'undefined',
        value:
          typeof forceMerge !== 'undefined' ? (forceMerge.value as string)! : '',
      },
      setReplicas: {
        action: 'set_replicas',
        enabled: typeof setReplica !== 'undefined',
        value:
          typeof setReplica !== 'undefined' ? (setReplica.value as string)! : '',
      },
      deletePartition: {
        action: 'delete',
        enabled: typeof deletePartition !== 'undefined',
        value: null,
      },
    },
  } satisfies PolicyInput;
};

export const mapPolicyInputToPolicyWithoutId = (
  policyInput: PolicyInput,
): PolicyWithoutId => {
  const forceMerge = policyInput.actions.forceMerge;
  const setReplica = policyInput.actions.setReplicas;
  const deletePartition = policyInput.actions.deletePartition;

  const actions: TPolicyAction[] = [];
  if (forceMerge.enabled) {
    actions.push({
      action: 'force_merge',
      value: forceMerge.value,
    });
  }
  if (setReplica.enabled) {
    actions.push({
      action: 'set_replicas',
      value: setReplica.value!,
    });
  }
  if (deletePartition.enabled) {
    actions.push({
      action: 'delete',
      value: null,
    });
  }

  return {
    name: policyInput.name,
    enabled: policyInput.enabled,
    targets: policyInput.targets,
    partitioning: {
      ...policyInput.partitioning,
      value: parseInt(policyInput.partitioning.value),
    },
    actions: actions,
  } satisfies PolicyWithoutId;
};
