import { CrateTabs } from 'components';
import { PoliciesLogs, PoliciesTable } from '../views';

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
          children: <PoliciesLogs />,
          label: 'Logs',
          key: 'policies_logs',
        },
      ]}
      defaultActiveKey="policies_overview"
      queryParamKeyActiveTab="tablePoliciesTab"
      destroyInactiveTabPane
    />
  );
}
