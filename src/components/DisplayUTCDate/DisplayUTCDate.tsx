import { Tooltip } from 'antd';
import DisplayDate from '../DisplayDate';

export type DisplayUTCDateProps = {
  isoDate: string;
  tooltip?: boolean;
};

function DisplayUTCDate({ isoDate, tooltip = false }: DisplayUTCDateProps) {
  return (
    <Tooltip
      title={
        tooltip && (
          <span className="text-center flex">
            Local Time:{' '}
            <DisplayDate isoDate={isoDate} format="MMMM Do YYYY, HH:mm (UTC Z)" />
          </span>
        )
      }
    >
      <span>
        <DisplayDate isoDate={isoDate} utc />
      </span>
    </Tooltip>
  );
}

export default DisplayUTCDate;
