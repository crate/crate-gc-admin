import { useGCGetScheduledJobLogs } from '../../../hooks/swrHooks';
import { useGCContext } from '../../../utils/context';
import { CrateTable, DisplayDate, Loader } from '@crate.io/crate-ui-components';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import cn from '../../../utils/cn';

type SQLSchedulerJobFormProps = {
  job: SQLJob;
};

export default function SQLSchedulerManageJobLogs({
  job,
}: SQLSchedulerJobFormProps) {
  const { gcUrl } = useGCContext();
  const { data: jobLogs, isLoading: isLoadingJobLogs } = useGCGetScheduledJobLogs(
    gcUrl!,
    job,
  );

  if (isLoadingJobLogs) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader size={Loader.sizes.LARGE} color={Loader.colors.PRIMARY} />
      </div>
    );
  }

  return (
    <CrateTable<SQLJobLog>
      dataSource={jobLogs || []}
      columns={[
        {
          title: 'Status',
          key: 'status',
          render: (job: SQLJobLog) => {
            const jobInError = job.error !== null;
            return (
              <i
                className={cn(
                  'p-2',
                  'text-white',
                  'inline-flex',
                  'items-center',
                  'justify-center',
                  'rounded-full',
                  jobInError ? 'bg-red-500' : 'bg-green-500',
                )}
              >
                {jobInError ? <CloseOutlined /> : <CheckOutlined />}
              </i>
            );
          },
        },
        {
          title: 'Last Executed',
          key: 'last_executed',
          dataIndex: 'end',
          render: (lastExecuted: string) => {
            return <DisplayDate isoDate={lastExecuted} />;
          },
        },
        {
          title: 'Error',
          key: 'error',
          dataIndex: 'error',
          render: (error: string | null) => {
            return error || 'n/a';
          },
        },
      ]}
      rowKey="start"
      pagination={{
        defaultPageSize: 5,
      }}
    />
  );
}
