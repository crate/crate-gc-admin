import { useGCContext } from '../../contexts';
import { useGetNodeStatus } from '../../hooks/swrHooks.ts';
import { useEffect } from 'react';
import useSessionStore from '../../state/session.ts';

export const STATS_PERIOD = 15 * 60 * 1000;

function StatsUpdater() {
  /*
  This component is included somewhere near the root of the app, runs in the background
  and accumulates node load stats.

  This is so that we keep updating them in the background
   */
  const { sqlUrl } = useGCContext();
  const { load } = useSessionStore();
  const { data: nodes } = useGetNodeStatus(sqlUrl);

  useEffect(() => {
    if (!nodes || nodes.length == 0) {
      return;
    }
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
  }, [nodes]);

  return null;
}

export default StatsUpdater;
