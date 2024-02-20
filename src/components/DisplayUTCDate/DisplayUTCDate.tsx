import { Tooltip } from 'antd';
import DisplayDate from '../DisplayDate';
import { DATE_FORMAT_WITH_TZ } from 'constants/defaults';

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
            <DisplayDate isoDate={isoDate} format={DATE_FORMAT_WITH_TZ} />
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
