import JSONTree from '../JSONTree/JSONTree';
import { LinkOutlined } from '@ant-design/icons';
import { ColumnType } from 'types/query';
import { wrapText } from 'utils';
import { ArrowUpOutlined } from '@ant-design/icons';

export type TypeAwareValueParams = {
  value: unknown;
  columnType?: ColumnType;
  quoteStrings?: boolean;
  totalNumColumns?: number;
};

function TypeAwareValue({
  value,
  columnType,
  quoteStrings,
  totalNumColumns,
}: TypeAwareValueParams) {
  if (value == null) {
    return <span className="text-crate-blue">null</span>;
  }

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
        actualType = ColumnType.OBJECT;
        break;
      case 'undefined':
        actualType = ColumnType.NULL;
        break;
    }
  }

  if (actualType == ColumnType.TEXT && (value as string)?.startsWith('http')) {
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
          <span>{`${value}`}</span>
          <div className="text-xs">
            (<span className="text-crate-blue">{isoDate}</span>)
          </div>
        </div>
      );
      break;
    case ColumnType.TEXT:
    case ColumnType.CHARACTER:
    case ColumnType.CHAR:
      wrapped = wrapText(value as string, getWrapSize(totalNumColumns));

      if (quoteStrings) {
        wrapped = `'${wrapped}'`;
      }
      ret = <span>{wrapped}</span>;
      break;
    case ColumnType.GEOPOINT:
      ret = (
        <div className="whitespace-nowrap">
          <span>{JSON.stringify(value)}</span>{' '}
          <a
            href={`https://www.openstreetmap.org/?mlat=${(value as number[])[1]}&mlon=${(value as number[])[0]}`}
            target="_blank"
            data-testid="geopoint-link"
          >
            <ArrowUpOutlined
              rotate={45}
              className="relative bottom-1 left-0.5 opacity-50"
            />
          </a>
        </div>
      );
      break;
    case ColumnType.GEOSHAPE:
      ret = (
        <div className="whitespace-nowrap">
          <span>Type: {(value as { type: string }).type!}</span>{' '}
          <a
            href={`http://geojson.io/#data=data:application/json,${JSON.stringify(value)}`}
            target="_blank"
            data-testid="geoshape-link"
          >
            <ArrowUpOutlined
              rotate={45}
              className="relative bottom-1 left-0.5 opacity-50"
            />
          </a>
          <br />
          Coordinates:{' '}
          {JSON.stringify(
            (value as { coordinates: [number, number][][] }).coordinates!,
          )}
        </div>
      );
      break;
    case ColumnType.NULL:
      ret = (
        <span className="text-crate-blue">{value ? value.toString() : 'null'}</span>
      );
      break;
  }
  return ret;
}

const getWrapSize = (numColumns: number | undefined) => {
  if (!numColumns || numColumns >= 4) {
    return 60;
  } else if (numColumns == 3) {
    return 80;
  } else if (numColumns == 2) {
    return 120;
  }
  return 180;
};

export default TypeAwareValue;
