import { useGCGetPoliciesLogs } from 'hooks/swrHooks';
import { PolicyLogWithName } from 'types';
import { Link } from 'react-router-dom';
import {
  Chip,
  DataTable,
  DisplayDateDifference,
  DisplayUTCDate,
  Loader,
  Text,
} from 'components';
import { ColumnDef, Row } from '@tanstack/react-table';
import moment from 'moment';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { cn, compareDurations, compareIsoDates } from 'utils';
import { DATE_FORMAT, DURATION_FORMAT } from 'constants/defaults';
import { getLogDuration } from 'utils';
import { ActionsInfoError } from '../tablePoliciesUtils/types';
import { POLICY_NAMES } from 'constants/policies';
import { getLogActionsInError } from '../tablePoliciesUtils/policies';

export const POLICIES_LOGS_TABLE_PAGE_SIZE = 10;

const getColumnsDefinition = () => {
  const columns: ColumnDef<PolicyLogWithName>[] = [
    {
      header: 'Policy Name',
      id: 'name',
      meta: {
        columnWidth: '15%',
        filter: {
          label: 'Policies',
          searchBar: true,
        },
      },
      accessorFn: (log: PolicyLogWithName) => {
        return log.job_name;
      },
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => {
        const log = row.original;
        const name = log.job_name;
        const isRunning = log.end === null;

        return (
          <div className="flex flex-col">
            <Link to={`./${encodeURIComponent(log.job_id)}`}>{name}</Link>
            <span className="text-[8px]">
              {isRunning && <Chip color={Chip.colors.ORANGE}>RUNNING</Chip>}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Execution Time',
      id: 'execution_time',
      meta: {
        columnWidth: '25%',
      },
      enableSorting: true,
      accessorFn: (log: PolicyLogWithName) => {
        return moment.utc(log.start).format(DATE_FORMAT);
      },
      cell: ({ row }) => {
        const log = row.original;
        const logAvailable = log.end !== null;
        const inError = log.error !== null;

        return (
          <div className="w-full">
            <span>
              {!logAvailable ? (
                <Text>-</Text>
              ) : (
                <div className="flex gap-2">
                  <div>
                    <span
                      data-testid="execution-time-icon"
                      className={cn(
                        {
                          'bg-red-600': inError,
                          'bg-green-600': !inError,
                        },
                        'flex rounded-full p-1 text-[12px] text-white',
                      )}
                    >
                      {inError ? <CloseOutlined /> : <CheckOutlined />}
                    </span>
                  </div>

                  <div className="flex w-full flex-col">
                    <div className="flex gap-2" data-testid="execution-time">
                      <DisplayUTCDate isoDate={log.end!} tooltip />
                    </div>
                    <Text pale testId="execution-time-difference">
                      <DisplayDateDifference to={log.end!} />
                    </Text>
                  </div>
                </div>
              )}
            </span>
          </div>
        );
      },
      sortingFn: (rowA: Row<PolicyLogWithName>, rowB: Row<PolicyLogWithName>) => {
        const logA = rowA.original;
        const logB = rowB.original;

        return compareIsoDates(logA.start, logB.start);
      },
    },
    {
      header: 'Run Time',
      id: 'run_time',
      meta: {
        columnWidth: '200px',
      },
      enableSorting: true,
      sortingFn: (rowA: Row<PolicyLogWithName>, rowB: Row<PolicyLogWithName>) => {
        const logA = rowA.original;
        const logB = rowB.original;

        return compareDurations(getLogDuration(logA), getLogDuration(logB));
      },
      accessorFn: (log: PolicyLogWithName) => {
        const duration = getLogDuration(log);
        const isRunning = log.end === null;

        if (!duration || isRunning) {
          return '-';
        }
        return moment.utc(duration * 1000).format(DURATION_FORMAT);
      },
      cell: ({ cell }) => {
        const value = cell.getValue<string>();

        return <Text testId="duration">{value}</Text>;
      },
    },
    {
      header: 'Error(s)',
      id: 'status',
      accessorFn: log => {
        if (!log.error) {
          return [];
        } else if (log.statements) {
          return getLogActionsInError(log);
        } else return [];
      },
      meta: {
        filter: {
          label: 'Status',
          accessorFn: log => {
            return log.error ? 'Error' : 'Success';
          },
        },
      },
      enableColumnFilter: true,
      filterFn: (row: Row<PolicyLogWithName>, _: string, filterValues: string[]) => {
        const log = row.original;

        if (filterValues.length === 0) {
          return true;
        }

        return filterValues.some(filterValue => {
          if (filterValue === 'Error') {
            return log.error !== null;
          } else {
            return log.error === null;
          }
        });
      },
      cell: ({ row, cell }) => {
        const log = row.original;
        const actions = cell.getValue<ActionsInfoError[]>();
        const inError = actions.length > 0;
        const isRunning = log.end === null;

        return isRunning ? (
          <Text testId="status-running">-</Text>
        ) : !inError ? (
          <Text testId="status-success">-</Text>
        ) : (
          <div className="flex truncate">
            <div className="flex flex-col truncate">
              {actions.map(el => {
                return (
                  <Text key={el.action} className="truncate">
                    {POLICY_NAMES[el.action]} failed for table(s):{' '}
                    {el.tables
                      .map(tableInfo => {
                        return `${tableInfo.table_schema}.${tableInfo.table_name} on ${tableInfo.partitions} partition(s)`;
                      })
                      .join(',')}
                    .
                  </Text>
                );
              })}
            </div>
          </div>
        );
      },
    },
  ];

  return columns;
};

export default function PoliciesLogs() {
  const { data: policiesLogs, isLoading: isLoadingPolicies } =
    useGCGetPoliciesLogs();

  if (isLoadingPolicies || !policiesLogs) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loader size={Loader.sizes.LARGE} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <DataTable
          data={policiesLogs}
          columns={getColumnsDefinition()}
          className="table-fixed"
          enableFilters
          elementsPerPage={POLICIES_LOGS_TABLE_PAGE_SIZE}
          noResultsLabel="No logs found."
          defaultSorting={[
            {
              id: 'execution_time',
              desc: true,
            },
          ]}
          getRowId={el => `${el.job_id}_${el.start}`}
        />
      </div>
    </>
  );
}
