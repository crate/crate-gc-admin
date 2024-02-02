import { useState } from 'react';
import {
  useGCGetScheduledJobLastLogs,
  useGCGetScheduledJobs,
} from '../../../hooks/swrHooks';
import { apiDelete } from '../../../utils/api';
import Button from '../../../components/Button';
import CrateTable from '../../../components/CrateTable';
import Loader from '../../../components/Loader';
import Text from '../../../components/Text';
import { cronParser } from '../../../utils/cron';
import { Job, JobLog, TJobLogStatementError } from '../../../types';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import QueryStackTraceModal from '../../../components/QueryStackTraceModal';
import { Popconfirm } from 'antd';
import DisplayUTCDate from '../../../components/DisplayUTCDate';
import useGcApi from '../../../hooks/useGcApi';

export const JOBS_TABLE_PAGE_SIZE = 5;

export type ScheduledJobsTableProps = {
  onManage: (job: Job) => void;
};

export default function ScheduledJobsTable({ onManage }: ScheduledJobsTableProps) {
  const [errorDialogContent, setErrorDialogContent] = useState<
    (TJobLogStatementError & { timestamp: string }) | null
  >(null);
  const [showLoaderDelete, setShowLoaderDelete] = useState(false);
  const {
    data: scheduledJobs,
    mutate: mutateScheduledJobs,
    isLoading: isLoadingJobs,
  } = useGCGetScheduledJobs();
  const scheduledJobsEnriched = useGCGetScheduledJobLastLogs(scheduledJobs || []);
  const gcApi = useGcApi();

  const closeErrorDialog = () => {
    setErrorDialogContent(null);
  };

  const handleDeleteJob = async (job: Job) => {
    setShowLoaderDelete(true);

    await apiDelete(gcApi, `/api/scheduled-jobs/${job.id}`, null, {
      credentials: 'include',
    });
    setShowLoaderDelete(false);
    mutateScheduledJobs(undefined, { revalidate: true });
  };

  if (isLoadingJobs) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader size={Loader.sizes.LARGE} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-a">
      <CrateTable
        dataSource={scheduledJobsEnriched.sort((a: Job, b: Job) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        })}
        columns={[
          {
            title: <span className="font-bold">Active</span>,
            key: 'enabled',
            dataIndex: 'enabled',
            render: (enabled: boolean) => {
              return (
                <span className="text-lg" data-testid="active-icon">
                  {enabled ? (
                    <ClockCircleOutlined className="text-green-600" />
                  ) : (
                    <PauseCircleOutlined className="text-gray-600" />
                  )}
                </span>
              );
            },
          },
          {
            title: <span className="font-bold">Job Name</span>,
            key: 'name',
            dataIndex: 'name',
          },
          {
            title: <span className="font-bold">Schedule</span>,
            key: 'cron',
            dataIndex: 'cron',
            render: (cron: string) => {
              const cronHumanReadable = cronParser(cron);
              if (cronHumanReadable) {
                return `${cron} (${cronHumanReadable.toLocaleLowerCase()})`;
              }
              return cron;
            },
          },
          {
            title: <span className="font-bold">Last Execution</span>,
            key: 'last_executions',
            dataIndex: 'last_executions',
            render: (lastExecutions?: JobLog[]) => {
              const lastExecution = lastExecutions?.filter(
                log => log.end !== null,
              )[0];
              if (lastExecution && lastExecution.end !== null) {
                const inError = lastExecution.error !== null;

                return (
                  <Text
                    className={'flex gap-2 items-center'}
                    testId="last-execution"
                  >
                    <span
                      className="text-lg flex items-center justify-center"
                      data-testid="last-execution-icon"
                    >
                      {inError ? (
                        <CloseCircleOutlined className="text-red-600" />
                      ) : (
                        <CheckCircleOutlined className="text-green-600" />
                      )}
                    </span>

                    <DisplayUTCDate isoDate={lastExecution.end} tooltip />

                    {inError && (
                      <Button
                        kind={Button.kinds.TERTIARY}
                        onClick={() => {
                          const keyInError = Object.keys(lastExecution.statements)
                            .sort()
                            .slice(-1)
                            .pop();
                          setErrorDialogContent({
                            ...lastExecution.statements[keyInError!],
                            timestamp: lastExecution.start,
                          });
                        }}
                      >
                        Error
                      </Button>
                    )}
                  </Text>
                );
              } else return <Text>n/a</Text>;
            },
          },
          {
            title: <span className="font-bold">Next Due</span>,
            key: 'next_run_time',
            dataIndex: 'next_run_time',
            render: (nextRunTime: string | undefined, job: Job) => {
              const isRunning =
                job.last_executions && job.last_executions[0].end === null;

              return (
                <Text>
                  {isRunning ? (
                    <>
                      <Loader size={Loader.sizes.SMALL} /> Running...
                    </>
                  ) : nextRunTime && job.enabled ? (
                    <DisplayUTCDate isoDate={nextRunTime} tooltip />
                  ) : (
                    'n/a'
                  )}
                </Text>
              );
            },
          },
          {
            key: 'actions',
            render: (job: Job) => {
              return (
                <span className="flex gap-2">
                  <Button
                    kind={Button.kinds.TERTIARY}
                    size={Button.sizes.SMALL}
                    onClick={() => {
                      onManage(job);
                    }}
                  >
                    Manage
                  </Button>
                  <Popconfirm
                    title="Are you sure to delete this job?"
                    placement="topLeft"
                    okButtonProps={{
                      loading: showLoaderDelete,
                    }}
                    onConfirm={() => handleDeleteJob(job)}
                  >
                    <Button kind={Button.kinds.TERTIARY} size={Button.sizes.SMALL}>
                      Delete
                    </Button>
                  </Popconfirm>
                </span>
              );
            },
          },
        ]}
        rowKey={'id'}
        pagination={{
          defaultPageSize: JOBS_TABLE_PAGE_SIZE,
        }}
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
  );
}
