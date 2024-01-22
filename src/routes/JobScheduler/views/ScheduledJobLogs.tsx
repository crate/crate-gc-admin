import { useGCGetScheduledJobLogs } from '../../../hooks/swrHooks';
import { useGCContext } from '../../../contexts';
import {
  Text,
  Button,
  CrateTable,
  DisplayDate,
  Loader,
  RoundedIcon,
  InfoModal,
} from '@crate.io/crate-ui-components';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import cn from '../../../utils/cn';
import { Job, JobLog } from '../../../types';
import { useState } from 'react';

export type ScheduledJobLogsProps = {
  job: Job;
};

export const JOB_LOG_TABLE_PAGE_SIZE = 5;

export default function ScheduledJobLogs({ job }: ScheduledJobLogsProps) {
  const { gcUrl } = useGCContext();
  const { data: jobLogs, isLoading: isLoadingJobLogs } = useGCGetScheduledJobLogs(
    gcUrl!,
    job,
  );
  const [errorDialogContent, setErrorDialogContent] = useState<string | null>(null);

  const openErrorDialog = (error: string) => {
    setErrorDialogContent(error);
  };

  const closeErrorDialog = () => {
    setErrorDialogContent(null);
  };

  if (isLoadingJobLogs) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader size={Loader.sizes.LARGE} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <>
      <CrateTable<JobLog>
        dataSource={jobLogs || []}
        columns={[
          {
            title: 'Status',
            key: 'status',
            width: '10%',
            render: (log: JobLog) => {
              const logInError = log.error !== null;

              return (
                <RoundedIcon
                  className={cn('text-xl', {
                    'bg-red-500': logInError,
                    'bg-green-500': !logInError,
                  })}
                  testId="status-icon"
                >
                  {logInError ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                </RoundedIcon>
              );
            },
          },
          {
            title: 'Last Executed',
            key: 'last_executed',
            dataIndex: 'end',
            width: '20%',
            render: (lastExecuted: string) => {
              return <DisplayDate isoDate={lastExecuted} />;
            },
          },
          {
            title: 'Error',
            key: 'error',
            dataIndex: 'error',
            ellipsis: true,
            width: '50%',
            render: (error: string | null) => {
              if (error) {
                return (
                  <div className="flex items-center w-full justify-between gap-2">
                    <Text truncate>{error}</Text>
                    <Button
                      kind={Button.kinds.TERTIARY}
                      className="flex"
                      onClick={() => {
                        openErrorDialog(error);
                      }}
                    >
                      See Details
                    </Button>
                  </div>
                );
              }

              return 'n/a';
            },
          },
        ]}
        rowKey="start"
        pagination={{
          defaultPageSize: JOB_LOG_TABLE_PAGE_SIZE,
        }}
      />

      <InfoModal
        visible={errorDialogContent !== null}
        title="Error Details"
        onClose={closeErrorDialog}
      >
        <div className="max-h-[200px] overflow-auto">{errorDialogContent}</div>
      </InfoModal>
    </>
  );
}
