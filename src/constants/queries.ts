import { SYSTEM_SCHEMAS } from './database';

export const getTablesColumnsQuery = `
  SELECT
    c.table_schema,
    c.table_name,
    c.column_name,
    QUOTE_IDENT(c.table_schema) AS quoted_table_schema,
    QUOTE_IDENT(c.table_name) AS quoted_table_name,
    QUOTE_IDENT(c.column_name) AS quoted_column_name,
    c.data_type,
    t.table_type
  FROM
    "information_schema"."columns" c
  JOIN
    "information_schema"."tables" t ON c.table_schema = t.table_schema AND c.table_name = t.table_name
  ORDER BY
    table_schema,
    table_name,
    ordinal_position`;

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

export const nodesQuery = `SELECT
    id,
    name,
    hostname,
    heap,
    fs,
    load,
    version,
    process['cpu']['percent'] as cpu_usage,
    os_info['available_processors'] as available_processors,
    rest_url,
    os_info,
    now(),
    attributes,
    mem
  FROM
    sys.nodes
  ORDER BY
    name`;

export const clusterInfoQuery = `
  SELECT
    id,
    name,
    master_node,
    settings
  FROM
    sys.cluster`;

export const shardsQuery = `
  SELECT
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
    "primary"`;

export const getTablesDDLQuery = (schema: string, table: string) =>
  `SHOW CREATE TABLE "${schema}"."${table}"`;

export const getViewsDDLQuery = (schema: string, view: string) =>
  `SELECT
    concat(
      'CREATE OR REPLACE VIEW "${schema}"."${view}" AS (',
        (
          SELECT
            view_definition
          FROM
            information_schema.views
          WHERE
            table_schema = '${schema}'
            and table_name = '${view}'
        ), 
        ')'
    );`;
