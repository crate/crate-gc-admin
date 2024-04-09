import { QueryResult } from '../../src/types/query';

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
