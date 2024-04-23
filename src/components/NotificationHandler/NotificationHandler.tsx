import { useEffect } from 'react';
import NotificationDescription from './NotificationDescription';
import useSessionStore, { NotificationType } from 'state/session';
import { LONG_MESSAGE_NOTIFICATION_DURATION } from 'constants/defaults';

import {
  infoNotification,
  warnNotification,
  errorNotification,
} from './notificationPresets';

function NotificationHandler() {
  const currNotification = useSessionStore(state => state.notification);
  const clearNotification = useSessionStore(state => state.clearNotification);

  useEffect(() => {
    const configureNotificationType = (type: NotificationType) => {
      switch (type) {
        case 'warn':
          return warnNotification;
        case 'error':
          return errorNotification;
        default:
          return infoNotification;
      }
    };

    if (currNotification) {
      const { type, description, ...rest } = currNotification;

      const notificationConfig = {
        description: <NotificationDescription messages={description} />,
        duration: LONG_MESSAGE_NOTIFICATION_DURATION,
        ...rest,
      };

      configureNotificationType(type || 'info')(notificationConfig);
      clearNotification();
    }
  }, [clearNotification, currNotification]);

  return null;
}

export default NotificationHandler;
