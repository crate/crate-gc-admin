import { CrateTabs } from 'components';
import { PoliciesTable } from '../views';
import JobLogsTable from 'components/ScheduledJobLogsTable';

export default function Policies() {
  return (
    <CrateTabs
      items={[
        {
          children: <PoliciesTable />,
          label: 'Overview',
          key: 'policies_overview',
        },
        {
          children: <JobLogsTable entity="policies" />,
          label: 'Logs',
          key: 'policies_logs',
        },
      ]}
      defaultActiveKey="policies_overview"
      queryParamKeyActiveTab="tableLifecycleTab"
      destroyInactiveTabPane
    />
  );
}
