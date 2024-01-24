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
import { CloseOutlined, DownOutlined } from '@ant-design/icons';
import { formatNum } from '../../utils/numbers.ts';
import React, { useEffect, useState } from 'react';
import { ClusterStatusColor, getClusterStatus } from '../../utils/statusChecks.ts';
import GCSpin from '../GCSpin/GCSpin.tsx';
import logo from '../../assets/logo.svg';
import useSessionStore from '../../state/session.ts';

function StatusBar() {
  const [mobileVisible, setMobileVisible] = useState(false);
  const { sqlUrl } = useGCContext();
  const { load } = useSessionStore();
  const { data: nodeStatus } = useGetNodeStatus(sqlUrl);
  const { data: currentUser } = useGetCurrentUser(sqlUrl);
  const { data: cluster } = useGetCluster(sqlUrl);
  const { data: tables } = useGetTables(sqlUrl);
  const { data: shards } = useGetShards(sqlUrl);
  const { data: allocations } = useGetAllocations(sqlUrl);

  // hide the mobile overlay on any window resize
  useEffect(() => {
    const handleResize = () => {
      if (mobileVisible) {
        setMobileVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileVisible]);

  const spin = (
    elem: React.JSX.Element | string | undefined | number | null = null,
  ) => {
    return <GCSpin spinning={!elem}>{elem}</GCSpin>;
  };

  const getVersion = () => {
    return spin(nodeStatus && nodeStatus[0].version.number);
  };

  const getNumNodes = () => {
    const expected = cluster?.settings.gateway.expected_data_nodes;
    const current = nodeStatus?.length;
    if (expected && current && current < expected) {
      return `${current} of ${expected}`;
    }
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
    if (!load || load.length == 0) {
      return spin();
    }

    const last = load.slice(-1).pop();
    if (!last) {
      return;
    }

    return `${formatNum(last['1'])} / ${formatNum(last['5'])} / ${formatNum(last['15'])}`;
  };

  return (
    <>
      <div
        className="gap-3 flex leading-tight text-white md:hidden"
        onClick={() => setMobileVisible(true)}
      >
        <div>
          <div className="opacity-50 text-xs uppercase">Cluster</div>
          <div>{spin(cluster?.name)}</div>
        </div>
        <div className="flex">
          <DownOutlined className="opacity-50 text-xs" />
        </div>
      </div>
      <div className="hidden gap-8 leading-snug text-white md:flex">
        <div>
          <div className="opacity-50 text-xs uppercase">Cluster</div>
          <div>{spin(cluster?.name)}</div>
        </div>
        <div>
          <div className="opacity-50 text-xs uppercase">Version</div>
          <div>{getVersion()}</div>
        </div>
        <div>
          <div className="opacity-50 text-xs uppercase">Nodes</div>
          <div>{getNumNodes()}</div>
        </div>
        <div>
          <div className="opacity-50 text-xs uppercase">Data</div>
          <div>{getDataStatus()}</div>
        </div>
        <div>
          <div className="opacity-50 text-xs uppercase">Load</div>
          <div>{getLoadAverage()}</div>
        </div>
        <div>
          <div className="opacity-50 text-xs uppercase">User</div>
          <div>{spin(currentUser)}</div>
        </div>
      </div>
      {mobileVisible && (
        <div className="absolute bg-crate-navigation-bg bottom-0 flex flex-col left-0 select-none top-0 right-0 z-50">
          <div className="flex h-12 items-center justify-between px-4">
            <img alt="CrateDB logo" src={logo} />
            <CloseOutlined
              className="cursor-pointer text-2xl text-white"
              onClick={() => setMobileVisible(false)}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <div className="p-4 w-full">
              <div className="flex flex-col gap-8 leading-snug text-white">
                <div>
                  <div className="opacity-50 text-xs uppercase">Cluster</div>
                  <div className="text-xl">{spin(cluster?.name)}</div>
                </div>
                <div>
                  <div className="opacity-50 text-xs uppercase">Version</div>
                  <div className="text-xl">{getVersion()}</div>
                </div>
                <div>
                  <div className="opacity-50 text-xs uppercase">Nodes</div>
                  <div className="text-xl">{getNumNodes()}</div>
                </div>
                <div>
                  <div className="opacity-50 text-xs uppercase">Availability</div>
                  <div className="text-xl">{getDataStatus()}</div>
                </div>
                <div>
                  <div className="opacity-50 text-xs uppercase">Load</div>
                  <div className="text-xl">{getLoadAverage()}</div>
                </div>
                <div>
                  <div className="opacity-50 text-xs uppercase">User</div>
                  <div className="text-xl">{spin(currentUser)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StatusBar;
