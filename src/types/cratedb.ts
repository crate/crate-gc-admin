export type NodeStatusInfoVersion = {
  number: string;
};

export type LoadAverage = {
  1: number;
  5: number;
  15: number;
};

export type NodeStatusInfo = {
  id: string;
  name: string;
  hostname: string;
  heap: object;
  fs: object;
  cpu: object;
  load: LoadAverage;
  version: NodeStatusInfoVersion;
  cpu_usage: number;
  available_processors: number;
};

export type CurrentUser = {
  username: string;
};

export type ClusterInfo = {
  id: string;
  name: string;
};

export type User = {
  name: string;
  superuser: boolean;
};

export type TableListEntry = {
  table_schema: string;
  table_name: string;
  number_of_shards: number;
  number_of_replicas: string;
  system: boolean;
};

export type TableInfo = {
  ordinal_position: number;
  column_name: string;
  data_type: string;
  column_default: string | null;
  constraint_type: string | null;
};

export type ShardInfo = {
  table_name: string;
  schema_name: string;
  node_id: string;
  state: string;
  routing_state: string;
  relocating_node: string;
  number_of_shards: number;
  primary: boolean;
  total_docs: number;
  avg_docs: number;
  size_bytes: number;
};

export type Allocation = {
  schema_name: string;
  table_name: string;
  partition_ident: string | null;
  num_primaries: number;
  num_started_primaries: number;
  num_replicas: number;
  num_started_replicas: number;
  num_docs_in_primaries: number;
  estimate_missing_records: number;
};
