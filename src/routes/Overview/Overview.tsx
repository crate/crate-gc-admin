import { Heading } from '@crate.io/crate-ui-components';
import { useGetAllocations, useGetCluster } from '../../hooks/swrHooks.ts';
import { useGCContext } from '../../contexts';
import GCSpin from '../../components/GCSpin/GCSpin.tsx';
import { Statistic, Tag } from 'antd';
import { ClusterStatusColor, getClusterStatus } from '../../utils/statusChecks.ts';
import { formatHumanReadable, formatNum } from '../../utils/numbers.ts';

function Overview() {
  const { sqlUrl } = useGCContext();
  const { data: cluster } = useGetCluster(sqlUrl);

  const { data: allocations } = useGetAllocations(sqlUrl);

  const clusterStatus = getClusterStatus(allocations);

  const clusterStatusTag = () => {
    if (clusterStatus.color == ClusterStatusColor.RED) {
      return <Tag color={clusterStatus.color}>Critical</Tag>;
    }
    if (clusterStatus.color == ClusterStatusColor.YELLOW) {
      return (
        <Tag color={clusterStatus.color}>
          <span className="text-black">Warning</span>
        </Tag>
      );
    }
    return (
      <Tag color={clusterStatus.color}>
        <span className="text-black">Good</span>
      </Tag>
    );
  };

  return (
    <GCSpin spinning={!cluster || !allocations}>
      <div>
        <Heading level={Heading.levels.h1}>Cluster: {cluster?.name}</Heading>
        <div className="w-full grid grid-cols-4 mt-4 p-2 gap-6 bg-gray-100">
          <div className="bg-white rounded p-2">
            <Statistic
              title="Health"
              valueRender={() => clusterStatusTag()}
              value={0}
            />
          </div>
          <div className="bg-white rounded p-2">
            <Statistic
              title="Available records"
              value={formatHumanReadable(clusterStatus.totalDocsInPrimaryShards)}
              suffix={
                clusterStatus.primaryRecordAvailabilityPercent < 100 && (
                  <span className="text-red-400">
                    ({formatNum(clusterStatus.primaryRecordAvailabilityPercent)}%)
                  </span>
                )
              }
            />
          </div>
          <div className="bg-white rounded p-2 text-red-400">
            <Statistic
              title="Started primary shards"
              value={clusterStatus.totalPrimaries - clusterStatus.missingPrimaries}
              suffix={
                clusterStatus.primaryShardAvailabilityPercent < 100 && (
                  <span className="text-red-400">
                    ({formatNum(clusterStatus.primaryShardAvailabilityPercent)}%)
                  </span>
                )
              }
            />
          </div>
          <div className="bg-white rounded p-2">
            <Statistic
              title="Started replica shards"
              value={clusterStatus.totalReplicas - clusterStatus.missingReplicas}
              suffix={
                clusterStatus.replicaAvailabilityPercent < 100 && (
                  <span className="text-amber-400">
                    ({formatNum(clusterStatus.replicaAvailabilityPercent)}%)
                  </span>
                )
              }
            />
          </div>
        </div>
      </div>
    </GCSpin>
  );
}

export default Overview;
