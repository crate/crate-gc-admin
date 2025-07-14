import useSWR from 'swr';
import { QueryResultSuccess } from 'types/query';
import { NodeStatusInfo } from 'types/cratedb';
import swrJWTFetch from '../swrJWTFetch';

const QUERY = `
  SELECT
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
    name
`;

const postFetch = (data: QueryResultSuccess): NodeStatusInfo[] => {
  return data.rows.map(r => ({
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
  }));
};

const useClusterNodeStatus = (clusterId?: string) => {
  return useSWR<NodeStatusInfo[]>(
    [`/use-cluster-node-status/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    { refreshInterval: 5 * 1000 },
  );
};

export default useClusterNodeStatus;
