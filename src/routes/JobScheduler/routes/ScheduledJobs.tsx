import { CrateTabs } from 'components';
import { ScheduledJobsTable, ScheduledJobLogs } from '../views';

export default function ScheduledJobs() {
  return (
    <CrateTabs
      items={[
        {
          children: <ScheduledJobsTable />,
          label: 'Overview',
          key: 'overview',
        },
        {
          children: <ScheduledJobLogs />,
          label: 'Logs',
          key: 'logs',
        },
      ]}
      defaultActiveKey="overview"
      destroyInactiveTabPane
    />
  );
}
