import { useGCContext } from 'contexts';
import { Route, Routes } from 'react-router-dom';
import { Heading, Text } from 'components';
import { CreatePolicy, EditPolicy, Policies } from 'routes/TablePolicies/routes';

type TablePoliciesProps = {
  onCreatePolicy?: () => void;
  onDeletePolicy?: () => void;
  onEditPolicy?: () => void;
};

export default function TablePolicies({
  onCreatePolicy,
  onDeletePolicy,
  onEditPolicy,
}: TablePoliciesProps) {
  const { headings } = useGCContext();

  return (
    <div className="flex h-full flex-col">
      {headings && (
        <>
          <Heading level={Heading.levels.h1}>Table Policies</Heading>
          <Text>Specify automatic actions on table partitions.</Text>
        </>
      )}

      <Routes>
        <Route index element={<Policies onDeletePolicy={onDeletePolicy} />} />
        <Route
          path="create"
          element={<CreatePolicy onCreatePolicy={onCreatePolicy} />}
        />
        <Route
          path=":policyId"
          element={<EditPolicy onEditPolicy={onEditPolicy} />}
        />
      </Routes>
    </div>
  );
}
