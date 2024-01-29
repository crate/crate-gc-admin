import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import { Table, Tabs, Tag } from 'antd';
import Button from '../../components/Button';
import Heading from '../../components/Heading';
import { useGCContext } from '../../contexts';
import routes from '../../constants/routes';
import { format as formatSQL } from 'sql-formatter';
import {
  getTableInformation,
  showCreateTable,
  TableInfo,
  TableListEntry,
} from '../../utils/queries';

function TableDetail({
  activeTable,
  setActiveTable,
  systemSchemas,
}: {
  activeTable: TableListEntry | undefined;
  setActiveTable: (table: TableListEntry | undefined) => void;
  systemSchemas: string[];
}) {
  const { sqlUrl } = useGCContext();
  const [activeTableInfo, setActiveTableInfo] = useState<TableInfo[] | undefined>();
  const [createTableSQL, setCreateTableSQL] = useState<string | undefined>();

  useEffect(() => {
    if (!activeTable) {
      setActiveTableInfo(undefined);
      return;
    }

    getTableInformation(
      sqlUrl,
      activeTable.table_schema,
      activeTable.table_name,
    ).then(setActiveTableInfo);

    setCreateTableSQL(undefined);
    if (!systemSchemas.includes(activeTable.table_schema)) {
      showCreateTable(sqlUrl, activeTable.table_schema, activeTable.table_name).then(
        res => setCreateTableSQL(res ? formatSQL(res) : undefined),
      );
    }
  }, [activeTable]);

  const columns = [
    {
      title: '#',
      key: 'ordinal_position',
      dataIndex: 'ordinal_position',
      width: '5%',
    },
    {
      title: 'Name',
      key: 'column_name',
      dataIndex: 'column_name',
      width: '25%',
      render: (_: string, record: TableInfo) => {
        return (
          <span>
            {record.column_name}{' '}
            {record.constraint_type ? <Tag>{record.constraint_type}</Tag> : null}
          </span>
        );
      },
    },
    {
      title: 'Type',
      key: 'data_type',
      dataIndex: 'data_type',
      width: '70%',
      render: (dataType: string) => {
        return <span>{dataType.toUpperCase()}</span>;
      },
    },
  ];

  const tabs = [
    {
      key: 'columns',
      label: 'Columns',
      children: (
        <Table
          columns={columns}
          dataSource={activeTableInfo}
          rowKey="ordinal_position"
          pagination={false}
        />
      ),
    },
  ];

  if (createTableSQL) {
    tabs.push({
      key: 'SQL',
      label: 'SQL',
      children: (
        <div className="">
          <pre>{createTableSQL}</pre>
        </div>
      ),
    });
  }

  return (
    <div>
      {activeTable && (
        <>
          <div
            className="block text-crate-blue md:hidden"
            onClick={() => setActiveTable(undefined)}
          >
            <LeftOutlined className="text-xs" /> Back to list
          </div>
          <Heading level="h2">
            {activeTable.table_schema}.{activeTable.table_name}
          </Heading>
          <Tabs defaultActiveKey="columns" items={tabs} />
          <div className="mt-4">
            <Link
              to={{
                pathname: routes.find(r => r.key == 'sql')?.path,
                search: `?q=SELECT * FROM "${activeTable.table_schema}"."${activeTable.table_name}" LIMIT 100;`,
              }}
            >
              <Button kind="primary">Query</Button>
            </Link>
          </div>
        </>
      )}
      {!activeTable && <div>No table selected</div>}
    </div>
  );
}

export default TableDetail;
