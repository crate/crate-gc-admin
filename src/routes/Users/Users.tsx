import { Heading } from 'components';
import { useGCContext } from 'contexts';
import UsersTable from './UsersTable';

function Users() {
  const { headings } = useGCContext();

  return (
    <div>
      {headings && (
        <Heading level={Heading.levels.h1} className="mb-2">
          Users
        </Heading>
      )}
      <UsersTable />
    </div>
  );
}

export default Users;
