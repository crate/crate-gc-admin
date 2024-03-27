import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import prettyBytes from 'pretty-bytes';
import StatusLight from '../../components/StatusLight';
import { formatHumanReadable } from '../../utils/numbers';
import { useGetShards, useGetTables, useGetAllocations } from '../../hooks/swrHooks';
import {
  tablesWithMissingPrimaryReplicas,
  tablesWithUnassignedShards,
} from '../../utils/statusChecks';
import { TableListEntry } from '../../types/cratedb';

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
      return <span className="text-xs uppercase text-white">system</span>;
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
        <div className="bg-neutral-400 py-8 text-center text-neutral-800">
          No tables found
        </div>
      );
    }

    return output.map(schema => (
      <div key={schema.name}>
        <div
          className="group flex cursor-pointer justify-between border-b border-l-4 border-b-[#0083a3]/50 border-l-[#0083a3] px-2 py-2.5 hover:border-l-[#00728f] hover:bg-[#0083a3]"
          onClick={() => expandCollapseSingle(schema.name)}
        >
          <div className="flex items-center gap-2 text-white">
            {expandedSchemas?.includes(schema.name) ? (
              <CaretDownOutlined className="size-3 opacity-40 group-hover:opacity-100" />
            ) : (
              <CaretRightOutlined className="size-3 opacity-40 group-hover:opacity-100" />
            )}
            <div className="flex gap-1">
              <span>{schema.name}</span>
              <span className="ml-1 min-w-6 rounded-xl bg-[#00627a] px-1 py-0.5 text-center text-xs opacity-60 group-hover:opacity-100">
                {schema.tables?.length}
              </span>
            </div>
          </div>
          <div className="opacity-80 group-hover:opacity-100">
            {renderSchemaBadge(schema.name)}
          </div>
        </div>
        {expandedSchemas?.includes(schema.name) && (
          <div className="bg-[#005266]">
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
        className="group cursor-pointer border-b border-l-4 border-b-white/10 border-l-[#004152] py-2 pl-8 pr-2 hover:border-b-white/20 hover:border-l-[#00313d] hover:bg-[#004152]"
        onClick={() => setActiveTable(table)}
        key={table.table_name}
      >
        <div className="flex items-center justify-between text-white/80 group-hover:text-white">
          <span>{table.table_name}</span>
          {renderTableBadge(table)}
        </div>
        {size && (
          <>
            <div className="text-xs text-white/80 group-hover:text-white">
              {formatHumanReadable(size.records)}{' '}
              {size.records !== 1 ? 'Records' : 'Record'} ({prettyBytes(size.bytes)})
            </div>
            <div className="text-xs text-white/80 group-hover:text-white">
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

  if (schemas.length === 0) {
    return <Spin />;
  }
  return (
    <div className="flex h-full select-none flex-col bg-[#d3d3d3]">
      <div className="flex h-14 bg-white md:border-r md:border-r-neutral-200">
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
        <div
          className="group flex basis-[40px] cursor-pointer justify-center px-2 hover:bg-[#f8f8f8]"
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
        <div className="bg-[#0093b8] drop-shadow-xl">{renderSchemaList()}</div>
      </div>
    </div>
  );
}

export default TableList;
