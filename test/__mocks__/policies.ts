import { Policy } from 'types';

const policies: Policy[] = [
  {
    id: 'POLICY_ID_1',
    name: 'POLICY_NAME_1',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_2',
    name: 'POLICY_NAME_2',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_3',
    name: 'POLICY_NAME_3',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_4',
    name: 'POLICY_NAME_4',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_5',
    name: 'POLICY_NAME_5',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_6',
    name: 'POLICY_NAME_6',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_7',
    name: 'POLICY_NAME_7',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_8',
    name: 'POLICY_NAME_8',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_9',
    name: 'POLICY_NAME_9',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_10',
    name: 'POLICY_NAME_10',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
  {
    id: 'POLICY_ID_11',
    name: 'POLICY_NAME_11',
    enabled: true,
    next_run_time: '2024-01-19T10:25:00+00:00',
    targets: [
      {
        type: 'schema',
        name: 'my_docs',
      },
      {
        type: 'table',
        name: 'other_schema.my_table',
      },
    ],
    partitioning: {
      column_name: "dc['created']",
      value: 10,
      operation: '<=',
      unit: 'days',
    },
    actions: [
      {
        action: 'force_merge',
        value: '10',
      },
      {
        action: 'set_replicas',
        value: '1',
      },
      {
        action: 'delete',
        value: null,
      },
    ],
  },
];

export default policies;
