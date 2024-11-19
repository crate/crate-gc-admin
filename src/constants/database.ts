import { ValueOf } from 'src/types/utils';

export const SYSTEM_SCHEMAS = ['information_schema', 'sys', 'pg_catalog', 'gc'];
export const SYSTEM_USERS = ['crate', 'system', 'gc_admin'];

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

// JWT authentication was added in crate 5.7.2. however, it is supported
// on all clusters in the cloud from 5.8.2.
// it is possible to manually enable it on 5.7.2+ cloud clusters, but at
// this time, this has not been done.
export const CRATE_AUTHENTICATE_VIA_JWT_MIN_VERSION = '5.8.2';

export const TABLE_HEALTH_STATES = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
} as const;
export type TableHealthState = ValueOf<typeof TABLE_HEALTH_STATES>;
