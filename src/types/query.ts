import { Statement } from 'node_modules/@cratedb/cratedb-sqlparse/dist/parser';

export type Error = {
  code?: number;
  message: string;
};

export enum ColumnType {
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

export type QueryResultError = {
  error: Error;
  error_trace?: string;
  original_query?: Statement;
  line?: number;
};

export type QueryResultSuccess = object & {
  col_types: (ColumnType | ColumnType[])[];
  cols: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[][];
  rowcount: number;
  duration: number;
  original_query?: Statement;
};

export type QueryResult = QueryResultSuccess | QueryResultError;

export type QueryResults = QueryResult | QueryResult[] | undefined;

export type QueryStatusType =
  | 'SUCCESS'
  | 'ERROR'
  | 'WAITING'
  | 'EXECUTING'
  | 'NOT_EXECUTED';
export type QueryStatus = {
  status: QueryStatusType;
  result: QueryResult | undefined;
};
