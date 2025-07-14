import useSWR from 'swr';
import { QueryResultSuccess } from 'types/query';
import { Allocation } from 'types/cratedb';
import swrJWTFetch from '../swrJWTFetch';

const QUERY = `
SELECT
    *
    ,abs(alloc.sum_num_docs_primary - (alloc.sum_num_docs_primary * alloc.cnt_primaries) / alloc.cnt_primaries_started) AS estimated_missing
FROM (
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
    GROUP BY 1,2,3
) alloc;
`;

const postFetch = (data: QueryResultSuccess): Allocation[] | undefined => {
  if (!data || Array.isArray(data)) {
    return;
  }

  if ('error' in data) {
    return;
  }

  return data.rows.map(r => ({
    schema_name: r[0],
    table_name: r[1],
    partition_ident: r[2],
    num_primaries: r[3],
    num_started_primaries: r[4],
    num_replicas: r[5],
    num_started_replicas: r[6],
    num_docs_in_primaries: r[7],
    estimate_missing_records: r[8],
  }));
};

const useAllocations = (clusterId?: string) => {
  return useSWR<Allocation[] | undefined>(
    [`/use-allocations/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    { refreshInterval: 5 * 1000 },
  );
};

export default useAllocations;
