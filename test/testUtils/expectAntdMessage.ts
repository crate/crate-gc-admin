import { waitFor } from '@testing-library/react';

/**
 * Assert an antd message toast with the given text is visible.
 * Uses the appear-active wrapper because showSuccessMessage() calls
 * message.destroy() then message.success(), leaving a leave-active
 * and appear-active "Copied" in the DOM at the same time.
 */
export async function expectAntdMessage(text: string) {
  await waitFor(() => {
    const active = document.querySelector('.ant-message-move-up-appear-active');
    expect(active).toHaveTextContent(text);
  });
}
