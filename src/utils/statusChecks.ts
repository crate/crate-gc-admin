import { Allocation } from '../types/cratedb.ts';

export function tablesWithMissingPrimaryReplicas(
  allocations: Allocation[] | undefined,
) {
  if (!allocations) {
    return [];
  }
  return allocations.filter(a => a.num_started_primaries < a.num_primaries);
}

export function unassignedShards(allocations: Allocation[] | undefined) {
  if (!allocations) {
    return [];
  }
  return allocations.filter(a => a.num_started_replicas < a.num_replicas);
}
