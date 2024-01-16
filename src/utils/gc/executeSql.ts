import { ApiOutput, apiPost } from '../../hooks/api';

type Error = {
  code: number;
  message: string;
};

type QueryResult = object & {
  cols: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[][];
  rowcount: bigint;
  duration: number;
  original_query: string | undefined;
  error: Error | undefined;
};
type QueryResults = QueryResult | QueryResult[] | undefined;

async function executeSql(
  url: string | undefined,
  sql: string,
): Promise<ApiOutput<QueryResults>> {
  if (!url) {
    throw 'URL Not specified';
  }

  const response = await apiPost<QueryResults>(
    url,
    { stmt: sql },
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      credentials: 'include',
    },
  );

  return {
    data: response.data,
    status: response.status,
    success: true,
  };
}

export type { Error, QueryResult, QueryResults };
export default executeSql;
