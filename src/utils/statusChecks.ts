import { Allocation } from 'types/cratedb';
import { Color } from 'constants/colors';

export function tablesWithMissingPrimaryReplicas(
  allocations: Allocation[] | undefined,
) {
  if (!allocations) {
    return [];
  }
  return allocations.filter(a => a.num_started_primaries < a.num_primaries);
}

export function tablesWithUnassignedShards(allocations: Allocation[] | undefined) {
  if (!allocations) {
    return [];
  }
  return allocations.filter(a => a.num_started_replicas < a.num_replicas);
}

export function totalDocsInPrimaries(allocations: Allocation[] | undefined) {
  return allocations && allocations.length > 0
    ? allocations
        .map(t => t.num_docs_in_primaries)
        .reduce((prev, current) => prev + current)
    : 0;
}

export enum ClusterStatusColor {
  GREEN = Color.GREEN,
  YELLOW = Color.YELLOW,
  RED = Color.RED,
}

export type ClusterStatus = {
  color: ClusterStatusColor;
  totalDocsInPrimaryShards: number;
  totalPrimaries: number;
  missingPrimaries: number;
  primaryShardAvailabilityPercent: number;
  primaryRecordAvailabilityPercent: number;
  totalReplicas: number;
  missingReplicas: number;
  replicaAvailabilityPercent: number;
};

export function getClusterStatus(
  allocations: Allocation[] | undefined,
): ClusterStatus {
  const criticalTables = tablesWithMissingPrimaryReplicas(allocations);
  const underReplicatedTables = tablesWithUnassignedShards(allocations);
  const docsInPrimaries = totalDocsInPrimaries(allocations);

  // num_docs_in_primaries / total_primaries * started_primaries
  const totalPrimaries =
    allocations && allocations.length > 0
      ? allocations
          .map(t => t.num_primaries)
          .reduce((prev, current) => prev + current)
      : 0;
  const missingPrimaries =
    allocations && allocations.length > 0
      ? allocations
          .map(t => t.num_primaries - t.num_started_primaries)
          .reduce((prev, current) => prev + current)
      : 0;
  const missingDocs =
    allocations && allocations.length > 0
      ? allocations
          .map(t => t.estimate_missing_records)
          .reduce((prev, current) => prev + current)
      : 0;
  const totalReplicas =
    allocations && allocations.length > 0
      ? allocations
          .map(t => t.num_replicas)
          .reduce((prev, current) => prev + current)
      : 0;
  const missingReplicas =
    allocations && allocations.length > 0
      ? allocations
          .map(t => t.num_replicas - t.num_started_replicas)
          .reduce((prev, current) => prev + current)
      : 0;

  const primaryShardAvailabilityPercent =
    100 - (totalPrimaries > 0 ? (missingPrimaries / totalPrimaries) * 100 : 0);
  const replicaAvailabilityPercent =
    100 - (totalReplicas > 0 ? (missingReplicas / totalReplicas) * 100 : 0);
  const primaryRecordAvailabilityPercent =
    docsInPrimaries > 0
      ? (docsInPrimaries / (docsInPrimaries + missingDocs)) * 100
      : 0;

  let color = ClusterStatusColor.GREEN;
  if (criticalTables.length > 0) {
    color = ClusterStatusColor.RED;
  } else if (underReplicatedTables.length > 0) {
    color = ClusterStatusColor.YELLOW;
  }

  return {
    color: color,
    totalDocsInPrimaryShards: docsInPrimaries,
    totalPrimaries,
    missingPrimaries,
    primaryShardAvailabilityPercent,
    primaryRecordAvailabilityPercent,
    totalReplicas,
    missingReplicas,
    replicaAvailabilityPercent,
  };
}
