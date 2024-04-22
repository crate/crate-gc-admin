import { ShardInfo } from 'types/cratedb';

export const shards: ShardInfo[] = [
  {
    table_name: 'scheduled_jobs',
    schema_name: 'gc',
    node_id: 'BFHeuv7bRGyPFSYNS2k8eQ',
    state: 'STARTED',
    routing_state: 'STARTED',
    relocating_node: null,
    number_of_shards: 1,
    primary: false,
    total_docs: 0,
    avg_docs: 0,
    size_bytes: 208,
  },
  {
    table_name: 'alembic_version',
    schema_name: 'gc',
    node_id: 'BFHeuv7bRGyPFSYNS2k8eQ',
    state: 'STARTED',
    routing_state: 'RELOCATING',
    relocating_node: null,
    number_of_shards: 1,
    primary: true,
    total_docs: 1,
    avg_docs: 1,
    size_bytes: 20153,
  },
  {
    table_name: 'jwt_refresh_token',
    schema_name: 'gc',
    node_id: 'BFHeuv7bRGyPFSYNS2k8eQ',
    state: 'STARTED',
    routing_state: 'RELOCATING',
    relocating_node: null,
    number_of_shards: 1,
    primary: true,
    total_docs: 0,
    avg_docs: 0,
    size_bytes: 208,
  },
];
