export const SYSTEM_SCHEMAS = ['information_schema', 'sys', 'pg_catalog', 'gc'];

// This RegExp is for validating SET_REPLICAS values
// and it accepts:
// - {number}
// - {number}-all
// - {number}-{number}
export const SET_REPLICAS_VALUE_REGEXP = /^\d+(-(all|\d+))?$/;
