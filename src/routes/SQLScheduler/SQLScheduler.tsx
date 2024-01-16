import { Button, Text } from '@crate.io/crate-ui-components';
import { useState } from 'react';
import {
  SQLSchedulerJobForm,
  SQLSchedulerJobsTable,
  SQLSchedulerManageJob,
} from './views';
import { LeftOutlined } from '@ant-design/icons';

function SQLScheduler() {
  const [viewType, setViewType] = useState<null | 'add' | SQLJob>(null);

  const backToClusterView = () => {
    setViewType(null);
  };

  const addNewJob = () => {
    setViewType('add');
  };

  const manageJob = (job: SQLJob) => {
    setViewType(job);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <h1 className="text-2xl">SQL Scheduler</h1>
      <Text>Run SQL queries at regular intervals.</Text>

      {/* NOTE: this views can be refactorized with router-based */}
      <div>
        {viewType !== null ? (
          // Render "Back to Job List" button
          <Button kind={Button.kinds.TERTIARY} onClick={backToClusterView}>
            <LeftOutlined className="mr-2" />
            Back to Job List
          </Button>
        ) : (
          // Render "Add New Job" button
          <div className="w-full flex justify-end">
            <Button onClick={addNewJob} className="float-end">
              Add New Job
            </Button>
          </div>
        )}
      </div>

      {viewType === null ? (
        <SQLSchedulerJobsTable onManage={manageJob} />
      ) : viewType === 'add' ? (
        <SQLSchedulerJobForm backToClusterView={backToClusterView} type="add" />
      ) : (
        <SQLSchedulerManageJob
          job={viewType}
          backToClusterView={backToClusterView}
        />
      )}
    </div>
  );
}

export default SQLScheduler;
