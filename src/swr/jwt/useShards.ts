import useSWR from 'swr';
import swrJWTFetch from '../swrJWTFetch';
import { QueryResultSuccess } from 'types/query';
import { ShardInfo } from 'types/cratedb';

const QUERY = `
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
    "primary"
`;

export const postFetch = (data: QueryResultSuccess): ShardInfo[] => {
  return data.rows.map(r => ({
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
  }));
};

const useTablesShards = (clusterId?: string) => {
  return useSWR<ShardInfo[]>(
    [`/use-shards/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    { refreshInterval: 5 * 1000 },
  );
};

export default useTablesShards;
