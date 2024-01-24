import { Table, Tabs } from 'antd';
import { Heading } from '@crate.io/crate-ui-components';
import _ from 'lodash';
import { ColumnType, QueryResult, QueryResults } from '../../utils/gc/executeSql';
import wrap from 'word-wrap';

type Params = {
  results: QueryResults | undefined;
};

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
  const data = [result.error];

  return (
    <div>
      <Heading level="h4" children={result.original_query} />
      <Table
        columns={columns}
        // @ts-expect-error error is never null
        dataSource={data}
        showHeader
        bordered
        size="small"
        pagination={false}
      />
    </div>
  );
};

const nicelyHandleTypes = (type: ColumnType, value: unknown) => {
  let ret = value;
  let isoDate;
  switch (type) {
    case ColumnType.OBJECT:
    case ColumnType.ARRAY:
    case ColumnType.UNCHECKED_OBJECT:
      ret = JSON.stringify(value);
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
      ret = wrap(value as string, { width: 60 });
  }
  if (value == null) {
    ret = <span className="text-crate-blue">null</span>;
  }
  return ret;
};

const renderTable = (result: QueryResult) => {
  if (result.error) {
    return renderErrorTable(result);
  }
  let columns = result?.cols.map(col => {
    return {
      title: () => <span className="font-bold">{col}</span>,
      key: col,
      dataIndex: col,
      width: '10%',
      ellipsis: true,
    };
  });
  let data = result?.rows.map(row => {
    const res = {};
    _.zip(result.col_types, result.cols, row).forEach(arr => {
      const [t, k, v] = arr;
      const actualValue = nicelyHandleTypes(t, v);
      // @ts-expect-error typing is hard
      res[k] = <pre>{actualValue}</pre>;
    });
    return res;
  });
  if (columns?.length == 0) {
    columns = [
      {
        title: () => <span className="font-bold">result</span>,
        key: 'result',
        dataIndex: 'result',
        width: '100%',
        ellipsis: true,
      },
    ];
    data = [
      {
        result: 'OK',
      },
    ];
  }

  return result ? (
    <div>
      <Heading level="h4" children={result.original_query} />
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
        footer={() => (
          <div className="text-xs font-bold">
            {`${result.rowcount} rows, ${result.duration} ms`}
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
      label: `Query ${i}`,
      children: renderTable(o),
    };
  });
  return <Tabs defaultActiveKey="1" items={tabs} />;
};

function SQLResultsTable({ results }: Params) {
  let ret = null;
  if (Array.isArray(results)) {
    ret = renderTabs(results);
  } else if (results) {
    ret = renderTable(results);
  }
  return <div className="w-full">{ret}</div>;
}

export default SQLResultsTable;
