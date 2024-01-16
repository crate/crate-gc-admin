import { CrateTabs } from '@crate.io/crate-ui-components';
import SQLSchedulerJobForm from './SQLSchedulerJobForm';
import { SQLSchedulerJobLogs } from '.';

type SQLSchedulerJobFormProps = {
  backToClusterView: () => void;
  job: SQLJob;
};

export default function SQLSchedulerManageJob({
  backToClusterView,
  job,
}: SQLSchedulerJobFormProps) {
  return (
    <CrateTabs
      items={[
        {
          children: (
            <SQLSchedulerJobForm
              backToClusterView={backToClusterView}
              type="edit"
              job={job}
            />
          ),
          label: 'Manage',
          key: 'manage',
        },
        {
          children: <SQLSchedulerJobLogs job={job} />,
          label: 'Recent',
          key: 'recent',
        },
      ]}
      defaultActiveKey="manage"
    />
  );
}
