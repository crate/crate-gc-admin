import { useGCContext } from 'contexts';
import { Route, Routes } from 'react-router-dom';
import {
  ScheduledJobsCreate,
  ScheduledJobsEdit,
  ScheduledJobs,
} from 'routes/JobScheduler/routes';
import { Heading, Text } from 'components';

export default function JobScheduler() {
  const { headings } = useGCContext();

  return (
    <div className="flex flex-col h-full">
      {headings && (
        <>
          <Heading level={Heading.levels.h1}>SQL Scheduler</Heading>
          <Text>Run SQL queries at regular intervals.</Text>
        </>
      )}

      <Routes>
        <Route index element={<ScheduledJobs />} />
        <Route path="create" element={<ScheduledJobsCreate />} />
        <Route path=":jobId" element={<ScheduledJobsEdit />} />
      </Routes>
    </div>
  );
}
