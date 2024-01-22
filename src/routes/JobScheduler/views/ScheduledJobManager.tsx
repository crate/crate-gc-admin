import { CrateTabs } from '@crate.io/crate-ui-components';
import { Job } from '../../../types';
import { ScheduledJobForm, ScheduledJobLogs } from '.';

export type ScheduledJobManagerProps = {
  backToJobList: () => void;
  job: Job;
};

export default function ScheduledJobManager({
  backToJobList,
  job,
}: ScheduledJobManagerProps) {
  return (
    <CrateTabs
      items={[
        {
          children: (
            <ScheduledJobForm backToJobList={backToJobList} type="edit" job={job} />
          ),
          label: 'Manage',
          key: 'manage',
        },
        {
          children: <ScheduledJobLogs job={job} />,
          label: 'Recent',
          key: 'recent',
        },
      ]}
      defaultActiveKey="manage"
    />
  );
}
