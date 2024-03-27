import moment from 'moment';
import { JobLogWithName } from 'types';

export const getLogDuration = (log: JobLogWithName): number | null => {
  if (log.error !== null || !log.end) {
    return null;
  }

  const duration = Math.abs(
    moment.duration(moment(log.end).diff(moment(log.start))).as('seconds'),
  );

  return duration;
};
