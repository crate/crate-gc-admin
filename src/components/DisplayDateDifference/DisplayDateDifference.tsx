import { capitalizeFirstLetter } from 'utils/strings';
import moment, { Moment } from 'moment';

export type DisplayDateDifferenceProps = {
  from?: string;
  to: string;
};

const units = [
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'years',
] satisfies moment.unitOfTime.Base[];
type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
  [K in T extends ReadonlyArray<infer U> ? U : never]: V;
};
const singleUnits: ObjectFromList<typeof units, string> = {
  minutes: 'minute',
  hours: 'hour',
  days: 'day',
  weeks: 'week',
  months: 'month',
  years: 'year',
};

const timeBetweenDates = (start: Moment, end: Moment) => {
  const results = units.map(key => {
    return {
      unit: key,
      value: Math.abs(moment.duration(end.diff(start)).as(key)),
    };
  });

  const difference = results.reverse().find(el => Math.round(el.value) > 0);

  return difference || results.pop();
};

export default function DisplayDateDifference({
  from = moment().format(),
  to,
}: DisplayDateDifferenceProps) {
  const start = moment(from);
  const end = moment(to);

  const difference = timeBetweenDates(start, end);
  if (difference) {
    const unit = difference.unit;
    const rawValue = difference.value;
    const roundedValue = Math.round(rawValue);
    const niceString = end.isAfter(start) ? ['In'] : [];
    niceString.push(
      roundedValue > rawValue || roundedValue < 1 ? 'less than' : 'more than',
    );
    niceString.push(Math.max(1, roundedValue).toString());
    niceString.push(roundedValue <= 1 ? singleUnits[unit] : unit);
    niceString.push(end.isBefore(start) ? 'ago' : '');

    return <>{capitalizeFirstLetter(niceString.join(' '))}</>;
  }

  return null;
}
