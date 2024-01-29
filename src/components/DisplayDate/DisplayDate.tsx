import moment from 'moment';

export type DisplayDateProps = {
  isoDate: string;
  format?: string;
};

function DisplayDate({ isoDate, format = 'MMMM Do YYYY, HH:mm' }: DisplayDateProps) {
  return <>{moment(isoDate).format(format)}</>;
}

export default DisplayDate;
