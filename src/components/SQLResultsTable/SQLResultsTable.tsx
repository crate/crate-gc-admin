import { Table, Tabs } from 'antd';
import _ from 'lodash';
import { ColumnType, QueryResult, QueryResults } from '../../utils/gc/executeSql';
import TypeAwareValue from './TypeAwareValue/TypeAwareValue.tsx';

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

const nicelyHandleTypes = (type: ColumnType, value: unknown) => {
  return <TypeAwareValue value={value} columnType={type} />;
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
      className: 'align-top',
    };
  });
  let data: object[] = result?.rows.map((row, idx) => {
    const res = { key: `row-${idx}` };
    _.zip(result.col_types, result.cols, row).forEach(arr => {
      const [t, k, v] = arr;
      // Array types are noted as [100, X]
      const actualType = Array.isArray(t) ? t[0] : t;
      const actualValue = nicelyHandleTypes(actualType, v);
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
      label: `Result ${i}`,
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
