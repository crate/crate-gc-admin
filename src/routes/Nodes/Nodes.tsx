import Heading from '../../components/Heading';
import {
  useGetCluster,
  useGetNodeStatus,
  useGetShards,
} from '../../hooks/swrHooks.ts';
import { Table, TableColumnsType, Tag } from 'antd';
import GCSpin from '../../components/GCSpin';
import { NodeStatusInfo } from '../../types/cratedb.ts';
import prettyBytes from 'pretty-bytes';
import VerticalProgress from '../../components/VerticalProgress/VerticalProgress.tsx';
import { formatNum } from '../../utils/numbers.ts';
import useSessionStore from '../../state/session.ts';
import React from 'react';

function Nodes() {
  const { fsStats } = useSessionStore();

  const { data: nodes } = useGetNodeStatus();
  const { data: cluster } = useGetCluster();
  const { data: shards } = useGetShards();

  interface DataType {
    key: React.Key;
    node: React.JSX.Element;
    attrs: React.JSX.Element;
    endpoint: React.JSX.Element;
    cores: number;
    os: React.JSX.Element;
    jvm: React.JSX.Element;
    heap: React.JSX.Element;
    load: React.JSX.Element;
    disk: React.JSX.Element;
    diskops: React.JSX.Element;
    shards: React.JSX.Element;
  }

  const columns: TableColumnsType<DataType> = [
    {
      title: 'Node',
      key: 'node',
      dataIndex: 'node',
      width: '20%',
      ellipsis: false,
    },
    {
      title: 'Attributes',
      key: 'attrs',
      dataIndex: 'attrs',
      width: '5%',
      ellipsis: false,
      responsive: ['xl'],
    },
    {
      title: 'Cores',
      key: 'cores',
      dataIndex: 'cores',
      width: '3%',
      ellipsis: false,
    },
    {
      title: 'OS',
      key: 'os',
      dataIndex: 'os',
      width: '8%',
      ellipsis: false,
      responsive: ['xl'],
    },
    {
      title: 'JVM',
      key: 'jvm',
      dataIndex: 'jvm',
      width: '10%',
      ellipsis: false,
      responsive: ['xl'],
    },
    {
      title: 'Heap usage',
      key: 'heap',
      dataIndex: 'heap',
      width: '10%',
      ellipsis: false,
    },
    {
      title: 'Load',
      key: 'load',
      dataIndex: 'load',
      width: '10%',
      ellipsis: false,
    },
    {
      title: 'Disk',
      key: 'disk',
      dataIndex: 'disk',
      width: '10%',
      ellipsis: false,
    },
    {
      title: 'Disk stats',
      key: 'diskops',
      dataIndex: 'diskops',
      width: '13%',
      ellipsis: false,
    },
    {
      title: 'Shards',
      key: 'shards',
      dataIndex: 'shards',
      width: '15%',
      ellipsis: false,
    },
  ];

  const renderNode = (node: NodeStatusInfo) => {
    return (
      <div className="flex flex-row justify-between align-top">
        <div>
          <div className="font-bold">{node.name}</div>
          <div>{node.hostname}</div>
          <div>v{node.version.number}</div>
        </div>
        <div>
          {cluster?.master == node.id && (
            <Tag color="blue">
              <span className="text-black">Master</span>
            </Tag>
          )}
        </div>
      </div>
    );
  };

  const renderAttributes = (node: NodeStatusInfo) => {
    return (
      <div className="">
        {Object.keys(node.attributes).map(k => {
          return (
            <>
              <Tag>
                <span className="text-black">
                  {k}: {node.attributes[k]}
                </span>
              </Tag>
            </>
          );
        })}
      </div>
    );
  };

  const renderEndpoint = (node: NodeStatusInfo) => {
    return (
      <a href={`http://${node.rest_url}`} target="_blank">
        {node.rest_url}
      </a>
    );
  };

  const renderOS = (node: NodeStatusInfo) => {
    return (
      <div className="text-xs">
        {node.os_info.name} {node.os_info.version} ({node.os_info.arch})
      </div>
    );
  };

  const renderJVM = (node: NodeStatusInfo) => {
    return (
      <div className="text-xs">
        {node.os_info.jvm.vm_name} {node.os_info.jvm.vm_version}
      </div>
    );
  };

  const renderHeap = (node: NodeStatusInfo) => {
    return (
      <div className="flex grid-cols-6 gap-2">
        <div className="min-w-5 p-0.5">
          <VerticalProgress max={node.heap.max} current={node.heap.used} />
        </div>
        <div className="col-span-2 font-bold">
          <div>Used</div>
          <div>Free</div>
          <div>Max</div>
        </div>
        <div className="col-span-3">
          <div>{prettyBytes(node.heap.used)}</div>
          <div>{prettyBytes(node.heap.free)}</div>
          <div>{prettyBytes(node.heap.max)}</div>
        </div>
      </div>
    );
  };

  const renderLoad = (node: NodeStatusInfo) => {
    return (
      <div className="flex grid-cols-6 gap-2">
        <div className="min-w-5 p-0.5">
          <VerticalProgress
            max={node.os_info.available_processors}
            current={node.load['1']}
          />
        </div>
        <div className="col-span-2 font-bold">
          <div>1 min</div>
          <div>5 min</div>
          <div>15 min</div>
        </div>
        <div className="col-span-3">
          <div>{formatNum(node.load['1'])}</div>
          <div>{formatNum(node.load['5'])}</div>
          <div>{formatNum(node.load['15'])}</div>
        </div>
      </div>
    );
  };

  const renderDisk = (node: NodeStatusInfo) => {
    return (
      <div className="flex grid-cols-6 gap-2">
        <div className="min-w-5 p-0.5">
          <VerticalProgress max={node.fs.total.size} current={node.fs.total.used} />
        </div>
        <div className="col-span-2 font-bold">
          <div>Used</div>
          <div>Free</div>
          <div>Max</div>
        </div>
        <div className="col-span-3">
          <div>{prettyBytes(node.fs.total.used)}</div>
          <div>{prettyBytes(node.fs.total.available)}</div>
          <div>{prettyBytes(node.fs.total.size)}</div>
        </div>
      </div>
    );
  };

  const renderFS = (node: NodeStatusInfo) => {
    const stats = fsStats[node.id];
    if (!stats) {
      return <GCSpin spinning={true} />;
    }
    // FIXME: This grid is a bit meh
    // FIXME: Add arrow
    return (
      <div className="flex grid-cols-2 gap-4">
        <div className="font-bold">
          <div>Reads</div>
          <div>Writes</div>
          <div>Read rate</div>
          <div>Write rate</div>
        </div>
        <div className="col-span-3">
          <div>{formatNum(stats.iops_read, 0)} iops</div>
          <div>{formatNum(stats.iops_write, 0)} iops</div>
          <div>
            {prettyBytes(fsStats[node.id].bps_read, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            /s
          </div>
          <div>
            {prettyBytes(fsStats[node.id].bps_write, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            /s
          </div>
        </div>
      </div>
    );
  };

  const renderShards = (node: NodeStatusInfo) => {
    return (
      <div className="flex grid-cols-2 gap-4">
        <div className="font-bold">
          <div>Initializing</div>
          <div>Started</div>
          <div>Relocating</div>
        </div>
        <div className="col-span-3">
          <div>
            {
              shards?.filter(
                s => s.node_id == node.id && s.routing_state == 'INITIALIZING',
              ).length
            }
          </div>
          <div>
            {
              shards?.filter(
                s => s.node_id == node.id && s.routing_state == 'STARTED',
              ).length
            }
          </div>
          <div>
            {
              shards?.filter(
                s => s.node_id == node.id && s.routing_state == 'RELOCATING',
              ).length
            }
          </div>
        </div>
      </div>
    );
  };

  const dataSource =
    cluster &&
    nodes &&
    nodes.map(node => {
      return {
        key: node.id,
        node: renderNode(node),
        attrs: renderAttributes(node),
        endpoint: renderEndpoint(node),
        cores: node.os_info.available_processors,
        os: renderOS(node),
        jvm: renderJVM(node),
        heap: renderHeap(node),
        load: renderLoad(node),
        disk: renderDisk(node),
        diskops: renderFS(node),
        shards: renderShards(node),
      };
    });

  return (
    <GCSpin spinning={!nodes || !cluster}>
      <div className="p-4">
        <Heading level={Heading.levels.h1} className="mb-2">
          Nodes
        </Heading>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
        />
      </div>
    </GCSpin>
  );
}

export default Nodes;
