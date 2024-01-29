import {
  useGetAllocations,
  useGetCluster,
  useGetQueryStats,
} from '../../hooks/swrHooks.ts';
import { useGCContext } from '../../contexts';
import GCSpin from '../../components/GCSpin';
import Heading from '../../components/Heading';
import { Statistic, Tag } from 'antd';
import { ClusterStatusColor, getClusterStatus } from '../../utils/statusChecks.ts';
import { formatHumanReadable, formatNum } from '../../utils/numbers.ts';
import GCChart from '../../components/GCChart/GCChart.tsx';
import useSessionStore from '../../state/session.ts';
import { STATS_PERIOD } from '../../components/StatsUpdater/StatsUpdater';

function Overview() {
  const { load } = useSessionStore();

  const { sqlUrl } = useGCContext();
  const { data: cluster } = useGetCluster(sqlUrl);

  const { data: allocations } = useGetAllocations(sqlUrl);
  const { data: queryStats } = useGetQueryStats(sqlUrl);

  const clusterStatus = getClusterStatus(allocations);

  const getStartTime = () => {
    if (!load || load.length == 0) {
      return;
    }
    const latest = load.slice(-1)?.pop()?.probe_timestamp;
    return latest ? latest - STATS_PERIOD : undefined;
  };

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
        <div className="w-full grid grid-cols-2 mt-4 p-2 gap-6 bg-gray-100">
          <div className="col-span-2">
            <GCChart
              title="Cluster Load"
              data={load.map(l => {
                return {
                  time: l.probe_timestamp,
                  l1: l['1'],
                  l5: l['5'],
                  l15: l['15'],
                };
              })}
              config={{
                areas: [{ key: 'l1', name: 'Load 1' }],
                lines: [
                  { key: 'l5', name: 'Load 5' },
                  { key: 'l15', name: 'Load 15' },
                ],
                start_from: getStartTime(),
              }}
            />
          </div>
          <GCChart
            title="Queries Per Second"
            data={queryStats?.map(q => {
              return {
                time: q.ended_time,
                SELECT: q.qps_select || 0,
                UPDATE: q.qps_update || 0,
                DDL: q.qps_ddl || 0,
                INSERT: q.qps_insert || 0,
                DELETE: q.qps_delete || 0,
                OVERALL: q.qps || 0,
              };
            })}
            config={{
              areas: [
                {
                  key: 'OVERALL',
                  name: 'OVERALL',
                },
              ],
              lines: [
                {
                  key: 'SELECT',
                  name: 'SELECT',
                },
                {
                  key: 'UPDATE',
                  name: 'UPDATE',
                },
                {
                  key: 'INSERT',
                  name: 'INSERT',
                },
                {
                  key: 'DELETE',
                  name: 'DELETE',
                },
                {
                  key: 'DDL',
                  name: 'DDL',
                },
              ],
            }}
          />
          <GCChart
            title="Query Speed (ms)"
            data={queryStats?.map(q => {
              return {
                time: q.ended_time,
                SELECT: q.dur_select || 0,
                UPDATE: q.dur_update || 0,
                DDL: q.dur_ddl || 0,
                INSERT: q.dur_insert || 0,
                DELETE: q.dur_delete || 0,
                OVERALL: q.duration || 0,
              };
            })}
            config={{
              areas: [
                {
                  key: 'OVERALL',
                  name: 'OVERALL',
                },
              ],
              lines: [
                {
                  key: 'SELECT',
                  name: 'SELECT',
                },
                {
                  key: 'UPDATE',
                  name: 'UPDATE',
                },
                {
                  key: 'INSERT',
                  name: 'INSERT',
                },
                {
                  key: 'DELETE',
                  name: 'DELETE',
                },
                {
                  key: 'DDL',
                  name: 'DDL',
                },
              ],
            }}
          />
        </div>
      </div>
    </GCSpin>
  );
}

export default Overview;
