import execSql from './gc/execSql';

type User = {
  name: string;
  superuser: boolean;
};

type TableListEntry = {
  table_schema: string;
  table_name: string;
  number_of_shards: number;
  number_of_replicas: string;
};

type TableInfo = {
  ordinal_position: number;
  column_name: string;
  data_type: string;
  column_default: string | null;
  constraint_type: string | null;
};

type ShardInfo = {
  table_name: string;
  schema_name: string;
  node_id: string;
  state: string;
  routing_state: string;
  relocating_node: string;
  number_of_shards: number;
  primary: boolean;
  total_docs: number;
  avg_docs: number;
  size_bytes: number;
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

async function getSchemas(url: string | undefined): Promise<string[]> {
  const res = await execSql(
    url,
    `SELECT 'doc' AS table_schema
        UNION
        SELECT DISTINCT(table_schema) FROM information_schema.tables
                                      WHERE table_schema NOT IN ('gc') ORDER BY 1;`,
  );
  return res.data.rows.map(r => r[0]);
}

async function getTables(url: string | undefined): Promise<TableListEntry[]> {
  const res = await execSql(
    url,
    `SELECT table_schema, table_name, number_of_shards, number_of_replicas FROM information_schema.tables where table_schema NOT IN ('gc') ORDER BY 1, 2;`,
  );
  return res.data.rows.map(r => {
    return {
      table_schema: r[0],
      table_name: r[1],
      number_of_shards: r[2],
      number_of_replicas: r[3],
    };
  });
}

async function getTableInformation(
  url: string | undefined,
  schema: string,
  table: string,
): Promise<TableInfo[]> {
  const res = await execSql(
    url,
    `SELECT
          c.ordinal_position,
          c.column_name,
          data_type,
          column_default,
          tc.constraint_type
        FROM
          information_schema.columns c
          LEFT OUTER JOIN information_schema.key_column_usage u ON (
            c.table_name = u.table_name
            AND c.column_name = u.column_name
          )
          LEFT OUTER JOIN information_schema.table_constraints tc ON (
            tc.table_name = u.table_name
            AND tc.constraint_name = u.constraint_name
            AND tc.constraint_name = u.constraint_name
          )
        WHERE
          c.table_name = '${table}'
          AND c.table_schema = '${schema}';`,
  );

  return res.data.rows.map(r => {
    return {
      ordinal_position: r[0],
      column_name: r[1],
      data_type: r[2],
      column_default: r[3],
      constraint_type: r[4],
    };
  });
}

async function getShards(url: string | undefined): Promise<ShardInfo[]> {
  const res = await execSql(
    url,
    `SELECT
      table_name,
      schema_name,
      node['id'] AS node_id,
      state,
      routing_state,
      relocating_node,
      count(*) as number_of_shards,
      "primary",
      sum(num_docs),
      avg(num_docs),
      sum(size)
    FROM
      sys.shards
    GROUP BY
      table_name,
      schema_name,
      node_id,
      state,
      routing_state,
      relocating_node,
      "primary"`,
  );

  return res.data.rows.map(r => {
    return {
      table_name: r[0],
      schema_name: r[1],
      node_id: r[2],
      state: r[3],
      routing_state: r[4],
      relocating_node: r[5],
      number_of_shards: r[6],
      primary: r[7],
      total_docs: r[8],
      avg_docs: r[9],
      size_bytes: r[10],
    };
  });
}

async function showCreateTable(
  url: string | undefined,
  schema: string,
  table: string,
): Promise<string | undefined> {
  const res = await execSql(url, `SHOW CREATE TABLE "${schema}"."${table}"`);
  if (res.data.error) {
    return;
  }
  return res.data.rows[0][0];
}

export type { User, TableListEntry, TableInfo, ShardInfo };
export {
  getUsers,
  getUserPermissions,
  getCurrentUser,
  getSchemas,
  getTables,
  getShards,
  getTableInformation,
  showCreateTable,
};
