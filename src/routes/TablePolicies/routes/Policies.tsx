import { CrateTabs } from 'components';
import { PoliciesLogs, PoliciesTable } from '../views';

type PoliciesProps = {
  onDeletePolicy?: () => void;
};
export default function Policies({ onDeletePolicy }: PoliciesProps) {
  return (
    <CrateTabs
      items={[
        {
          children: <PoliciesTable onDeletePolicy={onDeletePolicy} />,
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
