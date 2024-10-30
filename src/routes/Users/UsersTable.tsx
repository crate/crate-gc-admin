import { DataTable, GCSpin, Text } from 'components';
import { useUsersRoles } from 'src/swr/jwt';
import { ColumnDef } from '@tanstack/react-table';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { UserInfo } from 'types/cratedb';
import { Tag, Tooltip } from 'antd';
import { CRATEDB_PRIVILEGES_DOCS } from 'constants/defaults';

function UsersTable() {
  const { data: usersRoles } = useUsersRoles();

  const columns: ColumnDef<UserInfo>[] = [
    {
      header: 'Name',
      meta: {
        minWidth: '140px',
      },
      cell: ({ row }) => {
        const user = row.original;
        return renderName(user);
      },
    },
    {
      header: 'Authentication',
      meta: {
        minWidth: '140px',
      },
      cell: ({ row }) => {
        const user = row.original;
        return renderAuthentication(user);
      },
    },
    {
      header: 'Granted Roles',
      meta: {
        width: '350px',
      },
      cell: ({ row }) => {
        const user = row.original;
        return renderGrantedRoles(user);
      },
    },
    {
      header: 'Granted Privileges',
      meta: {
        minWidth: '140px',
      },
      cell: ({ row }) => {
        const user = row.original;
        return renderPrivileges(user, 'GRANT');
      },
    },
    {
      header: 'Denied Privileges',
      meta: {
        minWidth: '140px',
      },
      cell: ({ row }) => {
        const user = row.original;
        return renderPrivileges(user, 'DENY');
      },
    },
  ];

  const renderName = (user: UserInfo) => {
    return (
      <Text>
        <Tooltip title={user.type}>
          {user.type === 'role' ? (
            <TeamOutlined data-testid="role-icon" />
          ) : (
            <UserOutlined data-testid="user-icon" />
          )}
        </Tooltip>{' '}
        {user.name}
        {user.is_system_user && (
          <Text className="ml-1 inline text-xs italic !leading-3" pale>
            system
          </Text>
        )}
      </Text>
    );
  };

  const renderAuthentication = (user: UserInfo) => {
    if (!user.password_set && !user.jwt_set) {
      return <Text>-</Text>;
    }
    return (
      <div>
        {user.password_set && <Tag color="green">Password</Tag>}
        {user.jwt_set && <Tag color="blue">JWT</Tag>}
      </div>
    );
  };

  const renderGrantedRoles = (user: UserInfo) => {
    if (user.granted_roles.length === 0) {
      return <Text>-</Text>;
    }
    return (
      <div>
        {user.granted_roles.map((gr, index) => {
          return (
            <code key={index} className="block">
              {gr.role}
            </code>
          );
        })}
      </div>
    );
  };

  const renderPrivileges = (user: UserInfo, state: 'GRANT' | 'DENY') => {
    const showSuperuser = state === 'GRANT' && user.superuser;
    const privileges = user.privileges.filter(p => p.state === state);

    if (privileges.length === 0 && !showSuperuser) {
      return <Text>-</Text>;
    }

    return (
      <div>
        {state === 'GRANT' && user.superuser && (
          <code className="block">SUPERUSER</code>
        )}
        {privileges.map((el, index) => {
          return (
            <code key={index} className="block">
              {el.type} ON {el.class} {el.ident}
            </code>
          );
        })}
      </div>
    );
  };

  return (
    <GCSpin spinning={!usersRoles}>
      <Text>
        Learn more about Privileges in our{' '}
        <a href={CRATEDB_PRIVILEGES_DOCS} target="_blank">
          documentation
        </a>
        .
      </Text>
      <DataTable
        className="mt-2"
        columns={columns}
        data={usersRoles!}
        disablePagination
      />
    </GCSpin>
  );
}

export default UsersTable;
