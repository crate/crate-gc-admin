import { DATE_FORMAT } from 'constants/defaults';
import moment from 'moment';

export type DisplayDateProps = {
  isoDate: string;
  format?: string;
  utc?: boolean;
};

function DisplayDate({
  isoDate,
  format = DATE_FORMAT,
  utc = false,
}: DisplayDateProps) {
  if (utc) {
    return moment.utc(isoDate).format(format);
  }
  return moment(isoDate).format(format);
}

export default DisplayDate;
