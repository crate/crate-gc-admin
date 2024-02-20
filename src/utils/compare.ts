import moment from 'moment';

export const compareIsoDates = (
  date1: string | null,
  date2: string | null,
  nullPosition: 'top' | 'bottom' = 'top',
) => {
  if (!date1 && !date2) {
    return 0;
  } else if (!date1) {
    return nullPosition === 'top' ? 1 : -1;
  } else if (!date2) {
    return nullPosition === 'top' ? -1 : 1;
  }

  // dates are not null
  const date1Moment = moment(date1);
  const date2Moment = moment(date2);

  return date1Moment.isAfter(date2Moment)
    ? 1
    : date1Moment.isBefore(date2Moment)
      ? -1
      : 0;
};

export const compareDurations = (
  duration1: number | null,
  duration2: number | null,
  nullPosition: 'top' | 'bottom' = 'bottom',
) => {
  if (!duration1 && !duration2) {
    return 0;
  } else if (!duration1) {
    return nullPosition === 'top' ? 1 : -1;
  } else if (!duration2) {
    return nullPosition === 'top' ? -1 : 1;
  }

  // durations are not null
  return duration1 > duration2 ? 1 : duration1 < duration2 ? -1 : 0;
};
