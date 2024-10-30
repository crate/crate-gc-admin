import { QueryResultSuccess } from 'types/query';

export const useAllocationsMock: QueryResultSuccess = {
  col_types: [],
  cols: [],
  rows: [
    ['gc', 'alembic_version', null, 1, 1, 0, 0, 1, 0],
    ['doc', 'marketing_data', null, 4, 4, 0, 0, 1000, 0],
    ['gc', 'jwt_refresh_token', null, 1, 1, 0, 0, 0, 0],
    ['doc', 'omg^1', null, 4, 4, 0, 0, 0, 0],
    ['gc', 'scheduled_jobs_state', null, 1, 1, 0, 0, 0, 0],
    ['georg', 'geo', null, 4, 4, 0, 0, 2, 0],
    ['doc', 'weather_data', null, 4, 4, 0, 0, 70000, 0],
    ['gc', 'scheduled_jobs', null, 1, 1, 0, 0, 0, 0],
  ],
  rowcount: 1,
  duration: 123.45,
};
