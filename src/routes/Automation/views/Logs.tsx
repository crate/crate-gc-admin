import { useGCGetScheduledJobsAllLogs } from 'hooks/swrHooks';
import {
  JobLogWithName,
  PolicyLogWithName,
  TJobLogStatementError,
  TaskLog,
} from 'types';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Chip,
  DataTable,
  DisplayDateDifference,
  DisplayUTCDate,
  Loader,
  QueryStackTraceModal,
  Text,
} from 'components';
import { ColumnDef, Row } from '@tanstack/react-table';
import moment from 'moment';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { cn, compareDurations, compareIsoDates } from 'utils';
import { DATE_FORMAT, DURATION_FORMAT } from 'constants/defaults';
import { getLogDuration } from 'utils';
import { automationEditJob, automationEditPolicy } from 'constants/paths';
import { POLICY_NAMES } from 'constants/policies';
import { ActionsInfoError } from '../tablePoliciesUtils/types';
import { getLogActionsInError } from '../tablePoliciesUtils/policies';

export const JOBS_LOGS_TABLE_PAGE_SIZE = 10;

type SetErrorFunction = (
  error: TJobLogStatementError & { timestamp: string },
) => void;

const renderNameColumn = (log: TaskLog) => {
  const name = log.job_name;
  const isRunning = log.end === null;
  const editTaskLink =
    log.task_type === 'sql'
      ? automationEditJob.build({
          jobId: log.job_id,
        })
      : automationEditPolicy.build({
          policyId: log.job_id,
        });

  return (
    <div className="flex flex-col">
      <Link to={`.${editTaskLink}`}>{name}</Link>
      <span className="text-[8px]">
        {isRunning && <Chip color={Chip.colors.ORANGE}>RUNNING</Chip>}
      </span>
    </div>
  );
};

const renderExecutionTimeColumn = (log: TaskLog) => {
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
};

const renderRunTimeColumn = (value: string) => {
  return <Text testId="duration">{value}</Text>;
};

const renderJobError = (log: JobLogWithName, setError: SetErrorFunction) => {
  return (
    <div className="flex truncate">
      <div className="flex flex-col truncate">
        <Text truncate>{log.error}</Text>
        <div>
          <Button
            kind={Button.kinds.TERTIARY}
            size={Button.sizes.SMALL}
            className="h-auto !leading-3"
            onClick={() => {
              const keyInError = Object.keys(log.statements!).sort().slice(-1).pop();
              const statementError = log.statements![
                keyInError!
              ] as TJobLogStatementError;

              setError({
                ...statementError,
                timestamp: log.start,
              });
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

const renderPolicyError = (log: PolicyLogWithName) => {
  const actions: ActionsInfoError[] = getLogActionsInError(log);

  return (
    <div className="flex">
      <div className="flex flex-col">
        {actions.map(el => {
          return (
            <Text key={el.action}>
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
};

const renderErrorsColumn = (log: TaskLog, setError: SetErrorFunction) => {
  const inError = log.error !== null;
  const isRunning = log.end === null;

  return isRunning ? (
    <Text testId="status-running">-</Text>
  ) : !inError ? (
    <Text testId="status-success">-</Text>
  ) : log.task_type === 'sql' ? (
    // JOB
    renderJobError(log, setError)
  ) : (
    // POLICY
    renderPolicyError(log)
  );
};

const getColumnsDefinition = ({ setError }: { setError: SetErrorFunction }) => {
  const columns: ColumnDef<TaskLog>[] = [
    {
      header: 'Name',
      id: 'name',
      meta: {
        columnWidth: '15%',
        filter: {
          label: 'Tasks',
          searchBar: true,
        },
      },
      accessorFn: (log: TaskLog) => {
        return log.job_name;
      },
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => {
        return renderNameColumn(row.original);
      },
    },
    {
      header: 'Execution Time',
      id: 'execution_time',
      meta: {
        columnWidth: '25%',
      },
      enableSorting: true,
      accessorFn: (log: TaskLog) => {
        return moment.utc(log.start).format(DATE_FORMAT);
      },
      cell: ({ row }) => {
        return renderExecutionTimeColumn(row.original);
      },
      sortingFn: (rowA: Row<TaskLog>, rowB: Row<TaskLog>) => {
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
      sortingFn: (rowA: Row<TaskLog>, rowB: Row<TaskLog>) => {
        const logA = rowA.original;
        const logB = rowB.original;

        return compareDurations(getLogDuration(logA), getLogDuration(logB));
      },
      accessorFn: (log: TaskLog) => {
        const duration = getLogDuration(log);
        const isRunning = log.end === null;

        if (!duration || isRunning) {
          return '-';
        }
        return moment.utc(duration * 1000).format(DURATION_FORMAT);
      },
      cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return renderRunTimeColumn(value);
      },
    },
    {
      header: 'Error(s)',
      id: 'status',
      accessorFn: (log: TaskLog) => {
        return log.error ? log.error : 'Success';
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
      filterFn: (row: Row<TaskLog>, _: string, filterValues: string[]) => {
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
      cell: ({ row }) => {
        return renderErrorsColumn(row.original, setError);
      },
    },
  ];

  return columns;
};

export default function Logs() {
  const { data: jobsLogs, isLoading: isLoadingJobsLogs } =
    useGCGetScheduledJobsAllLogs();
  const [errorDialogContent, setErrorDialogContent] = useState<
    (TJobLogStatementError & { timestamp: string }) | null
  >(null);

  const openErrorDialog = (error: TJobLogStatementError & { timestamp: string }) => {
    setErrorDialogContent(error);
  };

  const closeErrorDialog = () => {
    setErrorDialogContent(null);
  };

  if (isLoadingJobsLogs || !jobsLogs) {
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
          data={jobsLogs}
          columns={getColumnsDefinition({
            setError: openErrorDialog,
          })}
          className="table-fixed"
          enableFilters
          elementsPerPage={JOBS_LOGS_TABLE_PAGE_SIZE}
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

      <QueryStackTraceModal
        visible={errorDialogContent !== null}
        modalTitle="Error Details"
        onClose={closeErrorDialog}
        query={errorDialogContent ? errorDialogContent.sql.trim() : ''}
        queryError={errorDialogContent ? errorDialogContent.error.trim() : ''}
        timestamp={errorDialogContent ? errorDialogContent.timestamp : ''}
      />
    </>
  );
}
