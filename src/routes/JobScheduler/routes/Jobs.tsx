import { CrateTabs } from 'components';
import { JobsTable, JobsLogs } from '../views';

export default function Jobs() {
  return (
    <CrateTabs
      items={[
        {
          children: <JobsTable />,
          label: 'Overview',
          key: 'scheduled_overview',
        },
        {
          children: <JobsLogs />,
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
