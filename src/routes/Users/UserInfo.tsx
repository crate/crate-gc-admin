import { useEffect, useState } from 'react';
import SQLResults from '../../components/SQLResults';
import { useGetUserPermissionsQuery } from '../../hooks/queryHooks';
import { User } from '../../types/cratedb';
import { QueryResults } from '../../types/query';

type Params = {
  user: User;
};

function UserInfo({ user }: Params) {
  const getUserPermissions = useGetUserPermissionsQuery();
  const [result, setResult] = useState<QueryResults>();

  useEffect(() => {
    getUserPermissions(user.name).then(res => {
      if (res.data) {
        setResult(res.data);
      }
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
      {!user.superuser && <SQLResults results={result} />}
    </div>
  );
}

export default UserInfo;
