import { ColumnDef } from '@tanstack/react-table';
import { formatNum, getNodeStatus } from 'utils';
import prettyBytes from 'pretty-bytes';
import {
  Chip,
  DataTable,
  Loader,
  StatusLight,
  Text,
  VerticalProgress,
} from 'components';
import { useClusterInfo, useClusterNodeStatus, useShards } from 'src/swr/jwt';
import useClusterHealthStore from 'src/state/clusterHealth';
import useJWTManagerStore from 'state/jwtManager';
import { NodeStatusInfo } from 'types/cratedb';

const MIN_COL_WIDTH = '170px';

function NodesMetrics() {
  const clusterId = useJWTManagerStore(state => state.clusterId);
  const isLocalConnection = useJWTManagerStore(state => state.isLocalConnection);
  const { clusterHealth } = useClusterHealthStore();

  const { data: nodes } = useClusterNodeStatus(clusterId);
  const { data: cluster } = useClusterInfo(clusterId);
  const { data: shards } = useShards(clusterId);

  const columns: ColumnDef<NodeStatusInfo>[] = [
    {
      header: 'Node',
      meta: {
        minWidth: '140px',
      },
      cell: ({ row }) => {
        const node = row.original;
        return renderNode(node);
      },
      enableSorting: true,
      accessorFn: (nodeStatusInfo: NodeStatusInfo) => {
        return nodeStatusInfo.name;
      },
    },
    {
      header: 'Load',
      meta: {
        minWidth: MIN_COL_WIDTH,
      },
      cell: ({ row }) => {
        const node = row.original;
        return renderLoad(node);
      },
    },
    {
      header: 'Heap Usage',
      meta: {
        minWidth: MIN_COL_WIDTH,
      },
      cell: ({ row }) => {
        const node = row.original;
        return renderHeap(node);
      },
    },
    {
      header: 'Disk Usage',
      meta: {
        minWidth: MIN_COL_WIDTH,
      },
      cell: ({ row }) => {
        const node = row.original;
        return renderDisk(node);
      },
    },
    {
      header: 'Disk Operations',
      meta: {
        minWidth: MIN_COL_WIDTH,
      },
      cell: ({ row }) => {
        const node = row.original;
        return renderFS(node);
      },
    },
    {
      header: 'Shards',
      meta: {
        minWidth: MIN_COL_WIDTH,
      },
      cell: ({ row }) => {
        const node = row.original;
        return renderShards(node);
      },
    },
  ];

  const renderNode = (node: NodeStatusInfo) => {
    const isMaster = cluster?.master === node.id;
    const attributes = Object.keys(node.attributes);

    return (
      <div className="flex justify-between gap-1">
        <div className="flex flex-col align-top">
          <div className="flex items-center gap-2">
            <Text className="font-bold">{node.name}</Text>
            <div className="flex">
              {isMaster && (
                <StatusLight
                  color={StatusLight.colors.BLUE}
                  tooltip={'Master Node'}
                  testId="master-node"
                />
              )}
              {renderNodeStatus(node)}
            </div>
          </div>
          {isLocalConnection && <Text>{node.hostname}</Text>}
          <Text>v{node.version.number}</Text>
          <Text>
            {node.os_info.available_processors} CPU Cores |{' '}
            {prettyBytes(node.mem.free + node.mem.used, {
              maximumFractionDigits: 0,
            })}{' '}
            RAM
          </Text>
        </div>
        <div className="flex flex-col gap-1">
          {attributes.sort().map(el => {
            return (
              <Chip className="whitespace-nowrap" key={el} color={Chip.colors.GRAY}>
                {el}: {node.attributes[el]}
              </Chip>
            );
          })}
        </div>
      </div>
    );
  };

  const renderNodeStatus = (node: NodeStatusInfo) => {
    const status = getNodeStatus(node);

    switch (status) {
      case 'UNREACHABLE':
        return (
          <StatusLight
            color={StatusLight.colors.GRAY}
            tooltip={'Unreachable'}
            testId="unreachable-node"
          />
        );
      case 'CRITICAL':
        return (
          <StatusLight
            color={StatusLight.colors.RED}
            tooltip={'Critical'}
            testId="critical-node"
          />
        );
      case 'WARNING':
        return (
          <StatusLight
            color={StatusLight.colors.YELLOW}
            tooltip={'Warning'}
            testId="warning-node"
          />
        );
      case 'GOOD':
        return (
          <StatusLight
            color={StatusLight.colors.GREEN}
            tooltip={'Good'}
            testId="good-node"
          />
        );
    }
  };

  const renderHeap = (node: NodeStatusInfo) => {
    return (
      <div className="flex grid-cols-6 gap-2">
        <div className="min-w-5 p-0.5">
          <VerticalProgress
            max={node.heap.max}
            current={node.heap.used}
            testId="heap-progress"
          />
        </div>
        <div className="col-span-2 font-bold">
          <Text>Used</Text>
          <Text>Free</Text>
          <Text>Size</Text>
        </div>
        <div className="col-span-3">
          <Text>{prettyBytes(node.heap.used)}</Text>
          <Text>{prettyBytes(node.heap.free)}</Text>
          <Text>{prettyBytes(node.heap.max)}</Text>
        </div>
      </div>
    );
  };

  const renderLoad = (node: NodeStatusInfo) => {
    return (
      <div>
        <div className="flex grid-cols-6 gap-2">
          <div className="min-w-5 p-0.5">
            <VerticalProgress
              max={node.os_info.available_processors}
              current={node.load['1']}
              testId="load-progress"
            />
          </div>
          <div className="col-span-2 font-bold">
            <Text>1 min</Text>
            <Text>5 min</Text>
            <Text>15 min</Text>
          </div>
          <div className="col-span-3">
            <Text>{formatNum(node.load['1'])}</Text>
            <Text>{formatNum(node.load['5'])}</Text>
            <Text>{formatNum(node.load['15'])}</Text>
          </div>
        </div>
      </div>
    );
  };

  const renderDisk = (node: NodeStatusInfo) => {
    return (
      <div className="flex grid-cols-6 gap-2">
        <div className="min-w-5 p-0.5">
          <VerticalProgress
            max={node.fs.total.size}
            current={node.fs.total.used}
            testId="disk-progress"
          />
        </div>
        <div className="col-span-2 font-bold">
          <Text>Used</Text>
          <Text>Free</Text>
          <Text>Size</Text>
        </div>
        <div className="col-span-3">
          <Text>{prettyBytes(node.fs.total.used)}</Text>
          <Text>{prettyBytes(node.fs.total.available)}</Text>
          <Text>{prettyBytes(node.fs.total.size)}</Text>
        </div>
      </div>
    );
  };

  const renderFS = (node: NodeStatusInfo) => {
    const stats = clusterHealth[clusterId || '']?.fsStats[node.id];
    if (!stats) {
      return <Loader testId="loading-fs" />;
    }

    return (
      <div className="flex grid-cols-2 gap-4">
        <div className="font-bold">
          <Text>Reads</Text>
          <Text>Writes</Text>
          <Text>Read rate</Text>
          <Text>Write rate</Text>
        </div>
        <div className="col-span-3">
          <Text>{formatNum(stats.iops_read, 0)} iops</Text>
          <Text>{formatNum(stats.iops_write, 0)} iops</Text>
          <Text>
            {prettyBytes(clusterHealth[clusterId || '']?.fsStats[node.id].bps_read, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            /s
          </Text>
          <Text>
            {prettyBytes(
              clusterHealth[clusterId || '']?.fsStats[node.id].bps_write,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
            /s
          </Text>
        </div>
      </div>
    );
  };

  const renderShards = (node: NodeStatusInfo) => {
    return (
      <div className="flex grid-cols-2 gap-4">
        <div className="font-bold">
          <Text>Initializing</Text>
          <Text>Started</Text>
          <Text>Relocating</Text>
        </div>
        <div className="col-span-3">
          <Text testId="initializing-shards">
            {shards
              ?.filter(
                s => s.node_id == node.id && s.routing_state == 'INITIALIZING',
              )
              .reduce((prev, next) => {
                return prev + next.number_of_shards;
              }, 0)}
          </Text>
          <Text testId="started-shards">
            {shards
              ?.filter(s => s.node_id == node.id && s.routing_state == 'STARTED')
              .reduce((prev, next) => {
                return prev + next.number_of_shards;
              }, 0)}
          </Text>
          <Text testId="relocating-shards">
            {shards
              ?.filter(s => s.node_id == node.id && s.routing_state == 'RELOCATING')
              .reduce((prev, next) => {
                return prev + next.number_of_shards;
              }, 0)}
          </Text>
        </div>
      </div>
    );
  };

  if (!nodes || !cluster || !shards) {
    return <Loader />;
  }
  return <DataTable columns={columns} data={nodes!} disablePagination />;
}

export default NodesMetrics;
