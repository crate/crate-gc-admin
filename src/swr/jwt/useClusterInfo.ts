import useSWR from 'swr';
import swrJWTFetch from '../swrJWTFetch';
import { QueryResultSuccess } from 'types/query';
import { ClusterInfo } from 'types/cratedb';

const QUERY = `
  SELECT
    id,
    name,
    master_node,
    settings
  FROM
    sys.cluster
`;

const postFetch = (data: QueryResultSuccess): ClusterInfo => {
  const row = data.rows[0];
  return {
    id: row[0],
    name: row[1],
    master: row[2],
    settings: row[3],
  };
};

const useClusterInfo = (clusterId?: string) => {
  return useSWR<ClusterInfo>(
    [`/use-cluster-info/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    { refreshInterval: 2 * 60 * 1000 },
  );
};

export default useClusterInfo;
