import React, { PropsWithChildren } from 'react';
import { render as rtlRender, screen as rtlScreen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ConnectionStatus, GCContextProvider } from 'contexts';
import { SWRConfig } from 'swr';
import { GRAND_CENTRAL_SESSION_TOKEN_KEY } from 'constants/session';

type RenderType = {
  user: UserEvent;
  container: HTMLElement;
};

const render = (ui: React.ReactElement, { ...options } = {}): RenderType => {
  const TestWrapper = ({ children }: PropsWithChildren) => {
    const gcUrl = '';

    return (
      <main>
        <SWRConfig
          value={{
            fetcher: (resource, init) =>
              fetch(resource, init).then(res => res.json()),
            provider: () => new Map(),
            isVisible() {
              return true;
            },
          }}
        >
          <GCContextProvider
            gcUrl={gcUrl}
            crateUrl={'CRATE_URL'}
            gcStatus={ConnectionStatus.CONNECTED}
            headings
            sessionTokenKey={GRAND_CENTRAL_SESSION_TOKEN_KEY}
          >
            {children}
          </GCContextProvider>
        </SWRConfig>
      </main>
    );
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

// Override screen object
type TScreen = typeof rtlScreen & {
  getByName: (name: string) => Element | null;
};
const screen: TScreen = {
  ...rtlScreen,
  getByName: (name: string) => {
    return document.querySelector(`[name=${name}]`);
  },
};

// override render method and screen object
export { render, screen };
