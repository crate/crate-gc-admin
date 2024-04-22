import { Tooltip } from 'antd';
import { AVAILABLE_LIGHT_COLORS, COLOR_STYLES_MAP } from './StatusLightConstants';
import Text from '../Text';
import SolidLight from './SolidLight';
import PulsingLight from './PulsingLight';
import React from 'react';

export type StatusLightProps = {
  color: keyof typeof AVAILABLE_LIGHT_COLORS;
  pulse?: boolean;
  message?: React.JSX.Element | string;
  tooltip?: React.JSX.Element | string | undefined;
  testId?: string;
};

function StatusLight({
  color,
  pulse = false,
  message,
  tooltip = undefined,
  testId,
}: StatusLightProps) {
  const LightElement = pulse ? PulsingLight : SolidLight;

  return (
    <div data-testid={testId}>
      {tooltip ? (
        <Tooltip
          arrowPointAtCenter
          color="#fff"
          overlayStyle={{ maxWidth: '400px' }}
          placement="topLeft"
          title={<div className="text-black">{tooltip}</div>}
          trigger="hover"
        >
          <span>
            <LightElement className={COLOR_STYLES_MAP[color]} />
          </span>
        </Tooltip>
      ) : (
        <LightElement className={COLOR_STYLES_MAP[color]} />
      )}
      {message && <Text className="ml-1 inline">{message}</Text>}
    </div>
  );
}

StatusLight.colors = AVAILABLE_LIGHT_COLORS;

export default StatusLight;
