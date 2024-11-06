import { DataTable, GCSpin, Text } from 'components';
import { useGetUsersRoles } from 'hooks/swrHooks';
import { ColumnDef } from '@tanstack/react-table';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { UserInfo } from 'types/cratedb';
import { Tag, Tooltip } from 'antd';
import { CRATEDB_PRIVILEGES_DOCS } from 'constants/defaults';

const PRIVILEGES_SORT_VALUES: Record<string, number> = {
  CLUSTER: 1,
  SCHEMA: 2,
  TABLE: 3,
  VIEW: 4,
};

function UsersTable() {
  const { data: usersRoles } = useGetUsersRoles();

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
      </Text>
    );
  };

  const renderAuthentication = (user: UserInfo) => {
    return (
      <div>
        {user.password_set ? <Tag color="green">Password</Tag> : null}
        {user.jwt_set ? <Tag color="blue">JWT</Tag> : null}
      </div>
    );
  };

  const renderGrantedRoles = (user: UserInfo) => {
    return <Text>{user.granted_roles.map(gr => gr.role).join(', ')}</Text>;
  };

  const renderPrivileges = (user: UserInfo, state: 'GRANT' | 'DENY') => {
    const privileges = user.privileges
      .filter(p => p.state === state)
      .sort((a, b) => {
        if (a.class === b.class) {
          return (a.ident || '').localeCompare(b.ident || '');
        } else
          return PRIVILEGES_SORT_VALUES[a.class] - PRIVILEGES_SORT_VALUES[b.class];
      });

    return (
      <div>
        {state === 'GRANT' && user.superuser && (
          <div>
            <code>SUPERUSER</code>
          </div>
        )}
        {privileges.map((el, index) => {
          return (
            <div>
              <code key={index}>
                {el.type} ON {el.class} {el.ident}
              </code>
            </div>
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
