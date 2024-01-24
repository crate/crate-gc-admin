import { useEffect, useState } from 'react';
import { Button, Heading, StatusLight } from '@crate.io/crate-ui-components';
import { Collapse, Input, List, Spin, Table, Tabs, Tag } from 'antd';
import { useGCContext } from '../../contexts';
import { format as formatSQL } from 'sql-formatter';
import {
  getTableInformation,
  showCreateTable,
  TableInfo,
  TableListEntry,
} from '../../utils/queries';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes';
import prettyBytes from 'pretty-bytes';
import {
  useGetShards,
  useGetTables,
  useGetAllocations,
} from '../../hooks/swrHooks.ts';
import {
  tablesWithMissingPrimaryReplicas,
  tablesWithUnassignedShards,
} from '../../utils/statusChecks.ts';
import { formatHumanReadable } from '../../utils/numbers.ts';

function Tables() {
  const systemSchemas = ['information_schema', 'sys', 'pg_catalog', 'gc'];
  const { sqlUrl } = useGCContext();

  const [schemas, setSchemas] = useState<string[] | undefined>();
  const [activeTable, setActiveTable] = useState<TableListEntry | undefined>();
  const [activeTableInfo, setActiveTableInfo] = useState<TableInfo[] | undefined>();
  const [createTableSQL, setCreateTableSQL] = useState<string | undefined>();
  const [filter, setFilter] = useState<string>('');

  const { data: tables } = useGetTables(sqlUrl);
  const { data: shards } = useGetShards(sqlUrl);
  const { data: allocations } = useGetAllocations(sqlUrl);
  const missingReplicasTables = tablesWithMissingPrimaryReplicas(allocations);
  const unassignedShardTables = tablesWithUnassignedShards(allocations);

  useEffect(() => {
    if (!tables) {
      return;
    }

    setSchemas(Array.from(new Set(tables?.map(t => t.table_schema))));
  }, [tables]);

  useEffect(() => {
    setCreateTableSQL(undefined);
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

  const tableBadge = (table: TableListEntry) => {
    if (
      missingReplicasTables.filter(
        t => t.schema_name == table.table_schema && t.table_name == table.table_name,
      ).length > 0
    ) {
      return (
        <StatusLight
          color={StatusLight.colors.RED}
          message=""
          tooltip="Table has missing data"
        />
      );
    }
    if (
      unassignedShardTables.filter(
        s => s.schema_name == table.table_schema && s.table_name == table.table_name,
      ).length > 0
    ) {
      return (
        <StatusLight
          color={StatusLight.colors.YELLOW}
          message=""
          tooltip="Table is underreplicated"
        />
      );
    }
    return <StatusLight color={StatusLight.colors.GREEN} message="" />;
  };

  const getTableList = (schema: string) => {
    const schemaTables = tables
      ?.filter(t => t.table_schema == schema)
      .filter(t => t.table_name.match(filter));

    if (!schemaTables || schemaTables.length == 0) {
      return null;
    }

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
              onClick={() => {
                setActiveTableInfo([]);
                setActiveTable(item);
              }}
            >
              <div className="flex flex-row justify-between w-60">
                <div className="grid grid-cols-1">
                  <div className="font-bold break-words">{item.table_name}</div>
                  {size && (
                    <div className="text-xs">
                      {formatHumanReadable(size.records)} Records (
                      {prettyBytes(size.bytes)})
                    </div>
                  )}
                  {item.number_of_replicas && (
                    <div className="text-xs">
                      {item.number_of_shards} Shards / {item.number_of_replicas}{' '}
                      Replicas
                    </div>
                  )}
                </div>
                <div className="ml-8">{tableBadge(item)}</div>
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  const schemaBadge = (schema: string) => {
    if (systemSchemas.includes(schema)) {
      return <Tag>system</Tag>;
    }
    if (missingReplicasTables.filter(t => t.schema_name == schema).length > 0) {
      return (
        <StatusLight
          color={StatusLight.colors.RED}
          message=""
          tooltip="Has tables with missing data"
        />
      );
    }
    if (unassignedShardTables.filter(s => s.schema_name == schema).length > 0) {
      return (
        <StatusLight
          color={StatusLight.colors.YELLOW}
          message=""
          tooltip="Has underreplicated tables"
        />
      );
    }
    return <StatusLight color={StatusLight.colors.GREEN} message="" />;
  };

  const constraintBadge = (constraint: string | null) => {
    if (constraint) {
      return <Tag>{constraint}</Tag>;
    }
    return null;
  };

  const getSchemasSection = () => {
    const items = schemas
      ?.map(s => {
        return {
          key: s,
          label: (
            <div className="flex flex-row justify-between">
              <div>{s}</div>
              <div className="ml-4">{schemaBadge(s)}</div>
            </div>
          ),
          children: getTableList(s),
        };
      })
      .filter(i => i);

    return tables ? (
      <Collapse defaultActiveKey={tables[0].table_schema}>
        {items
          ?.filter(i => i.children)
          .map(item => {
            return (
              <Collapse.Panel header={item.label} key={item.key}>
                {item.children}
              </Collapse.Panel>
            );
          })}
      </Collapse>
    ) : (
      <Spin />
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
        render: (_: string, record: TableInfo) => {
          return <span>{record.data_type.toUpperCase()}</span>;
        },
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
        <div className="border w-1/5 p-4 min-w-80 h-[87vh] overflow-y-scroll">
          <div className="mb-4">
            <Input placeholder="Filter" onChange={v => setFilter(v.target.value)} />
          </div>
          {getSchemasSection()}
        </div>
        <div className="border w-4/5 p-4">{getActiveTableSection()}</div>
      </div>
    </>
  );
}

export default Tables;
