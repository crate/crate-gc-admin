import { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { Heading } from 'components';
import UserInfo from './UserInfo';
import { useGetCurrentUserQuery, useGetUsersQuery } from 'hooks/queryHooks';
import { User } from 'types/cratedb';

function Users() {
  const getCurrentUser = useGetCurrentUserQuery();
  const getUsers = useGetUsersQuery();
  const [users, setUsers] = useState<User[] | undefined>();
  const [current, setCurrent] = useState<string | undefined>();

  useEffect(() => {
    getUsers().then(setUsers);
    getCurrentUser().then(setCurrent);
  }, []);

  const tabs = users?.map(u => {
    return {
      key: u.name,
      label: current == u.name ? `${u.name} (me)` : u.name,
      children: <UserInfo user={u} />,
    };
  });

  return (
    <div>
      <Heading level="h1">Users</Heading>
      <Tabs defaultActiveKey="crate" items={tabs} />
    </div>
  );
}

export default Users;
