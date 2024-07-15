import React from 'react';
import { Radio, Table } from 'antd';
import _ from 'lodash';
import Chip from 'components/Chip';
import Switch from 'components/Switch';
import TypeAwareValue from './TypeAwareValue/TypeAwareValue';
import { dbTypeToHumanReadable } from './utils';
import Papa from 'papaparse';
import {
  ColumnType,
  QueryResult,
  QueryResultError,
  QueryResultSuccess,
} from 'types/query';
import useSessionStore from 'state/session';

const COLUMN_SIZE = 150;

type Params = {
  result: QueryResult | undefined;
  format?: boolean;
};

function SQLResultsTable({ result }: Params) {
  const { showErrorTrace, tableResultsFormat } = useSessionStore();
  const setShowErrorTrace = useSessionStore(store => store.setShowErrorTrace);
  const setTableResultsFormat = useSessionStore(
    store => store.setTableResultsFormat,
  );

  const toggleErrorTrace = () => {
    setShowErrorTrace(!showErrorTrace);
  };

  const renderErrorTable = (result: QueryResultError) => {
    return (
      <div className="p-4">
        <div className="flex min-h-12 flex-row items-center justify-between rounded border p-2">
          <div className="flex items-center gap-4 pr-2 text-sm">
            <Chip className="bg-red-600 uppercase text-white">Error</Chip>
            {typeof result.error.code !== 'undefined' && (
              <a
                href="https://cratedb.com/docs/crate/reference/en/latest/interfaces/http.html#error-codes"
                target="_blank"
              >
                {result.error?.code}
              </a>
            )}
            <span className="font-mono text-xs">{result.error?.message}</span>
          </div>
          {result.error_trace && (
            <div className="flex select-none items-center gap-2">
              <span
                className="cursor-pointer whitespace-nowrap text-sm"
                onClick={toggleErrorTrace}
              >
                Show error trace
              </span>
              <Switch.Root
                checked={showErrorTrace}
                onCheckedChange={() => setShowErrorTrace(!showErrorTrace)}
                size="small"
              />
            </div>
          )}
        </div>
        {showErrorTrace && (
          <div className="mt-4">
            <div className="font-bold">Error trace:</div>
            <pre className="text-xs">{result.error_trace}</pre>
          </div>
        )}
      </div>
    );
  };

  const nicelyHandleTypes = (
    type: ColumnType,
    value: unknown,
    numColumns: number,
  ) => {
    if (tableResultsFormat == 'pretty') {
      return (
        <TypeAwareValue
          value={value}
          columnType={type}
          totalNumColumns={numColumns}
        />
      );
    }
    if (typeof value == 'object') {
      return JSON.stringify(value);
    }
    return value;
  };

  const asJson = (result: QueryResultSuccess) => {
    const columns = [
      {
        title: () => (
          <div>
            <div className="font-bold">JSON</div>
          </div>
        ),
        key: 'json',
        dataIndex: 'json',
        width: '100%',
        ellipsis: false,
        className: 'align-top',
        render: (res: React.JSX.Element) => (
          <pre
            onDoubleClick={event => {
              window?.getSelection()?.selectAllChildren(event.currentTarget);
            }}
          >
            {res}
          </pre>
        ),
      },
    ];
    const data = [
      result?.rows
        .map((row, idx) => {
          const res = { key: `row-${idx}`, json: '' };
          const rowValue = {};
          _.zip(result.cols, row).forEach(arr => {
            const [k, v] = arr;
            // @ts-expect-error k cannot be undefined
            rowValue[k] = v;
          });
          res.json = JSON.stringify(rowValue);
          return res;
        })
        .reduce(
          // @ts-expect-error initial value has null
          (prev, next) => {
            const concat = prev.json ? prev.json + '\n' + next.json : next.json;
            return {
              key: 'single',
              title: 'single',
              json: concat,
            };
          },
          { json: null },
        ),
    ];

    return [columns, data];
  };

  const asCSV = (result: QueryResultSuccess) => {
    const columns = [
      {
        title: () => (
          <div>
            <div className="font-bold">CSV</div>
          </div>
        ),
        key: 'csv',
        dataIndex: 'accumulated',
        width: '100%',
        ellipsis: false,
        className: 'align-top',
        render: (res: React.JSX.Element) => (
          <pre
            onDoubleClick={event => {
              window?.getSelection()?.selectAllChildren(event.currentTarget);
            }}
          >
            {res}
          </pre>
        ),
      },
    ];

    const data = [
      result?.rows
        .map((row, idx) => {
          const res: { key: string; row: object; accumulated: object[] } = {
            key: `row-${idx}`,
            row: {},
            accumulated: [],
          };
          const rowValue = {};
          _.zip(result.cols, row).forEach(arr => {
            const [k] = arr;
            let [, v] = arr;
            // If we don't do this, we end up with [object Object]. At least return JSON.
            if (typeof v === 'object' || typeof v === 'string') {
              v = JSON.stringify(v);
            }
            // @ts-expect-error k cannot be undefined
            rowValue[k] = v;
          });
          res.row = rowValue;
          return res;
        })
        .reduce(
          // @ts-expect-error we're specifying an initial value with nulls. TS unhappy.
          (prev, next) => {
            const acc: object[] = prev.accumulated;
            acc.push(next.row);
            return {
              key: 'single',
              row: {},
              accumulated: acc,
            };
          },
          { accumulated: [] },
        ),
    ].map(v => {
      const csvString = Papa.unparse(v.accumulated, {
        quotes: false,
      }).replace(/"""/g, '"');
      return {
        ...v,
        accumulated:
          csvString ||
          'Looks like this data cannot be displayed as a CSV. We tried, sorry.',
      };
    });

    return [columns, data];
  };

  const asTable = (result: QueryResultSuccess) => {
    const columns = _.zip(result.col_types, result.cols).flatMap(arr => {
      const [type, col] = arr;
      return {
        title: () => (
          <div>
            <div className="overflow-hidden text-ellipsis font-bold">{col}</div>
            <div className="text-xs opacity-50">{dbTypeToHumanReadable(type)}</div>
          </div>
        ),
        key: col,
        dataIndex: col,
        width: `${COLUMN_SIZE}px`,
        ellipsis: true,
        className: 'align-top',
      };
    });
    const data = result?.rows.map((row, idx) => {
      const res = { key: `row-${idx}` };
      const len = result.cols.length;
      _.zip(result.col_types, result.cols, row).forEach(arr => {
        const [t, k, v] = arr;
        // Array types are noted as [100, X]
        const actualType = Array.isArray(t) ? t[0] : t;
        const actualValue = nicelyHandleTypes(actualType!, v, len);
        // @ts-expect-error typing is hard
        res[k] = <pre>{actualValue}</pre>;
      });
      return res;
    });

    return [columns, data];
  };

  if (!result) {
    return null;
  }

  if ('error' in result) {
    return renderErrorTable(result);
  }

  let columns;
  let data: object[];

  if (tableResultsFormat == 'json') {
    [columns, data] = asJson(result);
  } else if (tableResultsFormat == 'csv') {
    [columns, data] = asCSV(result);
  } else {
    [columns, data] = asTable(result);
  }

  if (columns?.length == 0) {
    columns = [
      {
        title: () => <span className="font-bold">result</span>,
        key: 'result',
        dataIndex: 'result',
        width: '100%',
        ellipsis: true,
        className: '',
      },
    ];
    data = [
      {
        key: 'OK',
        result: 'OK',
      },
    ];
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{ defaultPageSize: 20, position: ['bottomRight'] }}
      showHeader
      size="small"
      sticky
      scroll={{
        x: COLUMN_SIZE,
      }}
      className="min-h-[50px]"
      title={() => (
        <div className="flex h-8 flex-row items-center gap-2">
          <div className="flex items-center gap-2 border-e pr-2 text-xs font-bold">
            <Chip className="mr-1.5 bg-green-600 text-white">OK</Chip>
            {`${result.rowcount} rows, ${(Math.round(result?.duration) / 1000).toFixed(3)} seconds`}
          </div>
          <Radio.Group
            options={[
              { label: 'Pretty', value: 'pretty' },
              { label: 'Raw', value: 'raw' },
              { label: 'CSV', value: 'csv' },
              { label: 'JSON', value: 'json' },
            ]}
            onChange={evt => setTableResultsFormat(evt.target.value)}
            value={tableResultsFormat}
            optionType="button"
            buttonStyle="solid"
            size="small"
          />
        </div>
      )}
    />
  );
}

export default SQLResultsTable;
