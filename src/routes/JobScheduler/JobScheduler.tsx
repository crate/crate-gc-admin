import { useGCContext } from 'contexts';
import { Route, Routes } from 'react-router-dom';
import { Jobs, CreateJob, EditJob } from 'routes/JobScheduler/routes';
import { Heading, Text } from 'components';

export default function JobScheduler() {
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
        <Route index element={<Jobs />} />
        <Route path="create" element={<CreateJob />} />
        <Route path=":jobId" element={<EditJob />} />
      </Routes>
    </div>
  );
}
