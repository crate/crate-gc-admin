import { Table, Tabs } from 'antd';
import { Heading } from '@crate.io/crate-ui-components';
import _ from 'lodash';
import { QueryResults } from '../../utilities/gc/execSql';

type Params = {
  results: QueryResults | QueryResults[] | undefined;
};

const renderErrorTable = (result: QueryResults) => {
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

const renderTable = (result: QueryResults) => {
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
    _.zip(result.cols, row).forEach(arr => {
      const [k, v] = arr;
      let actualValue = v;
      if (typeof v === 'object') {
        actualValue = JSON.stringify(v);
      }
      // @ts-expect-error typing is hard
      res[k] = actualValue;
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

  return (
    <div>
      <Heading level="h4" children={result.original_query} />
      <Table
        columns={columns}
        dataSource={data}
        rowKey={columns[0].key}
        showHeader
        bordered
        size="small"
        scroll={{
          x: 'max-content',
        }}
        footer={() => <div className="text-xs font-bold">{result.duration} ms</div>}
      />
    </div>
  );
};

const renderTabs = ({ results }: Params) => {
  if (!results) {
    return null;
  }
  let idx = 0;
  const tabs = (results as QueryResults[]).map(o => {
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
    ret = renderTabs({ results });
  } else if (results) {
    ret = renderTable(results);
  }
  return <div className="max-w-screen-xl">{ret}</div>;
}

export default SQLResultsTable;
