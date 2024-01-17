import {
  Allocation,
  ClusterInfo,
  NodeStatusInfo,
  ShardInfo,
  TableInfo,
  TableListEntry,
  User,
} from '../types/cratedb';
import executeSql from './gc/executeSql';

async function getUsers(url: string): Promise<User[]> {
  const res = await executeSql(url, 'SELECT name, superuser FROM sys.users');
  if (!res.data || Array.isArray(res.data)) {
    return [];
  }

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
  return await executeSql(
    url,
    `SELECT grantee, class, ident, state, type FROM sys.privileges WHERE grantee='${username}'`,
  );
}

async function getCurrentUser(url: string | undefined): Promise<string> {
  const res = await executeSql(url, 'SELECT CURRENT_USER');
  if (!res.data || Array.isArray(res.data)) {
    return '';
  }
  return res.data.rows[0][0];
}

async function getClusterInfo(
  url: string | undefined,
): Promise<ClusterInfo | undefined> {
  const res = await executeSql(url, 'SELECT id, name FROM sys.cluster');
  if (!res.data || Array.isArray(res.data)) {
    return;
  }
  const row = res.data.rows[0];
  return {
    id: row[0],
    name: row[1],
  };
}

async function getSchemas(url: string | undefined): Promise<string[]> {
  const res = await executeSql(
    url,
    `SELECT 'doc' AS table_schema
        UNION
        SELECT DISTINCT(table_schema) FROM information_schema.tables
                                      WHERE table_schema NOT IN ('gc') ORDER BY 1;`,
  );

  if (!res.data || Array.isArray(res.data)) {
    return [];
  }

  return res.data.rows.map(r => r[0]);
}

async function getTables(url: string | undefined): Promise<TableListEntry[]> {
  const res = await executeSql(
    url,
    `SELECT
            *
          FROM
            (
              SELECT
                t.table_schema,
                t.table_name,
                t.number_of_shards,
                t.number_of_replicas,
                IF (
                  (
                    t.table_schema IN ('sys', 'pg_catalog', 'information_schema', 'gc')
                  ),
                  true,
                  false
                ) as system
              FROM
                information_schema.tables t
              ORDER BY
                system,
                t.table_schema,
                t.table_name
            ) tables
          WHERE
            tables.number_of_shards IS NOT NULL
            or tables.system`,
  );

  if (!res.data || Array.isArray(res.data)) {
    return [];
  }

  return res.data.rows.map(r => {
    return {
      table_schema: r[0],
      table_name: r[1],
      number_of_shards: r[2],
      number_of_replicas: r[3],
      system: r[5],
    };
  });
}

async function getNodes(url: string | undefined): Promise<NodeStatusInfo[]> {
  const res = await executeSql(
    url,
    "SELECT id, name, hostname, heap, fs, os['cpu'] as cpu, load, version, process['cpu'] as cpu_usage, " +
      "os_info['available_processors'] as available_processors FROM sys.nodes ORDER BY id",
  );

  if (!res.data || Array.isArray(res.data)) {
    return [];
  }

  return res.data.rows.map(r => {
    return {
      id: r[0],
      name: r[1],
      hostname: r[2],
      heap: r[3],
      fs: r[4],
      cpu: r[5],
      load: r[6],
      version: r[7],
      cpu_usage: r[8],
      available_processors: r[9],
    };
  });
}

async function getTableInformation(
  url: string | undefined,
  schema: string,
  table: string,
): Promise<TableInfo[]> {
  const res = await executeSql(
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

  if (!res.data || Array.isArray(res.data)) {
    return [];
  }

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
  const res = await executeSql(
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

  if (!res.data || Array.isArray(res.data)) {
    return [];
  }

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
  const res = await executeSql(url, `SHOW CREATE TABLE "${schema}"."${table}"`);

  if (!res.data || Array.isArray(res.data)) {
    return;
  }

  if (res.data && res.data.error) {
    return;
  }
  return res.data && res.data.rows[0][0];
}

async function getAllocations(
  url: string | undefined,
): Promise<Allocation[] | undefined> {
  const res = await executeSql(
    url,
    `SELECT
          table_schema,
          table_name,
          partition_ident,
          COUNT(*) FILTER (WHERE "primary") cnt_primaries,
          COUNT(*) FILTER (WHERE "primary" AND (current_state='STARTED' OR current_state = 'RELOCATING')) cnt_primaries_started,
          COUNT(*) FILTER (WHERE NOT "primary") cnt_replicas,
          COUNT(*) FILTER (WHERE NOT "primary" AND (current_state='STARTED' OR current_state = 'RELOCATING')) cnt_replicas_started
        FROM sys.allocations
        GROUP BY 1,2,3`,
  );

  if (!res.data || Array.isArray(res.data)) {
    return;
  }

  if (res.data && res.data.error) {
    return;
  }

  return res.data.rows.map(row => {
    return {
      schema_name: row[0],
      table_name: row[1],
      partition_ident: row[2],
      num_primaries: row[3],
      num_started_primaries: row[4],
      num_replicas: row[5],
      num_started_replicas: row[6],
    };
  });
}

export type { User, TableListEntry, TableInfo, ShardInfo };
export {
  getUsers,
  getUserPermissions,
  getCurrentUser,
  getClusterInfo,
  getSchemas,
  getTables,
  getShards,
  getNodes,
  getTableInformation,
  showCreateTable,
  getAllocations,
};
