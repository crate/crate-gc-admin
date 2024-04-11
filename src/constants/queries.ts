import { SYSTEM_SCHEMAS } from './database';

export const getPartitionedTablesQuery = (includeSystemTables = false) => {
  return `SELECT
    *
  FROM
    (
      SELECT
        t.table_schema,
        t.table_name,
        t.number_of_shards,
        t.number_of_replicas,
        t.partitioned_by,
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
    or tables.system) AND partitioned_by IS NOT NULL ${includeSystemTables ? '' : 'AND NOT tables.system'}`;
};
