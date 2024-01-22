import {
  Button,
  CrateTable,
  ConfirmDelete,
  DisplayDate,
  Text,
  RoundedIcon,
} from '@crate.io/crate-ui-components';
import { useState } from 'react';
import { useGCContext } from '../../../contexts';
import {
  useGCGetScheduledJobLastLogs,
  useGCGetScheduledJobs,
} from '../../../hooks/swrHooks';
import { apiDelete } from '../../../hooks/api';
import { Loader } from '@crate.io/crate-ui-components';
import { cronParser } from '../../../utils/cron';
import { Job, JobLog } from '../../../types';
import cn from '../../../utils/cn';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

export const JOBS_TABLE_PAGE_SIZE = 5;

export type ScheduledJobsTableProps = {
  onManage: (job: Job) => void;
};

export default function ScheduledJobsTable({ onManage }: ScheduledJobsTableProps) {
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [showLoaderDelete, setShowLoaderDelete] = useState(false);
  const { gcUrl } = useGCContext();
  const {
    data: scheduledJobs,
    mutate: mutateScheduledJobs,
    isLoading: isLoadingJobs,
  } = useGCGetScheduledJobs(gcUrl!);
  const scheduledJobsEnriched = useGCGetScheduledJobLastLogs(
    gcUrl!,
    scheduledJobs || [],
  );

  const openJobDeleteModal = (job: Job) => {
    setJobToDelete(job);
  };

  const closeJobDeleteModal = () => {
    setJobToDelete(null);
  };

  const handleDeleteJob = async () => {
    closeJobDeleteModal();

    if (!jobToDelete) {
      return;
    }
    setShowLoaderDelete(true);

    await apiDelete(`${gcUrl}/api/scheduled-jobs/${jobToDelete?.id}`, null, {
      credentials: 'include',
    });
    setShowLoaderDelete(false);
    mutateScheduledJobs(undefined, { revalidate: true });
  };

  if (isLoadingJobs || showLoaderDelete) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader size={Loader.sizes.LARGE} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <div>
      <CrateTable
        dataSource={scheduledJobsEnriched}
        columns={[
          {
            title: 'Active',
            key: 'enabled',
            render: (job: Job) => {
              const inError =
                job.last_execution && job.last_execution.error !== null;
              const enabled = job.enabled && !inError;
              const notEnabled = !job.enabled && !inError;

              return (
                <RoundedIcon
                  className={cn('text-xl', {
                    'bg-green-500': enabled,
                    'bg-red-500': notEnabled,
                    'bg-gray-500': inError,
                  })}
                  testId="active-icon"
                >
                  {inError ? (
                    <ClockCircleOutlined />
                  ) : enabled ? (
                    <CheckCircleOutlined />
                  ) : (
                    <CloseCircleOutlined />
                  )}
                </RoundedIcon>
              );
            },
          },
          {
            title: 'Job Name',
            key: 'name',
            dataIndex: 'name',
          },
          {
            title: 'Schedule',
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
            title: 'Last Execution',
            key: 'last_execution',
            dataIndex: 'last_execution',
            render: (lastExecution?: JobLog) => {
              if (lastExecution) {
                const inError = lastExecution.error !== null;

                return (
                  <Text
                    className={cn('flex gap-2 items-center', {
                      'text-red-500': inError,
                      'text-green-500': !inError,
                    })}
                    testId="last-execution"
                  >
                    <RoundedIcon
                      className={cn('text-lg', {
                        'bg-red-500': inError,
                        'bg-green-500': !inError,
                      })}
                      testId="last-execution-icon"
                    >
                      {inError ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                    </RoundedIcon>
                    <DisplayDate isoDate={lastExecution.end} />
                  </Text>
                );
              } else return 'n/a';
            },
          },
          {
            title: 'Next Due',
            key: 'next_run_time',
            render: (job: Job) => {
              const inError =
                job.last_execution && job.last_execution.error !== null;
              if (inError) {
                return <Text className="text-red-500">Cancelled</Text>;
              } else if (job.next_run_time) {
                return <DisplayDate isoDate={job.next_run_time} />;
              } else return <Text>n/a</Text>;
            },
          },
          {
            title: '',
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
                  <Button
                    kind={Button.kinds.TERTIARY}
                    size={Button.sizes.SMALL}
                    onClick={() => {
                      openJobDeleteModal(job);
                    }}
                  >
                    Delete
                  </Button>
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

      <ConfirmDelete
        title="Are you sure you want to delete the following job?"
        visible={jobToDelete !== null}
        prompt="Be aware that this action cannot be reversed. All data will be lost."
        confirmText={jobToDelete ? jobToDelete.name : ''}
        onCancel={closeJobDeleteModal}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}
