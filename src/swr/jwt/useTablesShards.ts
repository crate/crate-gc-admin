import useSWR from 'swr';
import swrJWTFetch from '../swrJWTFetch';
import { TABLE_HEALTH_STATES, TableHealthState } from 'constants/database';
import { QueryResultSuccess } from 'types/query';

export type TableShard = {
  schemaName: string;
  tableName: string;
  partitionName: string | null;
  isPartitioned: boolean;
  numberOfReplicas: string;
  numberOfShards: number;
  totalReplica: number;
  numberOfRecords: number;
  sizeInBytes: number;
  startedShards: number;
  missingShards: number;
  unassignedShards: number;
  health: TableHealthState;
};

const postFetch = (data: QueryResultSuccess): TableShard[] => {
  const createTableRow = (
    schemaName: string,
    tableName: string,
    partitionName: string | null,
    isPartitioned: boolean,
    numberOfReplicas: string,
    numberOfShards: number,
    startedPrimary: number,
    startedReplica: number,
    unassignedPrimary: number,
    unassignedReplica: number,
    totalPrimary: number,
    totalReplica: number,
    numberOfRecords: number,
    sizeInBytes: number,
  ): TableShard => {
    // calculate shorthand values
    const startedShards = startedPrimary + startedReplica;
    const unassignedShards = unassignedPrimary + unassignedReplica;
    const totalShards = totalPrimary + totalReplica;
    const missingShards = totalShards - startedShards - unassignedShards;

    // calculate health
    let health: TableHealthState = TABLE_HEALTH_STATES.GREEN;
    if (startedReplica < totalReplica) {
      health = TABLE_HEALTH_STATES.YELLOW;
    }
    if (startedPrimary == 0 || startedPrimary < totalPrimary) {
      health = TABLE_HEALTH_STATES.RED;
    }

    return {
      schemaName,
      tableName,
      partitionName,
      isPartitioned,
      numberOfReplicas,
      numberOfShards,
      totalReplica,
      numberOfRecords,
      sizeInBytes,
      startedShards,
      missingShards,
      unassignedShards,
      health,
    };
  };

  const output: TableShard[] = [];

  data?.rows?.forEach(table => {
    // add the tables
    output.push(
      createTableRow(
        table[0],
        table[1],
        null,
        table[2],
        table[3],
        table[4],
        table[5],
        table[6],
        table[7],
        table[8],
        table[9],
        table[10],
        table[11],
        table[12],
      ),
    );

    // add rows for each partition
    if (table[2]) {
      table[13]?.forEach(
        (partition: {
          partition_ident: string;
          number_of_replicas: string;
          number_of_shards: number;
          started_primary: number;
          started_replica: number;
          unassigned_primary: number;
          unassigned_replica: number;
          total_primary: number;
          total_replica: number;
          num_docs_primary: number;
          size_primary: number;
        }) => {
          output.push(
            createTableRow(
              table[0],
              table[1],
              partition.partition_ident,
              false,
              partition.number_of_replicas,
              partition.number_of_shards,
              partition.started_primary,
              partition.started_replica,
              partition.unassigned_primary,
              partition.unassigned_replica,
              partition.total_primary,
              partition.total_replica,
              partition.num_docs_primary,
              partition.size_primary,
            ),
          );
        },
      );
    }
  });

  return output;
};

const QUERY = `
  WITH base_shards AS (
    SELECT
      s.schema_name,
      s.table_name,
      arbitrary(t.partitioned_by) IS NOT NULL AS is_partitioned,
      arbitrary(t.number_of_replicas) AS number_of_replicas,
      arbitrary(t.number_of_shards) AS number_of_shards,
      COUNT(*) FILTER (WHERE s.primary AND s.routing_state IN ('STARTED','RELOCATING')) AS started_primary,
      COUNT(*) FILTER (WHERE NOT s.primary AND s.routing_state IN ('STARTED','RELOCATING')) AS started_replica,
      COUNT(*) FILTER (WHERE s.primary AND s.routing_state IN ('UNASSIGNED')) AS unassigned_primary,
      COUNT(*) FILTER (WHERE NOT s.primary AND s.routing_state IN ('UNASSIGNED')) AS unassigned_replica,
      COUNT(*) FILTER (WHERE s.primary) AS total_primary,
      COUNT(*) FILTER (WHERE NOT s.primary) AS total_replica,
      SUM(s.num_docs) FILTER (WHERE s.primary) AS num_docs_primary,
      SUM(s.size) FILTER (WHERE s.primary) AS size_primary
    FROM sys.shards s
    JOIN information_schema.tables t
      ON s.schema_name = t.table_schema
     AND s.table_name = t.table_name
    GROUP BY s.schema_name, s.table_name
  ), partitioned_shards AS (
    SELECT
      s.schema_name,
      s.table_name,
      s.partition_ident,
      arbitrary(tp.number_of_replicas) AS number_of_replicas,
      arbitrary(tp.number_of_shards) AS number_of_shards,
      COUNT(*) FILTER (WHERE s.primary AND s.routing_state IN ('STARTED','RELOCATING')) AS started_primary,
      COUNT(*) FILTER (WHERE NOT s.primary AND s.routing_state IN ('STARTED','RELOCATING')) AS started_replica,
      COUNT(*) FILTER (WHERE s.primary AND s.routing_state IN ('UNASSIGNED')) AS unassigned_primary,
      COUNT(*) FILTER (WHERE NOT s.primary AND s.routing_state IN ('UNASSIGNED')) AS unassigned_replica,
      COUNT(*) FILTER (WHERE s.primary) AS total_primary,
      COUNT(*) FILTER (WHERE NOT s.primary) AS total_replica,
      SUM(s.num_docs) FILTER (WHERE s.primary) AS num_docs_primary,
      SUM(s.size) FILTER (WHERE s.primary) AS size_primary
    FROM sys.shards s
    JOIN information_schema.table_partitions tp
      ON s.schema_name = tp.table_schema
     AND s.table_name = tp.table_name
     AND s.partition_ident = tp.partition_ident
    WHERE s.partition_ident <> ''
    GROUP BY s.schema_name, s.table_name, s.partition_ident
  ), partitioned_shards_agg AS (
    SELECT
      schema_name,
      table_name,
      ARRAY_AGG(
        {
          partition_ident = partition_ident,
          number_of_replicas = number_of_replicas,
          number_of_shards = number_of_shards,
          started_primary = started_primary,
          started_replica = started_replica,
          unassigned_primary = unassigned_primary,
          unassigned_replica = unassigned_replica,
          total_primary = total_primary,
          total_replica = total_replica,
          num_docs_primary = num_docs_primary,
          size_primary = size_primary
        }
      ) AS partitions
    FROM partitioned_shards
    GROUP BY schema_name, table_name
  )

  SELECT
    base_shards.*,
    partitioned_shards_agg.partitions
  FROM base_shards
  LEFT JOIN partitioned_shards_agg
    USING (schema_name, table_name)
  ORDER BY schema_name, table_name;
`;

const useTablesShards = (clusterId?: string) => {
  return useSWR<TableShard[]>(
    [`/use-tables-shards/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    { refreshInterval: 10 * 1000 },
  );
};

export default useTablesShards;
