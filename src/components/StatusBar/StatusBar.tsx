import {
  useAllocations,
  useClusterNodeStatus,
  useCurrentUser,
  useClusterInfo,
  useShards,
} from 'src/swr/jwt';
import StatusLight from 'components/StatusLight';
import { CloseOutlined, DownOutlined } from '@ant-design/icons';
import { formatNum } from 'utils/numbers';
import React, { useEffect, useState } from 'react';
import { ClusterStatusColor, getClusterStatus } from 'utils/statusChecks';
import Loader from 'components/Loader';
import logo from '../../assets/logo.svg';
import useSessionStore from 'state/session';
import useJWTManagerStore from 'state/jwtManager';
import { LOADER_SIZES } from 'components/Loader/LoaderConstants';

function StatusBar() {
  const clusterId = useJWTManagerStore(state => state.clusterId);
  const [mobileVisible, setMobileVisible] = useState(false);
  const { load } = useSessionStore();
  const { data: nodeStatus } = useClusterNodeStatus();
  const { data: currentUser } = useCurrentUser();
  const { data: cluster } = useClusterInfo(clusterId);
  const { data: shards } = useShards(clusterId);
  const { data: allocations } = useAllocations();

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

  const drawValueOrLoader = (
    value: React.JSX.Element | string | undefined | number | null = null,
  ) => {
    return value ? value : <Loader size={LOADER_SIZES.SMALL} />;
  };

  const getVersion = () => {
    const versions = [...new Set(nodeStatus?.map(s => s.version.number).sort())];
    if (versions.length > 1) {
      return (
        <div>
          <StatusLight
            color={StatusLight.colors.YELLOW}
            message={versions.join(', ')}
            tooltip="CrateDB nodes have different versions"
          />
        </div>
      );
    }
    return drawValueOrLoader(nodeStatus && nodeStatus[0].version.number);
  };

  const getNumNodes = () => {
    const expected = cluster?.settings.gateway.expected_data_nodes;
    const current = nodeStatus?.length;
    if (expected && current && current < expected) {
      return `${current} of ${expected}`;
    }
    return drawValueOrLoader(nodeStatus && nodeStatus.length);
  };

  const getDataStatus = () => {
    if (!shards) {
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
      return drawValueOrLoader();
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
        className="flex select-none gap-3 leading-tight text-white md:hidden"
        onClick={() => setMobileVisible(true)}
      >
        <div>
          <div className="text-xs uppercase opacity-50">Cluster</div>
          <div>{drawValueOrLoader(cluster?.name)}</div>
        </div>
        <div className="flex">
          <DownOutlined className="text-xs opacity-50" />
        </div>
      </div>
      <div className="hidden select-none gap-8 leading-snug text-white md:flex">
        <div>
          <div className="text-xs uppercase opacity-50">Cluster</div>
          <div>{drawValueOrLoader(cluster?.name)}</div>
        </div>
        <div>
          <div className="text-xs uppercase opacity-50">Version</div>
          <div>{getVersion()}</div>
        </div>
        <div>
          <div className="text-xs uppercase opacity-50">Nodes</div>
          <div>{getNumNodes()}</div>
        </div>
        <div>
          <div className="text-xs uppercase opacity-50">Data</div>
          <div>{getDataStatus()}</div>
        </div>
        <div>
          <div className="text-xs uppercase opacity-50">Load</div>
          <div>{getLoadAverage()}</div>
        </div>
        <div>
          <div className="text-xs uppercase opacity-50">User</div>
          <div>{drawValueOrLoader(currentUser)}</div>
        </div>
      </div>
      {mobileVisible && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-50 flex select-none flex-col bg-crate-navigation-bg">
          <div className="flex h-12 items-center justify-between px-4">
            <img alt="CrateDB logo" src={logo} />
            <CloseOutlined
              className="cursor-pointer text-2xl text-white"
              onClick={() => setMobileVisible(false)}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <div className="w-full p-4">
              <div className="flex flex-col gap-8 leading-snug text-white">
                <div>
                  <div className="text-xs uppercase opacity-50">Cluster</div>
                  <div className="text-xl">{drawValueOrLoader(cluster?.name)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase opacity-50">Version</div>
                  <div className="text-xl">{getVersion()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase opacity-50">Nodes</div>
                  <div className="text-xl">{getNumNodes()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase opacity-50">Availability</div>
                  <div className="text-xl">{getDataStatus()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase opacity-50">Load</div>
                  <div className="text-xl">{getLoadAverage()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase opacity-50">User</div>
                  <div className="text-xl">{drawValueOrLoader(currentUser)}</div>
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
