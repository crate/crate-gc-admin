import {
  CRATEDB_CLUSTER_HEAP_DOCS,
  CRATEDB_CLUSTER_DISK_DOCS,
} from 'constants/defaults';
import { NODE_STATUS_THRESHOLD } from 'constants/database';
import {
  NodeStatus,
  NodeStatusInfo,
  ErrorMessage,
  ClusterSettings,
} from 'types/cratedb';

const DiskStatusMessages: Record<NodeStatus, string> = {
  CRITICAL:
    'The flood stage disk watermark is exceeded on the node. Tables that reside on an affected disk on this node have been made read-only. Please check the node disk usage.',
  WARNING:
    'The high disk watermark is exceeded on the node. The cluster will attempt to relocate shards to another node. Please check the node disk usage.',
  GOOD: '',
  UNREACHABLE: '',
};

const HeapStatusMessages: Record<NodeStatus, string> = {
  CRITICAL:
    'The node is running out of heap memory. Please check the node heap usage.',
  WARNING:
    'The node is running low on heap memory. Please check the node heap usage.',
  GOOD: '',
  UNREACHABLE: '',
};

function getUsedPercent(node: NodeStatusInfo): { fs: number; heap: number } {
  const fs_used_percent = (node.fs.total.used * 100) / node.fs.total.size;
  const heap_used_percent = (node.heap.used * 100) / node.heap.max;
  return { fs: fs_used_percent, heap: heap_used_percent };
}

function getThresholdFromSettings(
  watermark: string | undefined,
  defaultValue: number,
): number {
  const match = watermark?.match(/\d+/);
  return match ? Number(match[0]) : defaultValue;
}

function pushErrorMessage(
  errorMessages: ErrorMessage[],
  messageMap: Record<NodeStatus, string>,
  status: NodeStatus,
  docsLink?: string,
) {
  if (status === 'CRITICAL' || status === 'WARNING') {
    const errorMessage: ErrorMessage = {
      status: status,
      message: messageMap[status],
    };
    if (docsLink) {
      errorMessage.docs_link = docsLink;
    }
    errorMessages.push(errorMessage);
  }
}

export function getNodeStatus(node: NodeStatusInfo): NodeStatus {
  const { fs: fs_used_percent, heap: heap_used_percent } = getUsedPercent(node);

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

function setHeapHealth(
  node: NodeStatusInfo,
  errorMessages: ErrorMessage[],
  heap_used_percent: number,
) {
  let heapStatus: NodeStatus = 'GOOD';
  if (heap_used_percent === 0) {
    heapStatus = 'UNREACHABLE';
  } else if (heap_used_percent > NODE_STATUS_THRESHOLD.CRITICAL) {
    heapStatus = 'CRITICAL';
  } else if (heap_used_percent > NODE_STATUS_THRESHOLD.WARNING) {
    heapStatus = 'WARNING';
  }

  node.heap_status = heapStatus;
  pushErrorMessage(
    errorMessages,
    HeapStatusMessages,
    heapStatus,
    CRATEDB_CLUSTER_HEAP_DOCS,
  );
}

function setDiskHealth(
  node: NodeStatusInfo,
  errorMessages: ErrorMessage[],
  fs_used_percent: number,
  settings?: ClusterSettings,
) {
  const criticalDiskThreshold = getThresholdFromSettings(
    settings?.cluster?.routing?.allocation?.disk?.watermark?.flood_stage,
    NODE_STATUS_THRESHOLD.CRITICAL,
  );

  const warningDiskThreshold = getThresholdFromSettings(
    settings?.cluster?.routing?.allocation?.disk?.watermark?.high,
    NODE_STATUS_THRESHOLD.WARNING,
  );

  let diskStatus: NodeStatus = 'GOOD';
  if (fs_used_percent === 0) {
    diskStatus = 'UNREACHABLE';
  } else if (fs_used_percent > criticalDiskThreshold) {
    diskStatus = 'CRITICAL';
  } else if (fs_used_percent > warningDiskThreshold) {
    diskStatus = 'WARNING';
  }

  node.fs_status = diskStatus;
  pushErrorMessage(
    errorMessages,
    DiskStatusMessages,
    diskStatus,
    CRATEDB_CLUSTER_DISK_DOCS,
  );
}

export function setNodeHealth(
  node: NodeStatusInfo,
  settings?: ClusterSettings,
): NodeStatusInfo {
  const { fs: fs_used_percent, heap: heap_used_percent } = getUsedPercent(node);

  const errorMessages: ErrorMessage[] = [];

  setDiskHealth(node, errorMessages, fs_used_percent, settings);
  setHeapHealth(node, errorMessages, heap_used_percent);

  // Add error messages to node if there are any
  if (errorMessages.length > 0) {
    node['errorMessages'] = errorMessages;
  }

  return node;
}
