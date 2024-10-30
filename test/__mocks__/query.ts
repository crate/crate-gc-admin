import { NodeStatusInfo, ShardInfo } from 'types/cratedb';
import { QueryResult } from 'types/query';
import { schemaTableColumnMock } from './schemaTableColumn';

export const queryResult: QueryResult = {
  col_types: [9],
  cols: ['2'],
  rows: [[2]],
  rowcount: 1,
  duration: 1.877785,
};

export const schemasQueryResult: QueryResult = {
  cols: [
    'table_schema',
    'table_name',
    'number_of_shards',
    'number_of_replicas',
    'partitioned_by',
    'system',
  ],
  col_types: [4, 4, 9, 4, [100, 4], 3],
  rows: [['policy_tests', 'parted_table', 4, '0-1', ['part'], false]],
  rowcount: 1,
  duration: 1.179331,
};

export const singleNodesQueryResult = (clusterNode: NodeStatusInfo): QueryResult => {
  return {
    cols: [
      'id',
      'name',
      'hostname',
      'heap',
      'fs',
      'load',
      'version',
      'cpu_usage',
      'available_processors',
      'rest_url',
      'os_info',
      'now()',
      'attributes',
      'mem',
    ],
    col_types: [4, 4, 4, 12, 12, 12, 12, 8, 9, 4, 12, 11, 12, 12],
    rows: [
      [
        clusterNode.id,
        clusterNode.name,
        clusterNode.hostname,
        clusterNode.heap,
        clusterNode.fs,
        clusterNode.load,
        clusterNode.version,
        clusterNode.crate_cpu_usage,
        clusterNode.available_processors,
        clusterNode.rest_url,
        clusterNode.os_info,
        1713515699109,
        clusterNode.attributes,
        clusterNode.mem,
      ],
    ],
    rowcount: 3,
    duration: 6.938865,
  };
};

export const clusterInfoQueryResult: QueryResult = {
  cols: ['id', 'name', 'master_node', 'settings'],
  col_types: [4, 4, 4, 12],
  rows: [
    [
      'linWj13gQleu6b7T_lj2DQ',
      'crate-docker-cluster',
      'BFHeuv7bRGyPFSYNS2k8eQ',
      {
        replication: {
          logical: {
            reads_poll_duration: '50ms',
            ops_batch_size: 50000,
            recovery: {
              chunk_size: '1mb',
              max_concurrent_file_chunks: 2,
            },
          },
        },
        overload_protection: {
          dml: {
            max_concurrency: 2000,
            queue_size: 200,
            initial_concurrency: 5,
            min_concurrency: 1,
          },
        },
        cluster: {
          routing: {
            rebalance: {
              enable: 'all',
            },
            allocation: {
              include: {
                _id: '',
                _host: '',
                _name: '',
                _ip: '',
              },
              disk: {
                threshold_enabled: true,
                watermark: {
                  low: '85%',
                  flood_stage: '95%',
                  high: '90%',
                },
              },
              node_initial_primaries_recoveries: 4,
              balance: {
                index: 0.55,
                threshold: 1,
                shard: 0.45,
              },
              total_shards_per_node: -1,
              enable: 'all',
              allow_rebalance: 'indices_all_active',
              cluster_concurrent_rebalance: 2,
              node_concurrent_recoveries: 2,
              exclude: {
                _id: '',
                _host: '',
                _name: '',
                _ip: '',
              },
              require: {
                _id: '',
                _host: '',
                _name: '',
                _ip: '',
              },
            },
          },
          graceful_stop: {
            timeout: '7200000ms',
            min_availability: 'PRIMARIES',
            force: false,
          },
          max_shards_per_node: 1000,
          info: {
            update: {
              interval: '30s',
            },
          },
        },
        indices: {
          breaker: {
            request: {
              limit: '1.1gb',
            },
            total: {
              limit: '1.8gb',
            },
            query: {
              limit: '1.1gb',
            },
          },
          replication: {
            retry_timeout: '60s',
          },
          recovery: {
            recovery_activity_timeout: '1800000ms',
            retry_delay_network: '5s',
            internal_action_timeout: '15m',
            retry_delay_state_sync: '500ms',
            max_bytes_per_sec: '40mb',
            internal_action_long_timeout: '1800000ms',
          },
        },
        memory: {
          allocation: {
            type: 'on-heap',
          },
          operation_limit: 0,
        },
        stats: {
          breaker: {
            log: {
              jobs: {
                limit: '102.3mb',
              },
              operations: {
                limit: '102.3mb',
              },
            },
          },
          service: {
            max_bytes_per_sec: '40mb',
            interval: '24h',
          },
          jobs_log_expiration: '0s',
          operations_log_expiration: '0s',
          jobs_log_size: 10000,
          jobs_log_persistent_filter: 'false',
          operations_log_size: 10000,
          enabled: true,
          jobs_log_filter: 'true',
        },
        udc: {
          initial_delay: '10m',
          interval: '24h',
          enabled: true,
          url: 'https://udc.crate.io/',
        },
        logger: [],
        statement_timeout: '0ms',
        bulk: {
          request_timeout: '1m',
        },
        gateway: {
          expected_nodes: -1,
          recover_after_data_nodes: 2,
          expected_data_nodes: 3,
          recover_after_nodes: -1,
          recover_after_time: '0ms',
        },
      },
    ],
  ],
  rowcount: 1,
  duration: 2.34879,
};

export const shardsQueryResult = (shards: ShardInfo[]): QueryResult => {
  return {
    cols: [
      'table_name',
      'schema_name',
      'node_id',
      'state',
      'routing_state',
      'relocating_node',
      'number_of_shards',
      'primary',
      'sum(num_docs)',
      'avg(num_docs)',
      'sum(size)',
    ],
    col_types: [4, 4, 4, 4, 4, 4, 10, 3, 10, 6, 10],
    rows: shards.map(el => {
      return [
        el.table_name,
        el.schema_name,
        el.node_id,
        el.state,
        el.routing_state,
        el.relocating_node,
        el.number_of_shards,
        el.primary,
        el.total_docs,
        el.avg_docs,
        el.size_bytes,
      ];
    }),
    rowcount: 8,
    duration: 52.280266,
  };
};

export const getTablesColumnsResult = schemaTableColumnMock;

export const getViewsDDLQueryResult = {
  cols: [
    'concat(\'CREATE OR REPLACE VIEW "new_schema"."new_view" AS (\', (SELECT view_definition FROM (information_schema.views)), \')\')',
  ],
  col_types: [4],
  rows: [['CREATE OR REPLACE VIEW "new_schema"."test_view" AS (SELECT 1\n\n)']],
  rowcount: 1,
  duration: 1.872847,
};

export const getTablesDDLQueryResult = {
  cols: ['SHOW CREATE TABLE new_schema.new_table'],
  col_types: [4],
  rows: [
    [
      'CREATE TABLE IF NOT EXISTS "new_schema"."new_table" (\n   "id" INTEGER\n)\nCLUSTERED INTO 4 SHARDS\nWITH (\n   "allocation.max_retries" = 5,\n   "blocks.metadata" = false,\n   "blocks.read" = false,\n   "blocks.read_only" = false,\n   "blocks.read_only_allow_delete" = false,\n   "blocks.write" = false,\n   codec = \'default\',\n   column_policy = \'strict\',\n   "mapping.total_fields.limit" = 1000,\n   max_ngram_diff = 1,\n   max_shingle_diff = 3,\n   number_of_replicas = \'0-1\',\n   "routing.allocation.enable" = \'all\',\n   "routing.allocation.total_shards_per_node" = -1,\n   "store.type" = \'fs\',\n   "translog.durability" = \'REQUEST\',\n   "translog.flush_threshold_size" = 536870912,\n   "translog.sync_interval" = 5000,\n   "unassigned.node_left.delayed_timeout" = 60000,\n   "write.wait_for_active_shards" = \'1\'\n)',
    ],
  ],
  rowcount: 1,
  duration: 0.683478,
};

export const getUsersQueryResult = {
  cols: [
    'type',
    'name',
    'password_set',
    'jwt_set',
    'granted_roles',
    'privileges',
    'superuser',
  ],
  col_types: [4, 4, 3, 3, [100, 12], [100, 12], 3],
  rows: [
    [
      'user',
      'alex',
      false,
      false,
      [],
      [
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'AL',
        },
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'DDL',
        },
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'DQL',
        },
        {
          class: 'SCHEMA',
          ident: 'doc',
          state: 'GRANT',
          type: 'DQL',
        },
        {
          class: 'TABLE',
          ident: 'doc.a',
          state: 'GRANT',
          type: 'DML',
        },
        {
          class: 'VIEW',
          ident: 'doc.aaview',
          state: 'GRANT',
          type: 'DML',
        },
        {
          class: 'VIEW',
          ident: 'doc.view',
          state: 'GRANT',
          type: 'DML',
        },
      ],
      false,
    ],
    ['user', 'crate', false, false, [], [], true],
    [
      'user',
      'john',
      false,
      true,
      [
        {
          role: 'rolename',
          grantor: 'crate',
        },
        {
          role: 'rolename2',
          grantor: 'crate',
        },
        {
          role: 'rolename3',
          grantor: 'crate',
        },
        {
          role: 'rolename4',
          grantor: 'crate',
        },
        {
          role: 'rolename5',
          grantor: 'crate',
        },
        {
          role: 'rolename6',
          grantor: 'crate',
        },
      ],
      [],
      false,
    ],
    [
      'user',
      'my_user',
      false,
      false,
      [],
      [
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'AL',
        },
        {
          class: 'SCHEMA',
          ident: 'my_schema',
          state: 'GRANT',
          type: 'DQL',
        },
        {
          class: 'TABLE',
          ident: 'doc.a',
          state: 'DENY',
          type: 'DML',
        },
      ],
      false,
    ],
    [
      'user',
      'my_user_password',
      true,
      false,
      [],
      [
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'DDL',
        },
      ],
      false,
    ],
    ['user', 'test_user', true, true, [], [], false],
    [
      'role',
      'rolename',
      false,
      false,
      [],
      [
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'AL',
        },
      ],
      false,
    ],
    ['role', 'rolename2', false, false, [], [], false],
    ['role', 'rolename3', false, false, [], [], false],
    ['role', 'rolename4', false, false, [], [], false],
    ['role', 'rolename5', false, false, [], [], false],
    ['role', 'rolename6', false, false, [], [], false],
  ],
  rowcount: 12,
  duration: 12.049209,
};
