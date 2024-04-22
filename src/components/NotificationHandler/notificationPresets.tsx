import { message, notification } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React from 'react';
import {
  LONG_MESSAGE_NOTIFICATION_DURATION,
  SHORT_MESSAGE_NOTIFICATION_DURATION,
} from 'constants/defaults';
import { ArgsProps } from 'antd/es/notification';

type NotificationAntd = ArgsProps & {
  description?: string | React.ReactElement;
};

const baseNotification =
  (defaultConfig: Partial<NotificationAntd>) =>
  (overrideConfig: NotificationAntd = { message: '' }) => {
    const config = {
      duration:
        overrideConfig.description &&
        typeof overrideConfig.description === 'string' &&
        overrideConfig.description.length > 100
          ? LONG_MESSAGE_NOTIFICATION_DURATION
          : SHORT_MESSAGE_NOTIFICATION_DURATION,
      ...defaultConfig,
      ...overrideConfig,
    };
    message.destroy();
    setTimeout(() => {
      notification.open(config);
    });
  };

// classNames are used for testing hooks
// because SVGs are being mocked in the tests
export const infoNotification = baseNotification({
  icon: <ExclamationCircleOutlined className="text-crate-blue" />,
  className: 'cui-notification-info',
});

export const warnNotification = baseNotification({
  icon: <ExclamationCircleOutlined className="text-amber-500" />,
  className: 'cui-notification-warn',
});

export const errorNotification = baseNotification({
  icon: <ExclamationCircleOutlined className="text-red-500" />,
  className: 'cui-notification-error',
});
