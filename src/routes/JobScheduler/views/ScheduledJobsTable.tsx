import { useState } from 'react';
import { useGCGetScheduledJobEnriched, useGCGetScheduledJobs } from 'hooks/swrHooks';
import { EnrichedJob, Job, TJobLogStatementError } from 'types';
import useGcApi from 'hooks/useGcApi';
import { Link, useNavigate } from 'react-router-dom';
import { ColumnDef, Table } from '@tanstack/react-table';
import {
  Text,
  Chip,
  Switch,
  DataTable,
  QueryStackTraceModal,
  Loader,
  Button,
  DisplayUTCDate,
  DisplayDateDifference,
} from 'components';
import { cronParser, cn, apiDelete, apiPut } from 'utils';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Popconfirm } from 'antd';

export const JOBS_TABLE_PAGE_SIZE = 10;

type TableAdditionalState = {
  togglingJob: string | null;
};

type GetColumnsDefinitionProps = {
  setError: (error: TJobLogStatementError & { timestamp: string }) => void;
  editJob: (job: EnrichedJob) => void;
  deleteJob: (job: EnrichedJob) => void;
  toggleJobActivation: (job: EnrichedJob, table: Table<EnrichedJob>) => void;
  showLoaderDelete: boolean;
};
const getColumnsDefinition = ({
  setError,
  editJob,
  deleteJob,
  showLoaderDelete,
  toggleJobActivation,
}: GetColumnsDefinitionProps) => {
  const columns: ColumnDef<EnrichedJob>[] = [
    {
      accessorKey: 'enabled',
      header: 'Active',
      cell: ({ row, table }) => {
        const job = row.original;
        const isActive = job.enabled;
        const togglingJob = (
          table.getState().additionalState as TableAdditionalState
        ).togglingJob;
        const isSwitching = togglingJob === job.id;
        return (
          <span
            onClick={() => {
              toggleJobActivation(row.original, table);
            }}
          >
            <Switch.Root
              defaultChecked={isActive}
              loading={isSwitching}
              size={Switch.sizes.SMALL}
            />
          </span>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.original.name;
        const running = row.original.running;
        return (
          <div className="flex flex-col">
            <Text>{name}</Text>
            <span className="text-[8px]">
              {running && <Chip className="bg-orange-400 text-white">RUNNING</Chip>}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'cron',
      header: 'Schedule',
      cell: ({ cell }) => {
        const schedule = cell.getValue<string>();
        return (
          <div className="flex flex-col">
            <Text>{schedule}</Text>
            <Text pale>{cronParser(schedule)}</Text>
          </div>
        );
      },
    },
    {
      accessorKey: 'last_execution',
      header: 'Last Executed',
      cell: ({ row }) => {
        const job = row.original;
        const lastExecution = job.last_execution;
        const logAvailable = lastExecution && lastExecution.end !== null;
        const inError = logAvailable && lastExecution.error !== null;

        return (
          <div className="w-full">
            <span>
              {!logAvailable ? (
                <Text className="pl-7">-</Text>
              ) : (
                <div className="flex gap-2">
                  <div>
                    <span
                      data-testid="last-execution-icon"
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
                    <div className="flex gap-2" data-testid="last-execution">
                      <Link
                        to={`?tab=scheduled_logs&job_name=${encodeURIComponent(job.name)}`}
                      >
                        <DisplayUTCDate isoDate={lastExecution.end!} tooltip />
                      </Link>

                      {inError && (
                        <Button
                          kind={Button.kinds.TERTIARY}
                          size={Button.sizes.SMALL}
                          className="!leading-3 h-auto"
                          onClick={() => {
                            const keyInError = Object.keys(lastExecution.statements!)
                              .sort()
                              .slice(-1)
                              .pop();
                            const statementError =
                              lastExecution.statements![keyInError!];

                            setError({
                              ...statementError,
                              timestamp: lastExecution.start,
                            });
                          }}
                        >
                          Error
                        </Button>
                      )}
                    </div>
                    <Text pale testId="last-execution-difference">
                      <DisplayDateDifference to={lastExecution.end!} />
                    </Text>
                  </div>
                </div>
              )}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'next_run_time',
      header: 'Next Due',
      cell: ({ row }) => {
        const job = row.original;
        const nextRunTime = job.next_run_time;

        return (
          <div className="w-full flex flex-col">
            <Text>
              {nextRunTime ? <DisplayUTCDate isoDate={nextRunTime} tooltip /> : '-'}
            </Text>
            {nextRunTime && (
              <div>
                <Text pale testId="next-execution-difference">
                  <DisplayDateDifference to={nextRunTime} />
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: ' ',
      cell: ({ row }) => {
        const job = row.original;
        return (
          <span className="flex gap-2">
            <Button
              kind={Button.kinds.TERTIARY}
              onClick={() => {
                editJob(job);
              }}
              className="!leading-3"
            >
              <EditOutlined />
            </Button>

            <Popconfirm
              title="Are you sure to delete this job?"
              placement="topLeft"
              okButtonProps={{
                loading: showLoaderDelete,
              }}
              onConfirm={() => deleteJob(job)}
            >
              <Button kind={Button.kinds.TERTIARY} className="!leading-3">
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return columns;
};

export default function ScheduledJobsTable() {
  const navigate = useNavigate();
  const [errorDialogContent, setErrorDialogContent] = useState<
    (TJobLogStatementError & { timestamp: string }) | null
  >(null);
  const [showLoaderDelete, setShowLoaderDelete] = useState(false);
  const {
    data: scheduledJobs,
    mutate: mutateScheduledJobs,
    isLoading: isLoadingJobs,
  } = useGCGetScheduledJobs();
  const {
    jobsToReturn: scheduledJobsEnriched,
    setJobsToReturn: setScheduledJobsEnriched,
  } = useGCGetScheduledJobEnriched(scheduledJobs || []);
  const gcApi = useGcApi();

  const closeErrorDialog = () => {
    setErrorDialogContent(null);
  };

  const handleDeleteJob = async (job: EnrichedJob) => {
    setShowLoaderDelete(true);

    await apiDelete(gcApi, `/api/scheduled-jobs/${job.id}`, null, {
      credentials: 'include',
    });
    await mutateScheduledJobs(undefined, { revalidate: true });

    setShowLoaderDelete(false);
  };

  const toggleJobActivation = async (
    job: EnrichedJob,
    table: Table<EnrichedJob>,
  ) => {
    table.setState(old => {
      return {
        ...old,
        additionalState: {
          togglingJob: job.id,
        },
      };
    });
    await apiPut(gcApi, `/api/scheduled-jobs/${job.id}`, {
      enabled: !job.enabled,
      cron: job.cron,
      name: job.name,
      sql: job.sql,
    });

    const newData = scheduledJobsEnriched;
    newData.forEach(el => {
      if (el.id === job.id) {
        el.enabled = !el.enabled;
      }
    });

    setScheduledJobsEnriched(newData);
    await mutateScheduledJobs();
    table.setState(old => {
      return {
        ...old,
        additionalState: {
          togglingJob: null,
        },
      };
    });
  };

  if (isLoadingJobs) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader size={Loader.sizes.LARGE} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full flex justify-end">
        <Button
          onClick={() => {
            navigate('./create');
          }}
          className="float-end"
        >
          Add New Job
        </Button>
      </div>

      <div className="w-full overflow-x-a">
        <DataTable
          elementsPerPage={JOBS_TABLE_PAGE_SIZE}
          noResultsLabel="No jobs found."
          data={scheduledJobsEnriched.sort((a: Job, b: Job) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          })}
          columns={getColumnsDefinition({
            setError: setErrorDialogContent,
            editJob: (job: EnrichedJob) => {
              navigate(job.id);
            },
            deleteJob: handleDeleteJob,
            showLoaderDelete: showLoaderDelete,
            toggleJobActivation,
          })}
          additionalState={
            {
              togglingJob: null,
            } as TableAdditionalState
          }
          getRowId={el => el.id}
        />

        {errorDialogContent !== null && (
          <QueryStackTraceModal
            visible={errorDialogContent !== null}
            modalTitle="Error Details"
            onClose={closeErrorDialog}
            query={errorDialogContent.sql.trim()}
            queryError={errorDialogContent.error.trim()}
            timestamp={errorDialogContent.timestamp}
          />
        )}
      </div>
    </div>
  );
}
