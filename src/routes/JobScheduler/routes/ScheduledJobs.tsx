import { CrateTabs } from 'components';
import { ScheduledJobsTable, ScheduledJobLogs } from '../views';

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
          children: <ScheduledJobLogs />,
          label: 'Logs',
          key: 'scheduled_logs',
        },
      ]}
      defaultActiveKey="scheduled_overview"
      destroyInactiveTabPane
    />
  );
}
