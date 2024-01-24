import { ColumnType } from '../../../utils/gc/executeSql.ts';
import JSONTree from '../JSONTree/JSONTree.tsx';
import wrap from 'word-wrap';
import { LinkOutlined } from '@ant-design/icons';

export type TypeAwareValueParams = {
  value: unknown;
  columnType?: ColumnType;
  quoteStrings?: boolean;
};

function TypeAwareValue({ value, columnType, quoteStrings }: TypeAwareValueParams) {
  let ret = <span>{value as string}</span>;
  let isoDate;
  let actualType = columnType;
  // If we don't know the column type (i.e. when displaying in a JSON tree),
  // attempt to guess what it might be.
  if (!actualType) {
    const tp = typeof value;
    switch (tp) {
      case 'number':
      case 'boolean':
      case 'bigint':
        actualType = ColumnType.INTEGER;
        break;
      case 'string':
        actualType = ColumnType.TEXT;
        break;
      case 'object':
        actualType = value == null ? ColumnType.NULL : ColumnType.OBJECT;
        break;
      case 'undefined':
        actualType = ColumnType.NULL;
        break;
    }
  }

  if (actualType == ColumnType.TEXT && (value as string).startsWith('http')) {
    try {
      const url = new URL(value as string);
      return (
        <a href={url.toString()} target="_blank">
          <LinkOutlined /> {url.toString()}
        </a>
      );
    } catch (_) {
      // ignore, don't care
    }
  }

  let wrapped;
  switch (actualType) {
    case ColumnType.OBJECT:
    case ColumnType.ARRAY:
    case ColumnType.UNCHECKED_OBJECT:
      ret = <JSONTree json={value as object} />;
      break;
    case ColumnType.BOOLEAN:
    case ColumnType.NUMERIC:
    case ColumnType.INTEGER:
    case ColumnType.BIGINT:
    case ColumnType.DOUBLE:
    case ColumnType.REAL:
      ret = (
        <span className="text-crate-blue">{value != null && value.toString()}</span>
      );
      break;
    case ColumnType.TIMESTAMP_WITH_TZ:
    case ColumnType.TIMESTAMP_WITHOUT_TZ:
      isoDate = new Date(Number(value)).toISOString();
      ret = (
        <div>
          <span>{`${value}`}</span> (
          <span className="text-crate-blue">{isoDate}</span>)
        </div>
      );
      break;
    case ColumnType.TEXT:
    case ColumnType.CHARACTER:
    case ColumnType.CHAR:
      wrapped = wrap(value as string, { width: 60 }).trim();
      if (quoteStrings) {
        wrapped = `'${wrapped}'`;
      }
      ret = <span>{wrapped}</span>;
      break;
    case ColumnType.GEOPOINT:
    case ColumnType.GEOSHAPE:
      ret = <span>{JSON.stringify(value)}</span>;
      break;
    case ColumnType.NULL:
      ret = (
        <span className="text-crate-blue">{value ? value.toString() : 'null'}</span>
      );
      break;
  }
  return ret;
}

export default TypeAwareValue;
