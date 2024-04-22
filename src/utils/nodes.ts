import { NODE_STATUS_THRESHOLD } from 'constants/database';
import { NodeStatus, NodeStatusInfo } from 'types/cratedb';

export function getNodeStatus(node: NodeStatusInfo): NodeStatus {
  const fs_used_percent = (node.fs.total.used * 100) / node.fs.total.size;
  const heap_used_percent = (node.heap.used * 100) / node.heap.max;

  if (fs_used_percent === 0 && heap_used_percent === 0) {
    return 'UNREACHABLE';
  } else {
    const used = Math.max(fs_used_percent, heap_used_percent);

    if (used > NODE_STATUS_THRESHOLD.CRITICAL) {
      return 'CRITICAL';
    } else if (used > NODE_STATUS_THRESHOLD.WARNING) {
      return 'WARNING';
    } else {
      return 'GOOD';
    }
  }
}
