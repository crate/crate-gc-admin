import { ApiOutput, apiPost } from '../../hooks/api';

type Error = {
  code: number;
  message: string;
};

enum ColumnType {
  NULL = 0,
  NOT_SUPPORTED = 1,
  CHAR = 2,
  BOOLEAN = 3,
  TEXT = 4,
  IP = 5,
  DOUBLE = 6,
  REAL = 7,
  SMALLINT = 8,
  INTEGER = 9,
  BIGINT = 10,
  TIMESTAMP_WITH_TZ = 11,
  OBJECT = 12,
  GEOPOINT = 13,
  GEOSHAPE = 14,
  TIMESTAMP_WITHOUT_TZ = 15,
  UNCHECKED_OBJECT = 16,
  REGPROC = 19,
  TIME = 20,
  OIDVECTOR = 21,
  NUMERIC = 22,
  REGCLASS = 23,
  DATE = 24,
  BIT = 25,
  JSON = 26,
  CHARACTER = 27,
  ARRAY = 100,
}

type QueryResult = object & {
  col_types: ColumnType[] | undefined;
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
export { ColumnType };
export default executeSql;
