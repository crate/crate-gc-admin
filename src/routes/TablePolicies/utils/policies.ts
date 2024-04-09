import { mapTableListEntriesToTreeItem } from 'routes/TablePolicies/utils/tableTree';
import {
  Policy,
  PolicyInput,
  PolicyWithoutId,
  TPolicyTarget,
  PolicyLog,
  TPolicyActionValue,
  TPolicyAction,
} from 'types';
import { TableListEntry } from 'types/cratedb';
import { ActionsInfoError, ActionsInfoTablesError } from './types';

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

export const isTargetDeleted = (target: TPolicyTarget, tables: TableListEntry[]) => {
  const schemasTree = mapTableListEntriesToTreeItem(tables!);

  // Don't consider targets that has been deleted!
  if (target.type === 'schema') {
    return schemasTree.map(schemaItem => schemaItem.key).includes(target.name);
  } else if (target.type === 'table') {
    return schemasTree.some(schemaItem => {
      return schemaItem.children?.some(tableItem => {
        return tableItem.key === target.name;
      });
    });
  }
};

export const getLogActionsInError = (log: PolicyLog): ActionsInfoError[] => {
  if (!log.error || !log.statements) {
    return [];
  }

  const actionsInError = new Map<TPolicyActionValue, Map<string, number>>();

  // Populate Map
  Object.keys(log.statements).forEach(keyInError => {
    const logInfo = log.statements![keyInError];
    const action = logInfo.action;
    const tableName = `${logInfo.partition.table_schema}.${logInfo.partition.table_name}`;

    if (!actionsInError.has(action)) {
      actionsInError.set(action, new Map());
    }

    const tablesInError = actionsInError.get(action)!;

    if (!tablesInError.has(tableName)) {
      tablesInError.set(tableName, 0);
    }

    tablesInError.set(tableName, tablesInError.get(tableName)! + 1);
  });

  const actions: ActionsInfoError[] = Array.from(actionsInError.keys()).map(
    action => {
      const tablesInError = actionsInError.get(action as TPolicyActionValue)!;
      const tables: ActionsInfoTablesError[] = Array.from(tablesInError.keys()).map(
        table => {
          const [tableSchema, tableName] = table.split('.');

          return {
            table_name: tableName,
            table_schema: tableSchema,
            partitions: tablesInError.get(table)!,
          } satisfies ActionsInfoTablesError;
        },
      );

      return {
        action: action as TPolicyActionValue,
        tables: tables,
      } satisfies ActionsInfoError;
    },
  );

  return actions;
};
