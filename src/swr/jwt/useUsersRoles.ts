import useSWR from 'swr';
import swrJWTFetch from '../swrJWTFetch';
import { QueryResultSuccess } from 'types/query';
import { UserInfo } from 'types/cratedb';
import { SYSTEM_USERS } from 'constants/database';

const QUERY = `
  SELECT
    ur.type,
    ur.name,
    ur.password_set,
    ur.jwt_set,
    ur.granted_roles,
    COALESCE(p.privileges, []) "privileges",
    ur.superuser
  FROM
    (
      select
        'user' "type",
        u.name,
        u.granted_roles,
        u.password IS NOT NULL "password_set",
        u.jwt IS NOT NULL "jwt_set",
        u.superuser
      from
        sys.users u
      UNION ALL
      select
        'role' "type",
        r.name,
        r.granted_roles,
        false "password_set",
        false "jwt_set",
        false "superuser"
      from
        sys.roles r
    ) ur
      LEFT JOIN
    (
      SELECT
        p1.grantee grantee,
        array_agg({
        "class" = p1.class,
        "ident" = p1.ident,
        "state" = p1.state,
        "type" = p1.type
        }) as privileges
      FROM
        (SELECT * from sys.privileges ORDER BY grantee, class, ident, state DESC, type) p1 GROUP BY grantee
    ) p ON ur.name = p.grantee
    ORDER BY ur.type DESC, ur.name ASC;
`;

export const postFetch = (data: QueryResultSuccess): UserInfo[] => {
  return data.rows.map(r => ({
    type: r[0],
    name: r[1],
    password_set: r[2],
    jwt_set: r[3],
    granted_roles: r[4],
    privileges: r[5],
    superuser: r[6],
    is_system_user: SYSTEM_USERS.includes(r[1]),
  }));
};

const useUsersRoles = (clusterId?: string) => {
  return useSWR<UserInfo[]>(
    [`/use-users-roles/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    { refreshInterval: 5 * 1000 },
  );
};

export default useUsersRoles;
