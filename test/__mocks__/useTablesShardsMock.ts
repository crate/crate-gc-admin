import { QueryResultSuccess } from 'types/query';

export const useTablesShardsMock: QueryResultSuccess = {
  col_types: [4, 4, 3, 4, 9, 10, 10, 10, 10, 10, 10, 10, 10, [100, 12]],
  cols: [
    'schema_name',
    'table_name',
    'is_partitioned',
    'number_of_replicas',
    'number_of_shards',
    'started_primary',
    'started_replica',
    'unassigned_primary',
    'unassigned_replica',
    'total_primary',
    'total_replica',
    'num_docs_primary',
    'size_primary',
    'partitions',
  ],
  rows: [
    ['schema_1', 'table_1', false, '0-1', 6, 6, 6, 0, 0, 6, 6, 123, 1248, null],
    ['schema_1', 'table_2', false, '0-1', 6, 6, 6, 0, 0, 6, 8, 234, 23112, null],
    [
      'schema_1',
      'table_3',
      true,
      '0-1',
      1,
      9,
      9,
      0,
      0,
      9,
      9,
      112841,
      11667215,
      [
        {
          partition_ident: 'part_01',
          number_of_replicas: '0-1',
          number_of_shards: 1,
          started_primary: 1,
          started_replica: 1,
          unassigned_primary: 0,
          unassigned_replica: 0,
          total_primary: 1,
          total_replica: 1,
          num_docs_primary: 0,
          size_primary: 2063487,
        },
        {
          partition_ident: 'part_02',
          number_of_replicas: '0-1',
          number_of_shards: 1,
          started_primary: 1,
          started_replica: 1,
          unassigned_primary: 0,
          unassigned_replica: 0,
          total_primary: 1,
          total_replica: 1,
          num_docs_primary: 26784,
          size_primary: 1860677,
        },
      ],
    ],
  ],
  rowcount: 3,
  duration: 123.45,
};