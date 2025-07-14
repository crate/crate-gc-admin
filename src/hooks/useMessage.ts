import { TOAST_NOTIFICATION_DURATION } from 'constants/defaults';
import { message } from 'antd';

/*

Why use this hook and not the built-in Ant Design one?

Because the built-in hook requires us to place a {contextHolder}
in the output of our document, adding a level of complexity we
don't need. Also, as we don't use a <ConfigProvider> to store Ant's
default values, we'd need to import the timeout duration in every
component that shows a message.

Doing it this way keep everything as simple as possible.

*/

export default function useMessage() {
  const showErrorMessage = (text: string) => {
    message.destroy();
    message.error(text, TOAST_NOTIFICATION_DURATION);
  };

  const showLoadingMessage = (text: string) => message.loading(text, 0);

  const showSuccessMessage = (text: string) => {
    message.destroy();
    message.success(text, TOAST_NOTIFICATION_DURATION);
  };

  return {
    showErrorMessage,
    showLoadingMessage,
    showSuccessMessage,
  };
}
