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
