import UsersTable from './UsersTable';
import { Heading } from 'components';

function Users() {
  return (
    <div>
      <Heading level={Heading.levels.h1} className="mb-2">
        Users
      </Heading>
      <UsersTable />
    </div>
  );
}

export default Users;
