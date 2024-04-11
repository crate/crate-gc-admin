import { AxiosInstance } from 'axios';
import { useGetPartitionedTables } from 'hooks/swrHooks';
import useGcApi from 'hooks/useGcApi';
import { useEffect, useState } from 'react';
import {
  EligibleColumnTarget,
  EligibleColumnsApiOutput,
  TPolicyTarget,
} from 'types';
import { apiPost } from 'utils';
import { mapTableListEntriesToTreeItem } from '../utils/tableTree';
import { isTargetDeleted } from '../utils/policies';

const getEligibleColumns = async (
  gcApi: AxiosInstance,
  targets: TPolicyTarget[],
) => {
  const columns = await apiPost<EligibleColumnsApiOutput>(
    gcApi,
    '/api/policies/eligible-columns/',
    {
      targets,
    },
  );

  return columns.data;
};

type TimeColumn = {
  name: string;
  targets: EligibleColumnTarget[];
};
type TimeColumns = TimeColumn[];

type UseTimeColumnsProps = {
  targets: TPolicyTarget[];
  columnName: string;
  clearColumnName: () => void;
};
export default function useEligibleColumns({
  targets,
  columnName,
  clearColumnName,
}: UseTimeColumnsProps) {
  const gcApi = useGcApi();
  const { data: tables, isLoading: loadingTables } = useGetPartitionedTables(false);
  const [eligibleColumns, setEligibleColumns] = useState<TimeColumns>([]);
  const [showColumnsWarning, setShowColumnsWarning] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(true);

  const getColumnTargets = (columnName: string) => {
    const column = eligibleColumns.find(col => col.name === columnName);
    return column ? column.targets : [];
  };

  const isColumnEligible = (columnName: string) => {
    return eligibleColumns.map(col => col.name).includes(columnName);
  };

  useEffect(() => {
    // Update eligible columns if targets changes
    if (targets.length === 0) {
      setLoadingColumns(false);
      setEligibleColumns([]);
    } else {
      setLoadingColumns(true);
      getEligibleColumns(gcApi, targets).then(columns => {
        setLoadingColumns(false);
        if (columns !== null) {
          const eligibleColumns = Object.keys(columns.eligible_columns).map(
            columnName => {
              return {
                name: columnName,
                targets: columns.eligible_columns[columnName],
              } satisfies TimeColumn;
            },
          ) as TimeColumns;

          setEligibleColumns(eligibleColumns);
        } else {
          setEligibleColumns([]);
        }
      });
    }
  }, [targets]);

  useEffect(() => {
    // Check that the current value of columnName is in the output
    if (!isColumnEligible(columnName) && !loadingColumns && columnName !== '') {
      // Clear the column name
      clearColumnName();
    }
  }, [eligibleColumns]);

  useEffect(() => {
    if (columnName === '' || loadingColumns) {
      setShowColumnsWarning(false);
      return;
    }

    const columnTargets: EligibleColumnTarget[] = getColumnTargets(columnName);
    const schemasTree = mapTableListEntriesToTreeItem(tables!);

    const isValid = targets
      .filter(target => {
        return isTargetDeleted(target, tables!);
      })
      .every(policyTarget => {
        if (policyTarget.type === 'table') {
          const isTableValid = columnTargets.some(columnTarget => {
            const targetFullName = `${columnTarget.table_schema}.${columnTarget.table_name}`;
            return policyTarget.name === targetFullName;
          });
          return isTableValid;
        } else if (policyTarget.type === 'schema') {
          // All the parted tables inside schema schould have this column
          const schemaInTree = schemasTree.find(
            schemaItem => schemaItem.key === policyTarget.name,
          );

          return (
            schemaInTree &&
            schemaInTree.children?.every(tableInTree => {
              return columnTargets.some(columnTarget => {
                const targetFullName = `${columnTarget.table_schema}.${columnTarget.table_name}`;
                return tableInTree.key === targetFullName;
              });
            })
          );
        }
      });

    setShowColumnsWarning(!isValid);
  }, [targets, columnName, loadingColumns]);

  return {
    eligibleColumns,
    tables,
    loadingColumns,
    loadingTables,
    showColumnsWarning,
    isColumnEligible,
  };
}
