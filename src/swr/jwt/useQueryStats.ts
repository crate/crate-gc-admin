import useSWR from 'swr';
import { QueryResultSuccess } from 'types/query';
import { QueryStats } from 'types/cratedb';
import swrJWTFetch from '../swrJWTFetch';

const QUERY = `
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
`;

const postFetch = (data: QueryResultSuccess): QueryStats[] | undefined => {
  if (!data || Array.isArray(data)) {
    return;
  }

  if ('error' in data) {
    return;
  }

  return data.rows.map(r => ({
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
  }));
};

const useQueryStats = (clusterId?: string) => {
  return useSWR<QueryStats[] | undefined>(
    [`/use-query-stats/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    { refreshInterval: 5 * 1000 },
  );
};

export default useQueryStats;
