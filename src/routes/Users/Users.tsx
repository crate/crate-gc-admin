import React, { useContext, useEffect, useState } from 'react';
import { GCContext } from '../../utils/context';
import { getCurrentUser, getUsers, User } from '../../utils/queries';
import { Tabs } from 'antd';
import { Heading } from '@crate.io/crate-ui-components';
import UserInfo from './UserInfo';

function Users() {
  const { sqlUrl } = useContext(GCContext);
  const [users, setUsers] = useState<User[] | undefined>();
  const [current, setCurrent] = useState<string | undefined>();

  useEffect(() => {
    if (!sqlUrl) {
      return;
    }

    getUsers(sqlUrl).then(setUsers);
    getCurrentUser(sqlUrl).then(setCurrent);
  }, [sqlUrl]);

  const tabs = users?.map(u => {
    return {
      key: u.name,
      label: current == u.name ? `${u.name} (me)` : u.name,
      children: <UserInfo url={sqlUrl} user={u} />,
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
