import { JobLogWithName, TJobLogStatementSuccess } from 'types';

export const getLogDuration = (log: JobLogWithName): number | null => {
  if (log.error !== null || !log.statements) {
    return null;
  }

  const duration = Object.values<TJobLogStatementSuccess>(log.statements)
    .map(el => el.duration)
    .reduce((curr, acc) => acc + curr, 0);

  return duration;
};
