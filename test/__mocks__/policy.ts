import { EligibleColumnsApiOutput, EligibleTablesApiOutput, Policy } from 'types';

export const policy: Policy = {
  actions: [
    {
      action: 'delete',
      value: null,
    },
  ],
  enabled: true,
  next_run_time: '2024-01-19T10:25:00+00:00',
  id: '0FFS3646B7KNY',
  name: 'POLICY_NAME',
  partitioning: {
    column_name: 'part',
    operation: '<=',
    unit: 'days',
    value: 10,
  },
  targets: [
    {
      name: 'policy_tests.parted_table',
      type: 'table',
    },
  ],
};

export const policyPreview: EligibleTablesApiOutput = {
  eligible_tables: [
    {
      partitions_affected: 1,
      table_name: 'parted_table',
      table_schema: 'policy_tests',
    },
  ],
};

export const policyEligibleColumns: EligibleColumnsApiOutput = {
  eligible_columns: {
    part: [
      {
        table_name: 'parted_table',
        table_schema: 'policy_tests',
      },
    ],
  },
};
