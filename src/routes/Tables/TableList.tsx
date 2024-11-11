import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import prettyBytes from 'pretty-bytes';
import { StatusLight } from 'components';
import { formatHumanReadable } from 'utils/numbers';
import { useGetShards, useGetTables, useGetAllocations } from 'hooks/swrHooks';
import {
  tablesWithMissingPrimaryReplicas,
  tablesWithUnassignedShards,
} from 'utils/statusChecks';
import { TableListEntry } from 'types/cratedb';

function TableList({
  setActiveTable,
  systemSchemas,
}: {
  setActiveTable: (table: TableListEntry | undefined) => void;
  systemSchemas: string[];
}) {
  const [expandedSchemas, setExpandedSchemas] = useState<string[] | undefined>();
  const [schemas, setSchemas] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [filterFocused, setFilterFocused] = useState<boolean>(false);
  const { data: tables } = useGetTables();
  const { data: shards } = useGetShards();
  const { data: allocations } = useGetAllocations();
  const missingReplicasTables = tablesWithMissingPrimaryReplicas(allocations);
  const unassignedShardTables = tablesWithUnassignedShards(allocations);

  // create a list of schema names
  useEffect(() => {
    if (!tables) {
      return;
    }

    const schemaNames: string[] = Array.from(
      new Set(tables?.map(t => t.table_schema)),
    );
    setSchemas(schemaNames);
    if (expandedSchemas === undefined) {
      setExpandedSchemas([schemaNames[0]]);
    }
  }, [tables]);

  const expandCollapseAll = () => {
    if (expandedSchemas?.length === schemas.length) {
      setExpandedSchemas([]);
    } else {
      setExpandedSchemas(schemas);
    }
  };

  const expandCollapseSingle = (schema: string): void => {
    if (expandedSchemas?.includes(schema)) {
      setExpandedSchemas(expandedSchemas?.filter(s => s !== schema));
    } else {
      setExpandedSchemas([...(expandedSchemas ?? []), schema]);
    }
  };

  const getTableSize = (table: TableListEntry) => {
    const tableShards = shards?.filter(
      shard =>
        shard.schema_name == table.table_schema &&
        shard.table_name == table.table_name &&
        shard.primary,
    );
    if (!tableShards || tableShards.length == 0) {
      return null;
    }

    return tableShards
      .map(shard => {
        return {
          records: shard.total_docs,
          bytes: shard.size_bytes,
        };
      })
      .reduce((prev, current) => {
        return {
          records: prev.records + current.records,
          bytes: prev.bytes + current.bytes,
        };
      });
  };

  const renderSchemaBadge = (schema: string) => {
    if (systemSchemas.includes(schema)) {
      return <span className="text-[10px] uppercase text-neutral-700">system</span>;
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

  const renderSchemaList = () => {
    const output = schemas
      ?.map(schema => ({
        name: schema,
        tables: tables
          ?.filter(
            table =>
              table.table_schema === schema &&
              table.table_name.toLowerCase().includes(filter.toLowerCase()),
          )
          .map(table => table),
      }))
      .filter(schema => schema.tables && schema.tables.length > 0);

    if (output.length === 0) {
      return (
        <div className="bg-neutral-400 py-8 text-center text-neutral-600">
          No tables found
        </div>
      );
    }

    return output.map(schema => (
      <div key={schema.name}>
        <div
          className="group flex cursor-pointer justify-between border-l-4 border-t border-l-transparent border-t-crate-border-mid/40 bg-white px-2 py-2.5 text-neutral-400 hover:border-l-crate-blue hover:bg-crate-blue-hover"
          onClick={() => expandCollapseSingle(schema.name)}
        >
          <div className="flex items-center gap-2 text-neutral-700">
            {expandedSchemas?.includes(schema.name) ? (
              <CaretDownOutlined className="size-3 opacity-80 group-hover:opacity-100" />
            ) : (
              <CaretRightOutlined className="size-3 opacity-80 group-hover:opacity-100" />
            )}
            <div className="flex gap-1">
              <span>{schema.name}</span>
              <span className="group-hover ml-1 h-5 min-w-5 rounded bg-crate-blue px-1 text-center text-[12px] leading-5 text-white">
                {schema.tables?.length}
              </span>
            </div>
          </div>
          <div className="opacity-80 group-hover:opacity-100">
            {renderSchemaBadge(schema.name)}
          </div>
        </div>
        {expandedSchemas?.includes(schema.name) && (
          <div className="bg-crate-body-background">
            {schema.tables?.map(table => renderTable(table))}
          </div>
        )}
      </div>
    ));
  };

  const renderTable = (table: TableListEntry) => {
    const size = getTableSize(table);

    return (
      <div
        className="group cursor-pointer border-l-4 border-t border-l-crate-body-background border-t-crate-border-mid/40 bg-white py-1.5 pl-7 pr-2 hover:border-l-crate-blue hover:bg-crate-blue-hover"
        onClick={() => setActiveTable(table)}
        key={table.table_name}
      >
        <div className="group-hover:text-text-neutral-800 flex items-center justify-between text-neutral-700">
          <span>{table.table_name}</span>
          {renderTableBadge(table)}
        </div>
        {size && (
          <>
            <div className="text-xs text-neutral-600 group-hover:text-neutral-700">
              {formatHumanReadable(size.records)}{' '}
              {size.records !== 1 ? 'Records' : 'Record'} ({prettyBytes(size.bytes)})
            </div>
            <div className="text-xs text-neutral-600 group-hover:text-neutral-700">
              {table.number_of_shards} shards / {table.number_of_replicas} replicas
            </div>
          </>
        )}
      </div>
    );
  };

  const renderTableBadge = (table: TableListEntry) => {
    if (
      missingReplicasTables.filter(
        t => t.schema_name == table.table_schema && t.table_name == table.table_name,
      ).length > 0
    ) {
      return (
        <div className="opacity-80 group-hover:opacity-100">
          <StatusLight
            color={StatusLight.colors.RED}
            message=""
            tooltip="Table has missing data"
          />
        </div>
      );
    }

    if (
      unassignedShardTables.filter(
        s => s.schema_name == table.table_schema && s.table_name == table.table_name,
      ).length > 0
    ) {
      return (
        <div className="opacity-80 group-hover:opacity-100">
          <StatusLight
            color={StatusLight.colors.YELLOW}
            message=""
            tooltip="Table is underreplicated"
          />
        </div>
      );
    }

    return (
      <div className="opacity-80 group-hover:opacity-100">
        <StatusLight color={StatusLight.colors.GREEN} message="" />
      </div>
    );
  };

  if (schemas.length === 0) {
    return <Spin />;
  }
  return (
    <div className="flex h-full select-none flex-col border-r bg-crate-body-background">
      <div className="flex h-14 bg-white md:border-r md:border-r-neutral-200">
        {/* filter input box */}
        <div className="basis-full border-r border-r-neutral-200 p-2">
          <div
            className={`flex h-full items-center gap-2 rounded-lg border-2 px-2 ${filterFocused ? 'border-crate-blue' : 'border-neutral-200'}`}
          >
            <input
              placeholder="Filter tables"
              type="text"
              className="basis-full outline-none"
              onChange={event => setFilter(event.target.value)}
              onFocus={() => setFilterFocused(true)}
              onBlur={() => setFilterFocused(false)}
              value={filter}
            />
            <button
              className="aspect-square size-5 rounded-full bg-neutral-300 text-xs text-white outline-none hover:bg-crate-blue"
              onClick={() => setFilter('')}
            >
              <CloseOutlined />
            </button>
          </div>
        </div>

        {/* expand/collapse all */}
        <div
          className="group flex basis-[40px] cursor-pointer justify-center px-2 hover:bg-crate-blue-hover"
          onClick={() => expandCollapseAll()}
        >
          {(expandedSchemas?.length || 0) < schemas.length ? (
            <CaretRightOutlined className="opacity-60 group-hover:opacity-100" />
          ) : (
            <CaretDownOutlined className="opacity-60 group-hover:opacity-100" />
          )}
        </div>
      </div>
      <div className="basis-full overflow-y-auto">
        <div className="border-b border-b-crate-border-mid/40">
          {renderSchemaList()}
        </div>
      </div>
    </div>
  );
}

export default TableList;
