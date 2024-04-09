import moment from 'moment';

type DurationLogs = {
  start: string;
  error: string | null;
  end: string | null;
};

export const getLogDuration = (log: DurationLogs): number | null => {
  if (log.error !== null || !log.end) {
    return null;
  }

  const duration = Math.abs(
    moment.duration(moment(log.end).diff(moment(log.start))).as('seconds'),
  );

  return duration;
};
