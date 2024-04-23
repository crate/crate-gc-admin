import { useGCContext } from 'contexts';
import { Route, Routes } from 'react-router-dom';
import { Heading, Text } from 'components';
import { CreatePolicy, EditPolicy, Policies } from 'routes/TablePolicies/routes';

export default function TablePolicies() {
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
        <Route index element={<Policies />} />
        <Route path="create" element={<CreatePolicy />} />
        <Route path=":policyId" element={<EditPolicy />} />
      </Routes>
    </div>
  );
}
