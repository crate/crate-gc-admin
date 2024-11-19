import { useEffect, useState } from 'react';
import useSessionStore from 'state/session';
import { useClusterNodeStatus } from '../../swr/jwt';
import { NodeStatusInfo } from 'types/cratedb';

export const STATS_PERIOD = 15 * 60 * 1000;

function StatsUpdater() {
  /*
  This component is included somewhere near the root of the app, runs in the background
  and accumulates node load stats.

  This is so that we keep updating them in the background
   */
  const { load, fsStats } = useSessionStore();
  const { data: nodes } = useClusterNodeStatus();
  const [previous, setPrevious] = useState<NodeStatusInfo[] | undefined>();

  const updateLoad = (nodes: NodeStatusInfo[]) => {
    const max_ts = Math.max(...nodes.map(n => n.load.probe_timestamp));
    const reducer = (prev: number, current: number) => prev + current;
    const avg1 = nodes.map(s => s.load['1']).reduce(reducer) / nodes.length;
    const avg5 = nodes.map(s => s.load['5']).reduce(reducer) / nodes.length;
    const avg15 = nodes.map(s => s.load['15']).reduce(reducer) / nodes.length;
    const nodeLoad = {
      probe_timestamp: max_ts,
      1: Math.round(100 * avg1) / 100,
      5: Math.round(100 * avg5) / 100,
      15: Math.round(100 * avg15) / 100,
    };

    const last = load.slice(-1).pop();
    const first = load.slice(0, 1).pop();

    // We only keep STATS_PERIOD of data.
    if (first && last) {
      if (last.probe_timestamp - first.probe_timestamp > STATS_PERIOD) {
        load.shift();
      }
    }
    if (!last || nodeLoad.probe_timestamp > last.probe_timestamp) {
      load.push(nodeLoad);
    }
  };

  const updateFs = (nodes: NodeStatusInfo[]) => {
    nodes.forEach(n => {
      let stat = fsStats[n.id];
      if (!stat) {
        stat = {
          bps_read: 0,
          bps_write: 0,
          iops_read: 0,
          iops_write: 0,
        };
      }
      if (!previous) {
        return;
      }
      const p = previous.find(p => p.id == n.id);
      if (!p) {
        return;
      }
      const diff_seconds = Math.floor((n.timestamp - p.timestamp) / 1000);
      stat.iops_write = (n.fs.total.writes - p.fs.total.writes) / diff_seconds;
      stat.iops_read = (n.fs.total.reads - p.fs.total.reads) / diff_seconds;
      stat.bps_write =
        (n.fs.total.bytes_written - p.fs.total.bytes_written) / diff_seconds;
      stat.bps_read = (n.fs.total.bytes_read - p.fs.total.bytes_read) / diff_seconds;
      fsStats[n.id] = stat;
    });
  };

  useEffect(() => {
    if (!nodes || nodes.length == 0) {
      return;
    }
    updateLoad(nodes);
    updateFs(nodes);
    setPrevious(nodes);
  }, [nodes]);

  return null;
}

export default StatsUpdater;
