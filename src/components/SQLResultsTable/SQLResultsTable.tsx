import { Table, Tabs } from 'antd';
import { Heading } from '@crate.io/crate-ui-components';
import _ from 'lodash';
import { ColumnType, QueryResult, QueryResults } from '../../utils/gc/executeSql';

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
        rowKey="error"
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
  if (typeof value === 'object') {
    ret = JSON.stringify(value);
  } else if (typeof value === 'boolean') {
    ret = value.toString();
  } else if (
    [ColumnType.TIMESTAMP_WITH_TZ, ColumnType.TIMESTAMP_WITHOUT_TZ].includes(type)
  ) {
    const isoDate = new Date(Number(value)).toISOString();
    ret = (
      <div>
        <span>{`${value}`}</span>
        <span>{` (${isoDate})`}</span>
      </div>
    );
  }
  return ret;
};

const renderTable = (result: QueryResult) => {
  if (result.error) {
    return renderErrorTable(result);
  }
  let columns = result?.cols.map(col => {
    return {
      title: col,
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
      res[k] = <div>{actualValue}</div>;
    });
    return res;
  });
  if (columns?.length == 0) {
    columns = [
      {
        title: 'result',
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
        rowKey={columns[0].key}
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
