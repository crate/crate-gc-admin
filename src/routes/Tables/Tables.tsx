import React, { useEffect, useState } from 'react';
import { Button, Heading } from '@crate.io/crate-ui-components';
import { Collapse, List, Table, Tabs, Tag } from 'antd';
import { useGCContext } from '../../utils/context';
import { format as formatSQL } from 'sql-formatter';
import {
  getSchemas,
  getShards,
  getTableInformation,
  getTables,
  ShardInfo,
  showCreateTable,
  TableInfo,
  TableListEntry,
} from '../../utils/queries';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes';
import prettyBytes from 'pretty-bytes';

function Tables() {
  const systemSchemas = ['information_schema', 'sys', 'pg_catalog'];
  const { sqlUrl } = useGCContext();

  const [schemas, setSchemas] = useState<string[] | undefined>();
  const [tables, setTables] = useState<TableListEntry[] | undefined>();
  const [shards, setShards] = useState<ShardInfo[] | undefined>();
  const [activeTable, setActiveTable] = useState<TableListEntry | undefined>();
  const [activeTableInfo, setActiveTableInfo] = useState<TableInfo[] | undefined>();
  const [createTableSQL, setCreateTableSQL] = useState<string | undefined>();

  // TODO: SWR / Re-fetch
  useEffect(() => {
    if (!sqlUrl) {
      return;
    }

    getSchemas(sqlUrl).then(setSchemas);
    getTables(sqlUrl).then(setTables);
    getShards(sqlUrl).then(setShards);
  }, [sqlUrl]);

  useEffect(() => {
    if (!activeTable) {
      return;
    }

    getTableInformation(
      sqlUrl,
      activeTable.table_schema,
      activeTable.table_name,
    ).then(setActiveTableInfo);

    if (!systemSchemas.includes(activeTable.table_schema)) {
      showCreateTable(sqlUrl, activeTable.table_schema, activeTable.table_name).then(
        res => setCreateTableSQL(res ? formatSQL(res) : undefined),
      );
    }
  }, [activeTable]);

  const getTableSize = (schema: string, table: string) => {
    const tableSizeInfo = shards?.filter(
      s => s.schema_name == schema && s.table_name == table && s.primary,
    );
    if (!tableSizeInfo || tableSizeInfo.length == 0) {
      return null;
    }

    return tableSizeInfo
      .map(rec => {
        return {
          records: rec.total_docs,
          bytes: rec.size_bytes,
        };
      })
      .reduce((prev, current) => {
        return {
          records: prev.records + current.records,
          bytes: prev.bytes + current.bytes,
        };
      });
  };

  const getTableList = (schema: string) => {
    const schemaTables = tables?.filter(t => t.table_schema == schema);

    return (
      <List
        locale={{ emptyText: 'No tables in this schema' }}
        bordered
        dataSource={schemaTables}
        renderItem={item => {
          const size = getTableSize(item.table_schema, item.table_name);
          return (
            <List.Item
              className="cursor-pointer"
              onClick={() => setActiveTable(item)}
            >
              <div className="grid grid-cols-1">
                <div className="font-bold">{item.table_name}</div>
                {size && (
                  <div className="text-xs">
                    {size.records} Records ({prettyBytes(size.bytes)})
                  </div>
                )}
                {item.number_of_replicas && (
                  <div className="text-xs">
                    {item.number_of_shards} Shards / {item.number_of_replicas}{' '}
                    Replicas
                  </div>
                )}
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  const systemBadge = (schema: string) => {
    if (systemSchemas.includes(schema)) {
      // FIXME: use constant from crate-ui-components
      return <Tag color="#00A6D1">system</Tag>;
    }
    return null;
  };

  const constraintBadge = (constraint: string | null) => {
    if (constraint) {
      // FIXME: use constant from crate-ui-components
      return <Tag color="#00A6D1">{constraint}</Tag>;
    }
    return null;
  };

  const getSchemasSection = () => {
    const items = schemas?.map(s => {
      return {
        key: s,
        label: (
          <span>
            {s} {systemBadge(s)}
          </span>
        ),
        children: getTableList(s),
      };
    });

    return (
      <Collapse defaultActiveKey={activeTable?.table_schema || 'doc'}>
        {items?.map(item => {
          return (
            <Collapse.Panel header={item.label} key={item.key}>
              {item.children}
            </Collapse.Panel>
          );
        })}
      </Collapse>
    );
  };

  const getActiveTableSection = () => {
    if (!activeTable) {
      return null;
    }
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
              {record.column_name} {constraintBadge(record.constraint_type)}
            </span>
          );
        },
      },
      {
        title: 'Type',
        key: 'data_type',
        dataIndex: 'data_type',
        width: '70%',
      },
    ];

    const tabs = [
      {
        key: `Columns`,
        label: `Columns`,
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
        <Heading level="h2">
          Table: {activeTable?.table_schema}.{activeTable?.table_name}
        </Heading>
        <Tabs defaultActiveKey="Columns" items={tabs} />
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
      </div>
    );
  };

  return (
    <>
      <Heading level="h1">Tables</Heading>
      <div className="flex">
        <div className="border w-1/5 p-4 min-w-fit h-[87vh] overflow-y-scroll">
          {getSchemasSection()}
        </div>
        <div className="border w-4/5 p-4">{getActiveTableSection()}</div>
      </div>
    </>
  );
}

export default Tables;
