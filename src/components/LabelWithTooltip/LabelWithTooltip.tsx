import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { colors } from 'constants/colors';
import { TooltipPlacement } from 'antd/es/tooltip';

export type TLabelWithTooltip = {
  message: React.ReactNode;
  label: React.ReactNode;
  tooltipPlacement?: TooltipPlacement;
  showIcon?: boolean;
};

function LabelWithTooltip({
  message,
  label,
  tooltipPlacement = 'topRight',
  showIcon = true,
}: TLabelWithTooltip) {
  return (
    <div className="inline-block">
      <Tooltip
        title={message}
        placement={tooltipPlacement}
        align={{ offset: [12, 0] }}
      >
        <div className="flex items-center">
          <span className="mr-1">{label}</span>
          {showIcon && <InfoCircleOutlined style={{ color: colors.crateBlue }} />}
        </div>
      </Tooltip>
    </div>
  );
}

export default LabelWithTooltip;
