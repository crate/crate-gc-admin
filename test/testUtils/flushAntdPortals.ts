import { act } from '@testing-library/react';
import { message, notification } from 'antd';

/** Flush rc-motion leave animations for antd message/notification portals. */
export async function flushAntdPortals() {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  await act(async () => {
    message.destroy();
    notification.destroy();
  });
  // Three passes: each covers one rc-motion step (rAFs → STEP_ACTIVE → deadline
  // → goMotionEnd → antd removes message → React unmounts element).
  await act(async () => {
    vi.runAllTimers();
  });
  await act(async () => {
    vi.runAllTimers();
  });
  await act(async () => {
    vi.runAllTimers();
  });
  vi.useRealTimers();
}
