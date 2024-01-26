import { Radio, Table, Tabs } from 'antd';
import _ from 'lodash';
import { ColumnType, QueryResult, QueryResults } from '../../utils/gc/executeSql';
import TypeAwareValue from './TypeAwareValue/TypeAwareValue.tsx';
import { dbTypeToHumanReadable } from './utils.ts';
import React, { useState } from 'react';
import Papa from 'papaparse';

type Params = {
  results: QueryResults | undefined;
  format?: boolean;
};

function SQLResultsTable({ results }: Params) {
  const [format, setFormat] = useState<string>('pretty');

  const renderErrorTable = (result: QueryResult) => {
    const columns = [
      {
        title: 'code',
        key: 'code',
        dataIndex: 'code',
        width: '10%',
        render: (value: string) => (
          <a
            href="https://cratedb.com/docs/crate/reference/en/latest/interfaces/http.html#error-codes"
            target="_blank"
          >
            {value}
          </a>
        ),
      },
      {
        title: 'error',
        key: 'error',
        dataIndex: 'message',
        width: '90%',
        textWrap: '',
      },
    ];
    const data = [{ ...result.error, key: 'error' }];

    return (
      <div>
        <Table
          columns={columns}
          dataSource={data}
          showHeader
          bordered
          size="small"
          pagination={false}
        />
      </div>
    );
  };

  const nicelyHandleTypes = (
    type: ColumnType,
    value: unknown,
    numColumns: number,
  ) => {
    if (format == 'pretty') {
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

  const asJson = (result: QueryResult) => {
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
        .reduce((prev, next) => {
          return {
            key: 'single',
            title: 'single',
            json: prev.json + '\n' + next.json,
          };
        }),
    ];

    return [columns, data];
  };

  const asCSV = (result: QueryResult) => {
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
            const [k, v] = arr;
            // @ts-expect-error k cannot be undefined
            rowValue[k] = v;
          });
          res.row = rowValue;
          return res;
        })
        .reduce((prev, next) => {
          const acc: object[] = prev.accumulated || [prev.row];
          acc.push(next.row);
          return {
            key: 'single',
            row: {},
            accumulated: acc,
          };
        }),
    ].map(v => {
      return {
        ...v,
        accumulated:
          Papa.unparse(v?.accumulated) ||
          'Looks like this data is too complex to display as a CSV. We tried, sorry.',
      };
    });

    return [columns, data];
  };

  const asTable = (result: QueryResult) => {
    const columns = _.zip(result.col_types, result.cols).flatMap(arr => {
      const [type, col] = arr;
      return {
        title: () => (
          <div>
            <div className="font-bold">{col}</div>
            <div className="text-xs opacity-50">{dbTypeToHumanReadable(type)}</div>
          </div>
        ),
        key: col,
        dataIndex: col,
        width: '10%',
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
        const actualValue = nicelyHandleTypes(actualType, v, len);
        // @ts-expect-error typing is hard
        res[k] = <pre>{actualValue}</pre>;
      });
      return res;
    });

    return [columns, data];
  };

  const renderTable = (result: QueryResult) => {
    if (result.error) {
      return renderErrorTable(result);
    }

    let columns;
    let data: object[];

    if (format == 'json') {
      [columns, data] = asJson(result);
    } else if (format == 'csv') {
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

    return result ? (
      <div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ defaultPageSize: 20 }}
          showHeader
          bordered
          size="small"
          scroll={{
            x: 'max-content',
          }}
          title={() => (
            <div className="flex flex-row gap-2">
              <div className="text-xs font-bold border-e pr-2 pt-1">
                {`${result.rowcount} rows, ${result.duration} ms`}
              </div>
              <div>
                <Radio.Group
                  options={[
                    { label: 'Pretty', value: 'pretty' },
                    { label: 'Raw', value: 'raw' },
                    { label: 'CSV', value: 'csv' },
                    { label: 'JSON', value: 'json' },
                  ]}
                  onChange={evt => setFormat(evt.target.value)}
                  value={format}
                  optionType="button"
                  buttonStyle="solid"
                  size="small"
                />
              </div>
            </div>
          )}
        />
      </div>
    ) : null;
  };

  const renderTabs = (results: QueryResult[]) => {
    if (!results) {
      return null;
    }
    let idx = 0;
    const tabs = results.map(o => {
      const i = ++idx;
      return {
        key: `${i}`,
        label: `Result ${i}`,
        children: renderTable(o),
      };
    });
    return <Tabs defaultActiveKey="1" items={tabs} />;
  };

  let ret = null;
  if (Array.isArray(results)) {
    ret = renderTabs(results);
  } else if (results) {
    ret = renderTable(results);
  }
  return <div className="w-full">{ret}</div>;
}

export default SQLResultsTable;
