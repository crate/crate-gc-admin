import { SYSTEM_SCHEMAS, SYSTEM_USERS } from 'constants/database';
import {
  Allocation,
  ClusterInfo,
  NodeStatusInfo,
  QueryStats,
  ShardInfo,
  TableInfo,
  TableListEntry,
  UserInfo,
} from 'types/cratedb';
import useExecuteSql from 'hooks/useExecuteSql';
import {
  clusterInfoQuery,
  getPartitionedTablesQuery,
  nodesQuery,
  shardsQuery,
  usersQuery,
} from 'constants/queries';
import { QueryResultSuccess } from 'types/query';

export const postFetchUsers = (data: QueryResultSuccess): UserInfo[] => {
  return data.rows.map(row => {
    return {
      type: row[0],
      name: row[1],
      password_set: row[2],
      jwt_set: row[3],
      granted_roles: row[4],
      privileges: row[5],
      superuser: row[6],
      is_system_user: SYSTEM_USERS.includes(row[1]),
    };
  });
};

export const useGetUsersRolesQuery = () => {
  const executeSql = useExecuteSql();

  const getUsersRolesInfo = async (): Promise<UserInfo[]> => {
    const res = await executeSql(usersQuery);
    if (!res.data || Array.isArray(res.data)) {
      return [];
    }

    if ('error' in res.data) {
      throw res.data.error;
    }

    return postFetchUsers(res.data);
  };

  return getUsersRolesInfo;
};

export const useGetUserPermissionsQuery = () => {
  const executeSql = useExecuteSql();

  const getUserPermissions = async (username: string) => {
    return await executeSql(
      `SELECT grantee, class, ident, state, type FROM sys.privileges WHERE grantee='${username}'`,
    );
  };

  return getUserPermissions;
};

export const useGetCurrentUserQuery = () => {
  const executeSql = useExecuteSql();

  const getCurrentUser = async (): Promise<string> => {
    const res = await executeSql('SELECT CURRENT_USER');
    if (!res.data || 'error' in res.data || Array.isArray(res.data)) {
      return '';
    }
    return res.data.rows[0][0];
  };

  return getCurrentUser;
};

export const useGetClusterInfoQuery = () => {
  const executeSql = useExecuteSql();

  return async (): Promise<ClusterInfo | undefined> => {
    const res = await executeSql(clusterInfoQuery);
    if (!res.data || 'error' in res.data || Array.isArray(res.data)) {
      return;
    }
    const row = res.data.rows[0];
    return {
      id: row[0],
      name: row[1],
      master: row[2],
      settings: row[3],
    };
  };
};

export const useGetSchemasQuery = () => {
  const executeSql = useExecuteSql();

  const getSchemas = async (): Promise<string[]> => {
    const res = await executeSql(
      `SELECT 'doc' AS table_schema
                UNION
                SELECT DISTINCT(table_schema) FROM information_schema.tables
                                              WHERE table_schema NOT IN ('gc') ORDER BY 1;`,
    );

    if (!res.data || 'error' in res.data || Array.isArray(res.data)) {
      return [];
    }

    return res.data.rows.map(r => r[0]);
  };

  return getSchemas;
};

export const useGetPartitionedTablesQuery = (
  includeSystemTables: boolean = true,
) => {
  const executeSql = useExecuteSql();

  const getPartitionedTables = async (): Promise<TableListEntry[]> => {
    const res = await executeSql(getPartitionedTablesQuery(includeSystemTables));

    if (!res.data || 'error' in res.data || Array.isArray(res.data)) {
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
  };

  return getPartitionedTables;
};

export const useGetTablesQuery = (includeSystemTables: boolean = true) => {
  const executeSql = useExecuteSql();

  const getTables = async (): Promise<TableListEntry[]> => {
    const res = await executeSql(
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
                            t.table_schema IN (${SYSTEM_SCHEMAS.map(el => `'${el}'`).join(',')})
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
                    (tables.number_of_shards IS NOT NULL
                    or tables.system) ${includeSystemTables ? '' : 'AND NOT tables.system'}`,
    );

    if (!res.data || 'error' in res.data || Array.isArray(res.data)) {
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
  };

  return getTables;
};

export const useGetNodesQuery = () => {
  const executeSql = useExecuteSql();

  const getNodes = async (): Promise<NodeStatusInfo[]> => {
    const res = await executeSql(nodesQuery);

    if (!res.data || 'error' in res.data || Array.isArray(res.data)) {
      return [];
    }

    return res.data.rows.map(r => {
      return {
        id: r[0],
        name: r[1],
        hostname: r[2],
        heap: r[3],
        fs: r[4],
        load: r[5],
        version: r[6],
        crate_cpu_usage: r[7],
        available_processors: r[8],
        rest_url: r[9],
        os_info: r[10],
        timestamp: r[11],
        attributes: r[12],
        mem: r[13],
      };
    });
  };

  return getNodes;
};

export const useGetTableInformationQuery = () => {
  const executeSql = useExecuteSql();

  const getTableInformation = async (
    schema: string,
    table: string,
  ): Promise<TableInfo[]> => {
    const res = await executeSql(
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

    if (!res.data || 'error' in res.data || Array.isArray(res.data)) {
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
  };

  return getTableInformation;
};

export const useGetShardsQuery = () => {
  const executeSql = useExecuteSql();

  const getShards = async (): Promise<ShardInfo[]> => {
    const res = await executeSql(shardsQuery);

    if (!res.data || 'error' in res.data || Array.isArray(res.data)) {
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
  };

  return getShards;
};

export const useShowCreateTableQuery = () => {
  const executeSql = useExecuteSql();

  const showCreateTable = async (
    schema: string,
    table: string,
  ): Promise<string | undefined> => {
    const res = await executeSql(`SHOW CREATE TABLE "${schema}"."${table}"`);

    if (!res.data || Array.isArray(res.data)) {
      return;
    }

    if (res.data && 'error' in res.data) {
      return;
    }
    return res.data && res.data.rows[0][0];
  };

  return showCreateTable;
};

export const useGetAllocationsQuery = () => {
  const executeSql = useExecuteSql();

  const getAllocations = async (): Promise<Allocation[] | undefined> => {
    const res = await executeSql(
      `SELECT *, abs(alloc.sum_num_docs_primary - (alloc.sum_num_docs_primary * alloc.cnt_primaries) / alloc.cnt_primaries_started) as estimated_missing FROM (
                  SELECT
                      a.table_schema,
                      a.table_name,
                      a.partition_ident,
                      COUNT(*) FILTER (WHERE a."primary") cnt_primaries,
                      COUNT(*) FILTER (WHERE a."primary" AND current_state IN ('STARTED','RELOCATING')) cnt_primaries_started,
                      COUNT(*) FILTER (WHERE NOT a."primary") cnt_replicas,
                      COUNT(*) FILTER (WHERE NOT a."primary" AND current_state IN ('STARTED','RELOCATING')) cnt_replicas_started,
                      SUM(num_docs) FILTER (WHERE a."primary") sum_num_docs_primary
                    FROM sys.allocations a
                    LEFT JOIN sys."shards" s
                      ON s.schema_name = a.table_schema
                      AND s.table_name = a.table_name
                      AND s.id = a.shard_id
                      AND s.partition_ident = COALESCE(a.partition_ident,'')
                      AND s."primary" = true
                    GROUP BY 1,2,3) alloc;
          `,
    );

    if (!res.data || Array.isArray(res.data)) {
      return;
    }

    if (res.data && 'error' in res.data) {
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
        num_docs_in_primaries: row[7],
        estimate_missing_records: row[8],
      };
    });
  };

  return getAllocations;
};

export const useGetQueryStatsQuery = () => {
  const executeSql = useExecuteSql();

  const getQueryStats = async (): Promise<QueryStats[] | undefined> => {
    const res = await executeSql(
      `
            SELECT
              (ended / 10000) * 10000 + 5000 AS ended_time,
              COUNT(*) / 10.0 AS qps,
              COUNT(*) FILTER (WHERE classification['type'] = 'SELECT') / 10.0 AS qps_select,
              COUNT(*) FILTER (WHERE classification['type'] = 'INSERT') / 10.0 AS qps_insert,
              COUNT(*) FILTER (WHERE classification['type'] = 'DELETE') / 10.0 AS qps_delete,
              COUNT(*) FILTER (WHERE classification['type'] = 'UPDATE') / 10.0 AS qps_update,
              COUNT(*) FILTER (WHERE classification['type'] = 'DDL') / 10.0 AS qps_ddl,
              AVG(ended::bigint - started::bigint) AS duration,
              AVG(ended::bigint - started::bigint) FILTER (WHERE classification['type'] = 'SELECT') AS dur_select,
              AVG(ended::bigint - started::bigint) FILTER (WHERE classification['type'] = 'INSERT') AS dur_insert,
              AVG(ended::bigint - started::bigint) FILTER (WHERE classification['type'] = 'DELETE') AS dur_delete,
              AVG(ended::bigint - started::bigint) FILTER (WHERE classification['type'] = 'UPDATE') AS dur_update,
              AVG(ended::bigint - started::bigint) FILTER (WHERE classification['type'] = 'DDL') AS dur_ddl
            FROM
              sys.jobs_log
            WHERE
              ended > now() - ('15 minutes')::interval
            GROUP BY
              1
            ORDER BY
              ended_time ASC
            `,
    );

    if (!res.data || Array.isArray(res.data)) {
      return;
    }

    if (res.data && 'error' in res.data) {
      return;
    }
    return res.data.rows.map(r => {
      return {
        ended_time: r[0],
        qps: r[1],
        qps_select: r[2],
        qps_insert: r[3],
        qps_delete: r[4],
        qps_update: r[5],
        qps_ddl: r[6],
        duration: r[7],
        dur_select: r[8],
        dur_insert: r[9],
        dur_delete: r[10],
        dur_update: r[11],
        dur_ddl: r[12],
      };
    });
  };

  return getQueryStats;
};
