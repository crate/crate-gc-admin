import { CrateTabs } from 'components';
import { JobsTable, Logs, PoliciesTable } from '../views';
import {
  AUTOMATION_TAB_KEYS,
  AUTOMATION_TAB_QUERY_PARAM_KEY,
} from './AutomationTabsConstants';

type AutomationTabsProps = {
  onDeleteJob?: () => void;
  onDeletePolicy?: () => void;
};

export default function AutomationTabs({
  onDeleteJob,
  onDeletePolicy,
}: AutomationTabsProps) {
  return (
    <CrateTabs
      items={[
        {
          children: <JobsTable onDeleteJob={onDeleteJob} />,
          label: 'Scheduled Jobs',
          key: AUTOMATION_TAB_KEYS.JOBS,
        },
        {
          children: <PoliciesTable onDeletePolicy={onDeletePolicy} />,
          label: 'Table Policies',
          key: AUTOMATION_TAB_KEYS.POLICIES,
        },
        {
          children: <Logs />,
          label: 'Logs',
          key: AUTOMATION_TAB_KEYS.LOGS,
        },
      ]}
      defaultActiveKey={AUTOMATION_TAB_KEYS.JOBS}
      queryParamKeyActiveTab={AUTOMATION_TAB_QUERY_PARAM_KEY}
      destroyInactiveTabPane
    />
  );
}
