import { NODE_STATUS_THRESHOLD } from 'constants/database';
import { NodeStatus, NodeStatusInfo, NodeErrorMessage } from 'types/cratedb';

function getUsedPercent(node: NodeStatusInfo): { fs: number; heap: number } {
  const fs_used_percent = (node.fs.total.used * 100) / node.fs.total.size;
  const heap_used_percent = (node.heap.used * 100) / node.heap.max;
  return { fs: fs_used_percent, heap: heap_used_percent };
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

export function getNodeHealth(node: NodeStatusInfo): NodeStatusInfo {
  const { fs: fs_used_percent, heap: heap_used_percent } = getUsedPercent(node);

  const errorMessages: NodeErrorMessage[] = [];

  if (fs_used_percent === 0) {
    node.fs_status = 'UNREACHABLE';
  }
  else if (fs_used_percent > NODE_STATUS_THRESHOLD.CRITICAL) {
    node.fs_status = 'CRITICAL';
    const msg = `The flood stage disk watermark is exceeded on the node. Tables that reside on an affected disk on this node have been made read-only. Please check the node disk usage.`;
    const errorMessage: NodeErrorMessage = {
      status: 'CRITICAL',
      message: msg,
    };
    errorMessages.push(errorMessage);
  } else if (fs_used_percent > NODE_STATUS_THRESHOLD.WARNING) {
    node.fs_status = 'WARNING';
    const msg = `The high disk watermark is exceeded on the node. The cluster will attempt to relocate shards to another node. Please check the node disk usage.`;
    const errorMessage: NodeErrorMessage = {
      status: 'WARNING',
      message: msg,
    };
    errorMessages.push(errorMessage);
  }

  if (heap_used_percent === 0) {
    node.heap_status = 'UNREACHABLE';
  }
  else if (heap_used_percent > NODE_STATUS_THRESHOLD.CRITICAL) {
    node.heap_status = 'CRITICAL';
    const msg = `The node is running out of heap memory. Please check the node heap usage.`;
    const errorMessage: NodeErrorMessage = {
      status: 'CRITICAL',
      message: msg,
    };
    errorMessages.push(errorMessage);
  } else if (heap_used_percent > NODE_STATUS_THRESHOLD.WARNING) {
    node.heap_status = 'WARNING';
    const msg = `The node is running low on heap memory. Please check the node heap usage.`;
    const errorMessage: NodeErrorMessage = {
      status: 'WARNING',
      message: msg,
    };
    errorMessages.push(errorMessage);
  }
  if (errorMessages.length > 0) {
    node['errorMessages'] = errorMessages;
  }

  return node;
}