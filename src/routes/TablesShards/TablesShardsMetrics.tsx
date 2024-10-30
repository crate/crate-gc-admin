import { useMemo, useState } from 'react';
import {
  DataTable,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
} from 'components';
import { Checkbox } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTablesShards, TableShard } from 'src/swr/jwt';
import { ColumnDef } from '@tanstack/react-table';
import { Loader } from 'components';
import { fromBytes } from 'utils/bytes';
import useJWTManagerStore from 'state/jwtManager';
import { TABLE_HEALTH_STATES, TableHealthState } from 'constants/database';

const TABLE_HEALTH_DESCRIPTIONS = {
  GREEN: 'Good',
  YELLOW: 'Warning',
  RED: 'Critical',
};

function TablesShardsMetrics() {
  const clusterId = useJWTManagerStore(state => state.clusterId);
  const { data: tablesShards } = useTablesShards(clusterId);

  const [healthFilter, setHealthFilter] = useState({
    [TABLE_HEALTH_STATES.GREEN]: true,
    [TABLE_HEALTH_STATES.YELLOW]: true,
    [TABLE_HEALTH_STATES.RED]: true,
  });

  const rowCountFormat = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const summaryData = useMemo(() => {
    if (tablesShards) {
      const statuses = new Set(tablesShards.map(row => row.health));
      let status: TableHealthState = TABLE_HEALTH_STATES.GREEN;
      if (statuses.has(TABLE_HEALTH_STATES.YELLOW)) {
        status = TABLE_HEALTH_STATES.YELLOW;
      }
      if (statuses.has(TABLE_HEALTH_STATES.RED)) {
        status = TABLE_HEALTH_STATES.RED;
      }

      const tablesExcludingPartitioned = tablesShards.filter(
        row => !row.partitionName,
      );

      return {
        health: status,
        startedShards: tablesExcludingPartitioned.reduce(
          (prev, next) => prev + next.startedShards,
          0,
        ),
        missingShards: tablesExcludingPartitioned.reduce(
          (prev, next) => prev + next.missingShards,
          0,
        ),
        unassignedShards: tablesExcludingPartitioned.reduce(
          (prev, next) => prev + next.unassignedShards,
          0,
        ),
        totalRecords: tablesExcludingPartitioned.reduce(
          (prev, next) => prev + next.numberOfRecords,
          0,
        ),
        totalSizeInBytes: tablesExcludingPartitioned.reduce(
          (prev, next) => prev + next.sizeInBytes,
          0,
        ),
      };
    }
  }, [tablesShards]);

  const columns: ColumnDef<TableShard>[] = useMemo(
    () => [
      {
        accessorKey: 'schemaName',
        header: 'Schema',
        cell: ({ cell }) => (cell.row.original.partitionName ? '' : cell.getValue()),
      },
      {
        accessorKey: 'tableName',
        header: 'Table / Partition name',
        cell: ({ cell }) =>
          cell.row.original.partitionName ? (
            <div className="pl-4 text-neutral-500">
              {cell.row.original.partitionName}
            </div>
          ) : (
            cell.getValue()
          ),
      },
      {
        accessorKey: 'health',
        header: 'Health',
        cell: ({ cell }) => {
          // hardcoded to ensure tailwind picks up the values :/
          switch (cell.getValue()) {
            case 'RED':
              return (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="h-2 w-2 rounded-full bg-red-600" />
                  <span>{TABLE_HEALTH_DESCRIPTIONS.RED}</span>
                </div>
              );
            case 'YELLOW':
              return (
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="h-2 w-2 rounded-full bg-orange-600" />
                  <span>{TABLE_HEALTH_DESCRIPTIONS.YELLOW}</span>
                </div>
              );
            default:
              return (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <span>{TABLE_HEALTH_DESCRIPTIONS.GREEN}</span>
                </div>
              );
          }
        },
      },
      { accessorKey: 'numberOfShards', header: 'Shards' },
      { accessorKey: 'numberOfReplicas', header: 'Replicas' },
      { accessorKey: 'startedShards', header: 'Started' },
      {
        accessorKey: 'missingShards',
        header: 'Missing',
        cell: ({ cell }) => {
          const value = cell.getValue();
          return value === 0 ? <div className="text-neutral-400">0</div> : value;
        },
      },
      {
        accessorKey: 'unassignedShards',
        header: 'Underreplicated',
        cell: ({ cell }) => {
          const value = cell.getValue();
          return value === 0 ? <div className="text-neutral-400">0</div> : value;
        },
      },
      {
        accessorKey: 'numberOfRecords',
        header: 'Total records',
        cell: ({ cell }) => rowCountFormat.format(cell.getValue() as number),
      },
      {
        accessorKey: 'sizeInBytes',
        header: 'Size',
        cell: ({ cell }) => (
          <span className="whitespace-nowrap">
            {fromBytes(cell.getValue() as number)}
          </span>
        ),
      },
    ],
    [],
  );

  const drawFilterCheckbox = (label: React.ReactNode, status: TableHealthState) => (
    <label className="z-10 flex cursor-pointer items-center gap-1.5 whitespace-nowrap">
      <Checkbox
        checked={healthFilter[status]}
        onChange={() => {
          const newFilter = { ...healthFilter, [status]: !healthFilter[status] };
          if (Object.values(newFilter).filter(bool => bool).length > 0) {
            setHealthFilter({ ...healthFilter, [status]: !healthFilter[status] });
          }
        }}
        data-testid={`filter-checkbox-${status}`}
      />
      <span className="opacity-70">{label}</span>
    </label>
  );

  const drawStatistic = (label: string, value: string | number, testId: string) => (
    <div>
      <div className="text-sm leading-snug text-neutral-400">{label}</div>
      <div className="text-lg leading-snug" data-testid={`statistic-${testId}`}>
        {value}
      </div>
    </div>
  );

  if (!tablesShards || !summaryData) {
    return <Loader />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* statistics block */}
      <div className="grid select-none grid-cols-3 gap-2 py-4">
        {drawStatistic(
          'Health',
          TABLE_HEALTH_DESCRIPTIONS[summaryData.health],
          'health',
        )}
        {drawStatistic(
          'Total records',
          rowCountFormat.format(summaryData.totalRecords),
          'totalRecords',
        )}
        {drawStatistic(
          'Total size',
          fromBytes(summaryData.totalSizeInBytes),
          'totalSize',
        )}
        {drawStatistic(
          'Started shards',
          summaryData.startedShards.toString(),
          'startedShards',
        )}
        {drawStatistic(
          'Missing shards',
          summaryData.missingShards.toString(),
          'missingShards',
        )}
        {drawStatistic(
          'Underreplicated shards',
          summaryData.unassignedShards.toString(),
          'underreplicatedShards',
        )}
      </div>

      {/* table */}
      <DataTable
        columns={columns}
        data={tablesShards.filter(row => healthFilter[row.health])}
        className="relative w-full overflow-auto"
        disablePagination
        stickyHeader
        customTableHeader={
          <Table.Header className="sticky top-0 z-10 bg-white">
            <Table.RowHeader className="!border-0">
              <Table.Head className="align-bottom" rowSpan={2}>
                Schema
              </Table.Head>
              <Table.Head className="align-bottom" rowSpan={2}>
                Table / Partition name
              </Table.Head>
              <Table.Head className="align-bottom" rowSpan={2}>
                <div className="flex items-center gap-2">
                  <div>Health</div>
                  <Popover>
                    <PopoverTrigger>
                      <FilterOutlined
                        className="opacity-80 hover:opacity-100"
                        data-testid="health-filter"
                      />
                    </PopoverTrigger>
                    <PopoverContent align="end" className="select-none space-y-1">
                      {drawFilterCheckbox(
                        <span>{TABLE_HEALTH_DESCRIPTIONS.GREEN}</span>,
                        TABLE_HEALTH_STATES.GREEN,
                      )}
                      {drawFilterCheckbox(
                        <span>{TABLE_HEALTH_DESCRIPTIONS.YELLOW}</span>,
                        TABLE_HEALTH_STATES.YELLOW,
                      )}
                      {drawFilterCheckbox(
                        <span>{TABLE_HEALTH_DESCRIPTIONS.RED}</span>,
                        TABLE_HEALTH_STATES.RED,
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </Table.Head>
              <Table.Head className="h-8 align-bottom" colSpan={2}>
                Configuration
              </Table.Head>
              <Table.Head className="h-8 align-bottom" colSpan={3}>
                Shards
              </Table.Head>
              <Table.Head className="align-bottom" rowSpan={2}>
                Total records
              </Table.Head>
              <Table.Head className="align-bottom" rowSpan={2}>
                Size
              </Table.Head>
            </Table.RowHeader>
            <Table.RowHeader className="!border-0">
              <Table.Head className="h-8 align-bottom">Shards</Table.Head>
              <Table.Head className="h-8 align-bottom">Replicas</Table.Head>
              <Table.Head className="h-8 align-bottom">Started</Table.Head>
              <Table.Head className="h-8 align-bottom">Missing</Table.Head>
              <Table.Head className="h-8 align-bottom">Underreplicated</Table.Head>
            </Table.RowHeader>
            {/* fake bottom border to fix the problem where table borders in a sticky header when border-collapse: collapse are not sticky */}
            <tr className="!border-b-0">
              <th className="h-[1px] !border-b-0 bg-neutral-200 p-0" colSpan={10} />
            </tr>
          </Table.Header>
        }
      />
    </div>
  );
}

export default TablesShardsMetrics;
