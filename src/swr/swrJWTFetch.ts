import useJWTManagerStore from 'state/jwtManager';
import { QueryResultSuccess } from 'types/query';

export type JWTFetchArgs = {
  clusterId: string;
  crateUrl: string;
  crateVersion: string;
  gcUrl: string;
  sql: string;
  sessionTokenKey: string;
};

const swrJWTFetch = async <T>(
  url: string,
  sql: string,
  postFetch?: (res: QueryResultSuccess) => T,
) => {
  const headers = await useJWTManagerStore.getState().getHeaders();
  const res = await fetch(useJWTManagerStore.getState().getUrl(url), {
    body: JSON.stringify({ stmt: sql }),
    headers: headers,
    method: 'POST',
  });

  const data = await res.json();
  if (postFetch) {
    return postFetch(data as QueryResultSuccess);
  }
  return data;
};

export default swrJWTFetch;
