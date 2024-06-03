import { useGCContext } from 'contexts';
import { Route, Routes } from 'react-router-dom';
import { Jobs, CreateJob, EditJob } from 'routes/JobScheduler/routes';
import { Heading, Text } from 'components';

type JobSchedulerProps = {
  onCreateJob?: () => void;
  onDeleteJob?: () => void;
  onEditJob?: () => void;
};

export default function JobScheduler({
  onCreateJob,
  onDeleteJob,
  onEditJob,
}: JobSchedulerProps) {
  const { headings } = useGCContext();

  return (
    <div className="flex h-full flex-col">
      {headings && (
        <>
          <Heading level={Heading.levels.h1}>SQL Scheduler</Heading>
          <Text>Run SQL queries at regular intervals.</Text>
        </>
      )}

      <Routes>
        <Route index element={<Jobs onDeleteJob={onDeleteJob} />} />
        <Route path="create" element={<CreateJob onCreateJob={onCreateJob} />} />
        <Route path=":jobId" element={<EditJob onEditJob={onEditJob} />} />
      </Routes>
    </div>
  );
}
