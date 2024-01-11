import execSql from './gc/execSql';

type User = {
  name: string;
  superuser: boolean;
};

async function getUsers(url: string): Promise<User[]> {
  const res = await execSql(url, 'SELECT name, superuser FROM sys.users');
  if (res.data.error) {
    throw res.data.error;
  }
  return res.data.rows.map(row => {
    return {
      name: row[0],
      superuser: row[1],
    };
  });
}

async function getUserPermissions(url: string | undefined, username: string) {
  return await execSql(
    url,
    `SELECT grantee, class, ident, state, type FROM sys.privileges WHERE grantee='${username}'`,
  );
}

async function getCurrentUser(url: string | undefined): Promise<string> {
  const res = await execSql(url, 'SELECT CURRENT_USER');
  return res.data.rows[0][0];
}

export type { User };
export { getUsers, getUserPermissions, getCurrentUser };
