import useSWR from 'swr';
import { QueryResultSuccess } from 'types/query';
import { TableListEntry } from 'types/cratedb';
import swrJWTFetch from '../swrJWTFetch';

const QUERY = `
  SELECT
    *
  FROM
    (
      SELECT
        t.table_schema,
        t.table_name,
        t.number_of_shards,
        t.number_of_replicas,
        IF ((t.table_schema IN ('information_schema', 'sys', 'pg_catalog', 'gc')), true, false) AS system,
        t.partitioned_by IS NOT NULL AS is_partitioned
      FROM
        information_schema.tables t
      ORDER BY
        system,
        t.table_schema,
        t.table_name
    ) tables
  WHERE
    (
        tables.number_of_shards IS NOT NULL
        or tables.system
    )
`;

const postFetch = (data: QueryResultSuccess): TableListEntry[] => {
  return data.rows.map(r => ({
    table_schema: r[0],
    table_name: r[1],
    number_of_shards: r[2],
    number_of_replicas: r[3],
    system: r[4],
    is_partitioned: r[5],
  }));
};

const useTables = (clusterId?: string) => {
  return useSWR<TableListEntry[]>(
    [`/use-tables/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    { refreshInterval: 2 * 60 * 1000 },
  );
};

export default useTables;
