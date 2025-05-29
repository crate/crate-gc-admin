import { useEffect, useState } from 'react';
import useSessionStore from 'state/session';
import { useClusterNodeStatus } from 'src/swr/jwt';
import { FSStats, LoadAverage, NodeStatusInfo } from 'types/cratedb';

export type ClusterHealthManagerProps = {
  clusterId: string;
};

export const STATS_PERIOD = 15 * 60 * 1000;

function ClusterHealthManager({ clusterId }: ClusterHealthManagerProps) {
  const { clusterHealth, setClusterHealth } = useSessionStore();
  const { data: nodes } = useClusterNodeStatus(clusterId);
  const [prevNodeData, setPrevNodesData] = useState<NodeStatusInfo[] | []>();

  const getFs = (nodes: NodeStatusInfo[]): Record<string, FSStats> => {
    const output: { [key: string]: FSStats } = {};

    nodes.forEach(node => {
      // retrieve previous stats for this node the last time we updated
      const prev = prevNodeData?.find(prevNode => prevNode.id === node.id);
      if (!prev) return;

      // generate stats for this node
      const seconds = Math.floor((node.timestamp - prev.timestamp) / 1000);
      output[node.id] = {
        bps_read: (node.fs.total.bytes_read - prev.fs.total.bytes_read) / seconds,
        bps_write:
          (node.fs.total.bytes_written - prev.fs.total.bytes_written) / seconds,
        iops_read: (node.fs.total.reads - prev.fs.total.reads) / seconds,
        iops_write: (node.fs.total.writes - prev.fs.total.writes) / seconds,
      };
    });

    return output;
  };

  const getLoad = (nodes: NodeStatusInfo[]): LoadAverage[] => {
    const loadHistory = clusterHealth[clusterId]?.load || [];

    // find average load across all nodes
    const reducer = (prev: number, current: number) => prev + current;
    const avg1 = nodes.map(s => s.load['1']).reduce(reducer) / nodes.length;
    const avg5 = nodes.map(s => s.load['5']).reduce(reducer) / nodes.length;
    const avg15 = nodes.map(s => s.load['15']).reduce(reducer) / nodes.length;

    // create a LoadAverage object
    const currLoad = {
      probe_timestamp: Math.max(...nodes.map(n => n.load.probe_timestamp)),
      1: Math.round(100 * avg1) / 100,
      5: Math.round(100 * avg5) / 100,
      15: Math.round(100 * avg15) / 100,
    };

    // append the current load to the history, provided it is newer
    // than the last recorded load (which could happen in a web request
    // race condition)
    if (
      loadHistory.length === 0 ||
      currLoad.probe_timestamp > loadHistory[loadHistory.length - 1].probe_timestamp
    ) {
      loadHistory.push(currLoad);
    }

    // restrict the results to the those in the given STATS_PERIOD
    return loadHistory.filter(
      load => load.probe_timestamp > currLoad.probe_timestamp - STATS_PERIOD,
    );
  };

  useEffect(() => {
    if (!nodes || nodes.length == 0) {
      return;
    }

    setClusterHealth(clusterId, { load: getLoad(nodes), fsStats: getFs(nodes) });
    setPrevNodesData(nodes);
  }, [nodes]);

  return null;
}

export default ClusterHealthManager;
