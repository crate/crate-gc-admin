import useSWR from 'swr';
import { QueryResultSuccess } from 'types/query';
import swrJWTFetch from '../swrJWTFetch';

const QUERY = 'SELECT CURRENT_USER';

const postFetch = (data: QueryResultSuccess): string => {
  return data.rows[0][0];
};

const useCurrentUser = (clusterId?: string) => {
  return useSWR<string>(
    [`/use-current-user/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    {},
  );
};

export default useCurrentUser;
