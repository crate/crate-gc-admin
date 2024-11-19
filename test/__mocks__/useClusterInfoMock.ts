import { QueryResultSuccess } from 'types/query';

export const useClusterInfoMock: QueryResultSuccess = {
  col_types: [],
  cols: [],
  rows: [
    [
      '9fb7b3dfbded',
      'cratedb',
      'BFHeuv7bRGyPFSYNS2k8eQ',
      {
        replication: {
          logical: {
            reads_poll_duration: '50ms',
            ops_batch_size: 50000,
            recovery: { chunk_size: '1mb', max_concurrent_file_chunks: 2 },
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
            rebalance: { enable: 'all' },
            allocation: {
              include: { _id: '', _host: '', _name: '', _ip: '' },
              node_initial_primaries_recoveries: 4,
              disk: {
                threshold_enabled: true,
                watermark: { low: '85%', flood_stage: '95%', high: '90%' },
              },
              balance: { index: 0.55, threshold: 1, shard: 0.45 },
              total_shards_per_node: -1,
              enable: 'all',
              cluster_concurrent_rebalance: 2,
              node_concurrent_recoveries: 2,
              allow_rebalance: 'indices_all_active',
              exclude: { _id: '', _host: '', _name: '', _ip: '' },
              require: { _id: '', _host: '', _name: '', _ip: '' },
            },
          },
          graceful_stop: {
            timeout: '7200000ms',
            min_availability: 'PRIMARIES',
            force: false,
          },
          max_shards_per_node: 1000,
          info: { update: { interval: '30s' } },
        },
        indices: {
          breaker: {
            request: { limit: '307.1mb' },
            total: { limit: '486.3mb' },
            query: { limit: '307.1mb' },
          },
          replication: { retry_timeout: '60s' },
          recovery: {
            recovery_activity_timeout: '1800000ms',
            retry_delay_network: '5s',
            internal_action_timeout: '15m',
            retry_delay_state_sync: '500ms',
            max_bytes_per_sec: '40mb',
            internal_action_long_timeout: '1800000ms',
          },
        },
        memory: { allocation: { type: 'on-heap' }, operation_limit: 0 },
        stats: {
          breaker: {
            log: { jobs: { limit: '25.5mb' }, operations: { limit: '25.5mb' } },
          },
          service: { max_bytes_per_sec: '40mb', interval: '24h' },
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
        bulk: { request_timeout: '1m' },
        gateway: {
          expected_nodes: -1,
          recover_after_data_nodes: -1,
          expected_data_nodes: -1,
          recover_after_nodes: -1,
          recover_after_time: '0ms',
        },
      },
    ],
  ],
  rowcount: 1,
  duration: 123.45,
};
