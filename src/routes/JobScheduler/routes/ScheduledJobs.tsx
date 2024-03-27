import { CrateTabs } from 'components';
import { ScheduledJobsTable } from '../views';
import JobLogsTable from 'components/ScheduledJobLogsTable';

export default function ScheduledJobs() {
  return (
    <CrateTabs
      items={[
        {
          children: <ScheduledJobsTable />,
          label: 'Overview',
          key: 'scheduled_overview',
        },
        {
          children: <JobLogsTable entity="scheduled_jobs" />,
          label: 'Logs',
          key: 'scheduled_logs',
        },
      ]}
      defaultActiveKey="scheduled_overview"
      queryParamKeyActiveTab="schedulerTab"
      destroyInactiveTabPane
    />
  );
}
