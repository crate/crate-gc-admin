import { useGCGetScheduledJobLogs } from '../../../hooks/swrHooks';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Button from '../../../components/Button';
import CrateTable from '../../../components/CrateTable';
import Loader from '../../../components/Loader';
import Text from '../../../components/Text';
import { Job, JobLog, TJobLogStatementError } from '../../../types';
import { useState } from 'react';
import QueryStackTraceModal from '../../../components/QueryStackTraceModal';
import DisplayUTCDate from '../../../components/DisplayUTCDate';

export type ScheduledJobLogsProps = {
  job: Job;
  backToJobList: () => void;
};

export const JOB_LOG_TABLE_PAGE_SIZE = 5;

export default function ScheduledJobLogs({
  job,
  backToJobList,
}: ScheduledJobLogsProps) {
  const { data: jobLogs, isLoading: isLoadingJobLogs } =
    useGCGetScheduledJobLogs(job);
  const [errorDialogContent, setErrorDialogContent] = useState<
    (TJobLogStatementError & { timestamp: string }) | null
  >(null);

  const openErrorDialog = (error: TJobLogStatementError & { timestamp: string }) => {
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
      <div className="w-full overflow-x-auto">
        <CrateTable<JobLog>
          dataSource={jobLogs || []}
          columns={[
            {
              title: <span className="font-bold">Status</span>,
              key: 'status',
              width: 100,
              render: (log: JobLog) => {
                const logInError = log.error !== null;

                return (
                  <span className={'text-lg'} data-testid="status-icon">
                    {logInError ? (
                      <CloseCircleOutlined className="text-red-600" />
                    ) : (
                      <CheckCircleOutlined className="text-green-600" />
                    )}
                  </span>
                );
              },
            },
            {
              title: <span className="font-bold">Last Executed</span>,
              key: 'last_executed',
              dataIndex: 'end',
              width: 250,
              render: (lastExecuted: string | null) => {
                if (lastExecuted) {
                  return <DisplayUTCDate isoDate={lastExecuted} tooltip />;
                } else
                  return (
                    <>
                      <Loader size={Loader.sizes.SMALL} /> Running...
                    </>
                  );
              },
            },
            {
              title: <span className="font-bold">Error</span>,
              key: 'error',
              ellipsis: true,
              render: (log: JobLog) => {
                if (log.error) {
                  return (
                    <div className="flex items-center w-full justify-between gap-2">
                      <Text truncate>{log.error}</Text>
                      <Button
                        kind={Button.kinds.TERTIARY}
                        className="flex"
                        onClick={() => {
                          const keyInError = Object.keys(log.statements)
                            .sort()
                            .slice(-1)
                            .pop();
                          openErrorDialog({
                            ...log.statements[keyInError!],
                            timestamp: log.start,
                          });
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
      </div>

      <div className="flex justify-end gap-2">
        <Button kind={Button.kinds.SECONDARY} onClick={backToJobList}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            kind={Button.kinds.PRIMARY}
            type={Button.types.SUBMIT}
            form="job-form"
          >
            Save
          </Button>
        </div>
      </div>

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
    </>
  );
}
