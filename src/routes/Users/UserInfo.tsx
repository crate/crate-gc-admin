import { Loader } from 'components';
import { User } from 'types/cratedb';
import { useGetUserPermissions } from 'hooks/swrHooks';
import SQLResultsTable from 'components/SQLResults/SQLResultsTable';
import { QueryResult } from 'types/query';

type Params = {
  user: User;
};

function UserInfo({ user }: Params) {
  const { data: result, isLoading: loading } = useGetUserPermissions(user.name);

  if (loading || !result) {
    return <Loader />;
  }

  return (
    <div>
      {user.superuser && (
        <div>
          The superuser has access to the whole cluster. It is not possible to
          perform GRANT, DENY or REVOKE statements on the superuser.
        </div>
      )}
      {!user.superuser && <SQLResultsTable result={result.data! as QueryResult} />}
    </div>
  );
}

export default UserInfo;
