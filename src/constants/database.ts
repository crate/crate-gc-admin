export const SYSTEM_SCHEMAS = ['information_schema', 'sys', 'pg_catalog', 'gc'];

// This RegExp is for validating SET_REPLICAS values
// and it accepts:
// - {number}
// - {number}-all
// - {number}-{number}
export const SET_REPLICAS_VALUE_REGEXP = /^\d+(-(all|\d+))?$/;

export const NODE_STATUS_THRESHOLD = {
  CRITICAL: 98,
  WARNING: 90,
  GOOD: 0,
} as const;
