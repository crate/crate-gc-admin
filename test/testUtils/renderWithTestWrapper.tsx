import React, { PropsWithChildren } from 'react';
import { render as rtlRender } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

type RenderType = {
  user: UserEvent;
  container: HTMLElement;
};

const render = (ui: React.ReactElement, { ...options } = {}): RenderType => {
  const TestWrapper = ({ children }: PropsWithChildren) => {
    return <main>{children}</main>;
  };

  const { container } = rtlRender(ui, { wrapper: TestWrapper, ...options });

  const renderResult = {
    user: userEvent.setup(),
    container,
  };

  return renderResult;
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };
