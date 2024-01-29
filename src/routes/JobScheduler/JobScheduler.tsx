import { useState } from 'react';
import Button from '../../components/Button';
import Text from '../../components/Text';
import { Job } from '../../types';
import { useGCContext } from '../../contexts';
import { ScheduledJobForm, ScheduledJobManager, ScheduledJobsTable } from './views';

export default function JobScheduler() {
  const { headings } = useGCContext();
  const [viewType, setViewType] = useState<null | 'add' | Job>(null);

  const backToJobList = () => {
    setViewType(null);
  };

  const addNewJob = () => {
    setViewType('add');
  };

  const manageJob = (job: Job) => {
    setViewType(job);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      {headings && (
        <>
          <h1 className="text-2xl">SQL Scheduler</h1>
          <Text>Run SQL queries at regular intervals.</Text>
        </>
      )}

      {/* NOTE: this views can be refactorized with router-based */}
      <div>
        {viewType === null && (
          <div className="w-full flex justify-end">
            <Button onClick={addNewJob} className="float-end">
              Add New Job
            </Button>
          </div>
        )}
      </div>

      {viewType === null ? (
        <ScheduledJobsTable onManage={manageJob} />
      ) : viewType === 'add' ? (
        <ScheduledJobForm backToJobList={backToJobList} type="add" />
      ) : (
        <ScheduledJobManager job={viewType} backToJobList={backToJobList} />
      )}
    </div>
  );
}
