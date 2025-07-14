import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  automationCreateJob,
  automationEditJob,
  automationLogs,
} from 'constants/paths';
import { cronParser, cn, apiDelete, apiPut, sortByString } from 'utils';
import { ColumnDef, Table } from '@tanstack/react-table';
import { Link, useNavigate } from 'react-router-dom';
import { Popconfirm } from 'antd';
import { useState } from 'react';
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
import { useGCGetScheduledJobs } from 'hooks/swrHooks';
import { Job, TJobLogStatementError } from 'types';
import useGcApi from 'hooks/useGcApi';

export const JOBS_TABLE_PAGE_SIZE = 10;

type TableAdditionalState = {
  togglingJob: string | null;
};

type GetColumnsDefinitionProps = {
  setError: (error: TJobLogStatementError & { timestamp: string }) => void;
  editJob: (job: Job) => void;
  deleteJob: (job: Job) => void;
  toggleJobActivation: (job: Job, table: Table<Job>) => void;
  showLoaderDelete: boolean;
  pathPrefix?: string;
};

const getColumnsDefinition = ({
  setError,
  editJob,
  deleteJob,
  showLoaderDelete,
  toggleJobActivation,
  pathPrefix,
}: GetColumnsDefinitionProps) => {
  const columns: ColumnDef<Job>[] = [
    {
      accessorKey: 'enabled',
      header: 'Active',
      meta: {
        minWidth: '70px',
      },
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
              toggleJobActivation(job, table);
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
      meta: {
        minWidth: '15%',
      },
      cell: ({ row }) => {
        const name = row.original.name;
        const running = row.original.running;
        return (
          <div className="flex flex-col">
            <Text>{name}</Text>
            <span className="text-[8px]">
              {running && <Chip color={Chip.colors.ORANGE}>RUNNING</Chip>}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'cron',
      header: 'Schedule',
      meta: {
        minWidth: '20%',
      },
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
      header: 'Last executed',
      cell: ({ row }) => {
        const job = row.original;
        const lastExecution = job.last_execution;
        const logAvailable = lastExecution && lastExecution.end !== null;
        const inError = logAvailable && lastExecution.error !== null;

        return (
          <div className="w-full">
            <span>
              {!logAvailable ? (
                <Text>-</Text>
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
                        'flex rounded-full p-1 text-[12px] text-white',
                      )}
                    >
                      {inError ? <CloseOutlined /> : <CheckOutlined />}
                    </span>
                  </div>

                  <div className="flex w-full flex-col">
                    <div className="flex gap-2" data-testid="last-execution">
                      <Link
                        to={`${pathPrefix}${automationLogs.path}?name=${encodeURIComponent(job.name)}`}
                      >
                        <DisplayUTCDate isoDate={lastExecution.end!} tooltip />
                      </Link>

                      {inError && (
                        <Button
                          kind={Button.kinds.TERTIARY}
                          size={Button.sizes.SMALL}
                          className="h-auto !leading-3"
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
      header: 'Next due',
      cell: ({ row }) => {
        const job = row.original;
        const nextRunTime = job.next_run_time;

        return (
          <div className="flex w-full flex-col">
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
      meta: {
        minWidth: '80px',
      },
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

type JobsTableProps = { onDeleteJob?: () => void; pathPrefix?: string };

export default function JobsTable({ onDeleteJob, pathPrefix = '' }: JobsTableProps) {
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

  const enrichedScheduledJobs = scheduledJobs?.map(job => ({
    ...job,
    running:
      job.last_job_logs && job.last_job_logs[0] && job.last_job_logs[0].end === null
        ? true
        : false,
    last_execution: (job.last_job_logs ?? []).filter(log => log.end !== null)[0],
  }));

  const gcApi = useGcApi();

  const closeErrorDialog = () => {
    setErrorDialogContent(null);
  };

  const handleDeleteJob = async (job: Job) => {
    if (onDeleteJob) {
      onDeleteJob();
    }
    setShowLoaderDelete(true);

    await apiDelete(gcApi, `/api/scheduled-jobs/${job.id}`, null, {
      credentials: 'include',
    });
    await mutateScheduledJobs(undefined, { revalidate: true });

    setShowLoaderDelete(false);
  };

  const toggleJobActivation = async (job: Job, table: Table<Job>) => {
    table.setState(old => {
      return {
        ...old,
        additionalState: {
          togglingJob: job.id,
        } satisfies TableAdditionalState,
      };
    });
    await apiPut(gcApi, `/api/scheduled-jobs/${job.id}`, {
      enabled: !job.enabled,
      cron: job.cron,
      name: job.name,
      sql: job.sql,
    });

    const newData = enrichedScheduledJobs;
    newData?.forEach(el => {
      if (el.id === job.id) {
        el.enabled = !el.enabled;
      }
    });

    await mutateScheduledJobs();
    table.setState(old => {
      return {
        ...old,
        additionalState: {
          togglingJob: null,
        } satisfies TableAdditionalState,
      };
    });
  };

  if (isLoadingJobs) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loader size={Loader.sizes.MEDIUM} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full justify-end">
        <Button
          onClick={() => {
            navigate(`${pathPrefix}${automationCreateJob.build()}`);
          }}
          className="float-end"
        >
          Add new job
        </Button>
      </div>

      <div className="overflow-auto">
        <DataTable
          elementsPerPage={JOBS_TABLE_PAGE_SIZE}
          data={(enrichedScheduledJobs ?? []).sort(sortByString('name'))}
          columns={getColumnsDefinition({
            setError: setErrorDialogContent,
            editJob: (job: Job) => {
              navigate(
                `${pathPrefix}${automationEditJob.build({
                  jobId: job.id,
                })}`,
              );
            },
            deleteJob: handleDeleteJob,
            showLoaderDelete: showLoaderDelete,
            toggleJobActivation,
            pathPrefix,
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
