import { getUserPermissions, User } from '../../utilities/queries';
import { useEffect, useState } from 'react';
import { QueryResults } from '../../utilities/gc/execSql';
import SQLResultsTable from '../../components/SQLEditor/SQLResultsTable';

type Params = {
  url: string | undefined;
  user: User;
};

function UserInfo({ url, user }: Params) {
  const [result, setResult] = useState<QueryResults>();

  useEffect(() => {
    getUserPermissions(url, user.name).then(res => {
      setResult(res.data);
    });
  }, [user]);

  return (
    <div>
      {user.superuser && (
        <div>
          The superuser has access to the whole cluster. It is not possible to
          perform GRANT, DENY or REVOKE statements on the superuser.
        </div>
      )}
      {!user.superuser && <SQLResultsTable results={result} />}
    </div>
  );
}

export default UserInfo;
