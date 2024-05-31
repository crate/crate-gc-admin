import { CrateTabs } from 'components';
import { JobsTable, JobsLogs } from '../views';

type JobsProps = {
  onDeleteJob?: () => void;
};

export default function Jobs({ onDeleteJob }: JobsProps) {
  return (
    <CrateTabs
      items={[
        {
          children: <JobsTable onDeleteJob={onDeleteJob} />,
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
