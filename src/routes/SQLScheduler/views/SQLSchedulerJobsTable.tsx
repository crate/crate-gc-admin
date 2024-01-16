import {
  Button,
  CrateTable,
  ConfirmDelete,
  DisplayDate,
} from '@crate.io/crate-ui-components';
import { useState } from 'react';
import { useGCContext } from '../../../utils/context';
import {
  useGCGetScheduledJobLastLogs,
  useGCGetScheduledJobs,
} from '../../../hooks/swrHooks';
import { apiDelete } from '../../../hooks/api';
import { Loader } from '@crate.io/crate-ui-components';
import { cronParser } from '../../../utils/cron';

type SQLSchedulerJobsTableProps = {
  onManage: (job: SQLJob) => void;
};

export default function SQLSchedulerJobsTable({
  onManage,
}: SQLSchedulerJobsTableProps) {
  const [jobToDelete, setJobToDelete] = useState<SQLJob | null>(null);
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

  const openJobDeleteModal = (job: SQLJob) => {
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
      <CrateTable<SQLJob>
        dataSource={scheduledJobsEnriched}
        columns={[
          {
            title: 'Active',
            key: 'enabled',
            dataIndex: 'enabled',
            render: (enabled: boolean) => {
              return enabled ? 'Active' : 'Not Active';
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
            render: (lastExecution?: string) => {
              if (lastExecution) {
                return <DisplayDate isoDate={lastExecution} />;
              } else return 'Cancelled';
            },
          },
          {
            title: 'Next Due',
            key: 'next_run_time',
            dataIndex: 'next_run_time',
            render: (nextRunTime?: string) => {
              if (nextRunTime) {
                return <DisplayDate isoDate={nextRunTime} />;
              } else return 'Cancelled';
            },
          },
          {
            title: '',
            key: 'actions',
            render: (job: SQLJob) => {
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
          defaultPageSize: 5,
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
