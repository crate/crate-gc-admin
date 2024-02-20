import { CrateTabs } from 'components';
import { ScheduledJobsTable, ScheduledJobLogs } from '../views';

export default function ScheduledJobs() {
  return (
    <CrateTabs
      items={[
        {
          children: <ScheduledJobsTable />,
          label: 'Jobs',
          key: 'jobs',
        },
        {
          children: <ScheduledJobLogs />,
          label: 'Recent',
          key: 'recent',
        },
      ]}
      defaultActiveKey="jobs"
      destroyInactiveTabPane
    />
  );
}
