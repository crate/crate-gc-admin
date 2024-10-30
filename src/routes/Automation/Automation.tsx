import { Route, Routes } from 'react-router-dom';
import { Heading, Text } from 'components';
import {
  AutomationTabs,
  CreateJob,
  CreatePolicy,
  EditJob,
  EditPolicy,
} from './routes';
import {
  automationCreateJob,
  automationCreatePolicy,
  automationEditJob,
  automationEditPolicy,
} from 'constants/paths';
import useJWTManagerStore from 'state/jwtManager';

type AutomationProps = {
  onCreateJob?: () => void;
  onDeleteJob?: () => void;
  onEditJob?: () => void;
  onCreatePolicy?: () => void;
  onDeletePolicy?: () => void;
  onEditPolicy?: () => void;
};

export default function Automation({
  onCreateJob,
  onDeleteJob,
  onEditJob,
  onCreatePolicy,
  onDeletePolicy,
  onEditPolicy,
}: AutomationProps) {
  const isLocalConnection = useJWTManagerStore(state => state.isLocalConnection);

  return (
    <div className="flex h-full flex-col">
      {isLocalConnection && (
        <>
          <Heading level={Heading.levels.h1}>Automation</Heading>
          <Text>Run SQL queries at regular intervals.</Text>
        </>
      )}

      <Routes>
        <Route
          index
          element={
            <AutomationTabs
              onDeleteJob={onDeleteJob}
              onDeletePolicy={onDeletePolicy}
            />
          }
        />

        <Route
          path={automationCreateJob.path}
          element={<CreateJob onCreateJob={onCreateJob} />}
        />
        <Route
          path={automationEditJob.path}
          element={<EditJob onEditJob={onEditJob} />}
        />

        <Route
          path={automationCreatePolicy.path}
          element={<CreatePolicy onCreatePolicy={onCreatePolicy} />}
        />
        <Route
          path={automationEditPolicy.path}
          element={<EditPolicy onEditPolicy={onEditPolicy} />}
        />
      </Routes>
    </div>
  );
}
