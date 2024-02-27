import { ColumnType } from '../../types/query';

export const dbTypeToHumanReadable = (tp: ColumnType | ColumnType[] | undefined) => {
  // Array types are represented as [100, 1]
  const actual = Array.isArray(tp) ? tp[0] : tp;
  switch (actual) {
    case ColumnType.NULL:
      return 'null';
    case ColumnType.NOT_SUPPORTED:
      return '';
    case ColumnType.CHAR:
      return 'char';
    case ColumnType.BOOLEAN:
      return 'boolean';
    case ColumnType.TEXT:
      return 'text';
    case ColumnType.IP:
      return 'ip address';
    case ColumnType.DOUBLE:
      return 'double';
    case ColumnType.REAL:
      return 'real';
    case ColumnType.SMALLINT:
      return 'smallint';
    case ColumnType.INTEGER:
      return 'integer';
    case ColumnType.BIGINT:
      return 'bigint';
    case ColumnType.TIMESTAMP_WITH_TZ:
      return 'timestamp';
    case ColumnType.OBJECT:
      return 'object';
    case ColumnType.GEOPOINT:
      return 'geo point';
    case ColumnType.GEOSHAPE:
      return 'geo shape';
    case ColumnType.TIMESTAMP_WITHOUT_TZ:
      return 'timestamp';
    case ColumnType.UNCHECKED_OBJECT:
      return 'object';
    case ColumnType.REGPROC:
      return 'regproc';
    case ColumnType.TIME:
      return 'time';
    case ColumnType.OIDVECTOR:
      return 'oid vector';
    case ColumnType.NUMERIC:
      return 'numeric';
    case ColumnType.REGCLASS:
      return 'regclass';
    case ColumnType.DATE:
      return 'date';
    case ColumnType.BIT:
      return 'bit';
    case ColumnType.JSON:
      return 'json';
    case ColumnType.CHARACTER:
      return 'char';
    case ColumnType.ARRAY:
      return 'array';
  }
};
