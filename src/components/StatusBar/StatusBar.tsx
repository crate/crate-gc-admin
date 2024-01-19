import logo from '../../assets/logo.png';
import {
  useGetAllocations,
  useGetCluster,
  useGetCurrentUser,
  useGetNodeStatus,
  useGetShards,
  useGetTables,
} from '../../hooks/swrHooks.ts';
import { useGCContext } from '../../contexts';
import { StatusLight } from '@crate.io/crate-ui-components';
import { formatNum } from '../../utils/numbers.ts';
import React from 'react';
import { ClusterStatusColor, getClusterStatus } from '../../utils/statusChecks.ts';
import GCSpin from '../GCSpin/GCSpin.tsx';

function StatusBar() {
  const { sqlUrl } = useGCContext();
  const { data: nodeStatus } = useGetNodeStatus(sqlUrl);
  const { data: currentUser } = useGetCurrentUser(sqlUrl);
  const { data: cluster } = useGetCluster(sqlUrl);
  const { data: tables } = useGetTables(sqlUrl);
  const { data: shards } = useGetShards(sqlUrl);
  const { data: allocations } = useGetAllocations(sqlUrl);

  const spin = (
    elem: React.JSX.Element | string | undefined | number | null = null,
  ) => {
    return <GCSpin spinning={!elem}>{elem}</GCSpin>;
  };

  const getVersion = () => {
    return spin(nodeStatus && nodeStatus[0].version.number);
  };

  const getNumNodes = () => {
    return spin(nodeStatus && nodeStatus.length);
  };

  const getDataStatus = () => {
    if (!shards || !tables) {
      return <StatusLight color={StatusLight.colors.GRAY} message="Unknown" />;
    }
    const clusterStatus = getClusterStatus(allocations);
    if (clusterStatus.color == ClusterStatusColor.RED) {
      // RED if we've got any missing primary shards
      return (
        <StatusLight
          color={StatusLight.colors.RED}
          message="Missing shards"
          tooltip="Some data is not available"
        />
      );
    }
    if (clusterStatus.color == ClusterStatusColor.YELLOW) {
      // Yellow if we have any unassigned shards
      return (
        <StatusLight
          color={StatusLight.colors.YELLOW}
          message="Underreplicated shards"
          tooltip="Some tables have missing replica shards"
        />
      );
    }
    return <StatusLight color={StatusLight.colors.GREEN} message="OK" />;
  };

  const getLoadAverage = () => {
    if (!nodeStatus) {
      return spin();
    }
    const reducer = (prev: number, current: number) => prev + current;
    const avg1 =
      nodeStatus.map(s => s.load['1']).reduce(reducer) / nodeStatus.length;
    const avg5 =
      nodeStatus.map(s => s.load['5']).reduce(reducer) / nodeStatus.length;
    const avg15 =
      nodeStatus.map(s => s.load['15']).reduce(reducer) / nodeStatus.length;

    return `${formatNum(avg1)} / ${formatNum(avg5)} / ${formatNum(avg15)}`;
  };

  return (
    <div className="flex flex-row text-white w-full">
      <div className="basis-1/8 min-w-fit mr-10">
        <a href="/">
          <img src={logo} alt="Crate logo" className="mx-auto h-5" />
        </a>
      </div>
      <div className="basis-1/2"></div>
      <div className="basis-1/2 grid justify-end grid-flow-col auto-cols-max gap-8 font-bold">
        <div>Cluster: {spin(cluster?.name)}</div>
        <div>Version: {getVersion()}</div>
        <div>Nodes: {getNumNodes()}</div>
        <div className="flex flex-row min-w-56">
          <div className="mr-2">Data availability:</div>
          <div className="mr-2">{getDataStatus()}</div>
        </div>
        <div className="w-56">System load: {getLoadAverage()}</div>
        <div>User: {spin(currentUser)}</div>
      </div>
    </div>
  );
}

export default StatusBar;
