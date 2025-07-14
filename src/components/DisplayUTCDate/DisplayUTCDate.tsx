import { DATE_FORMAT_WITH_TZ } from 'constants/defaults';
import { Tooltip } from 'antd';
import DisplayDate from 'components/DisplayDate';

export type DisplayUTCDateProps = {
  isoDate: string;
  tooltip?: boolean;
};

function DisplayUTCDate({ isoDate, tooltip = false }: DisplayUTCDateProps) {
  return (
    <Tooltip
      title={
        tooltip && (
          <span className="flex text-center">
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
