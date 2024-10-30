import { QueryResultSuccess } from 'types/query';

export const useTablesMock: QueryResultSuccess = {
  col_types: [],
  cols: [],
  rows: [
    ['doc', 'weather_data', 4, '0-1', false],
    ['policy_tests', 'parted_table', 4, '0-1', false],
    ['gc', 'alembic_version', null, null, true],
    ['gc', 'scheduled_jobs', null, null, true],
  ],
  rowcount: 1,
  duration: 123.45,
};
