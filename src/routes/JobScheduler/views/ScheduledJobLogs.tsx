import { useGCGetScheduledJobsLogs } from 'hooks/swrHooks';
import { JobLogWithName, TJobLogStatementError } from 'types';
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
import { getLogDuration } from '../utils/logs';

export const JOB_LOG_TABLE_PAGE_SIZE = 10;

const getColumnsDefinition = ({
  setError,
}: {
  setError: (error: TJobLogStatementError & { timestamp: string }) => void;
}) => {
  const columns: ColumnDef<JobLogWithName>[] = [
    {
      header: 'Job Name',
      id: 'job_name',
      meta: {
        columnWidth: '15%',
        filter: {
          label: 'Jobs',
          accessorFn: log => {
            return log.job_name;
          },
          searchBar: true,
        },
      },
      accessorFn: (log: JobLogWithName) => {
        const isRunning = log.end === null;
        return `${log.job_name} ${isRunning ? 'Running' : ''}`;
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
              {isRunning && (
                <Chip className="bg-orange-400 text-white">RUNNING</Chip>
              )}
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
      accessorFn: (log: JobLogWithName) => {
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
                <Text className="pl-7">-</Text>
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
                        'text-white rounded-full p-1 text-[12px] flex',
                      )}
                    >
                      {inError ? <CloseOutlined /> : <CheckOutlined />}
                    </span>
                  </div>

                  <div className="w-full flex flex-col">
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
      sortingFn: (rowA: Row<JobLogWithName>, rowB: Row<JobLogWithName>) => {
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
      sortingFn: (rowA: Row<JobLogWithName>, rowB: Row<JobLogWithName>) => {
        const logA = rowA.original;
        const logB = rowB.original;

        return compareDurations(getLogDuration(logA), getLogDuration(logB));
      },
      accessorFn: (log: JobLogWithName) => {
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
      header: 'Error',
      id: 'status',
      accessorFn: log => {
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
      filterFn: (row: Row<JobLogWithName>, _: string, filterValues: string[]) => {
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
        const log = row.original;
        const inError = log.error !== null;
        const isRunning = log.end === null;

        return isRunning ? (
          <Text testId="status-running">-</Text>
        ) : !inError ? (
          <Text testId="status-success">-</Text>
        ) : (
          <div className="flex truncate">
            <div className="flex flex-col truncate">
              <Text truncate>{log.error}</Text>
              <div>
                <Button
                  kind={Button.kinds.TERTIARY}
                  size={Button.sizes.SMALL}
                  className="!leading-3 h-auto"
                  onClick={() => {
                    const keyInError = Object.keys(log.statements!)
                      .sort()
                      .slice(-1)
                      .pop();
                    const statementError = log.statements![keyInError!];

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
      },
    },
  ];

  return columns;
};

export default function ScheduledJobLogs() {
  const { data: jobLogs, isLoading: isLoadingJobLogs } = useGCGetScheduledJobsLogs();
  const [errorDialogContent, setErrorDialogContent] = useState<
    (TJobLogStatementError & { timestamp: string }) | null
  >(null);

  const openErrorDialog = (error: TJobLogStatementError & { timestamp: string }) => {
    setErrorDialogContent(error);
  };

  const closeErrorDialog = () => {
    setErrorDialogContent(null);
  };

  if (isLoadingJobLogs || !jobLogs) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader size={Loader.sizes.LARGE} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <DataTable
          data={jobLogs}
          columns={getColumnsDefinition({
            setError: openErrorDialog,
          })}
          className="table-fixed"
          enableFilters
          elementsPerPage={JOB_LOG_TABLE_PAGE_SIZE}
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
