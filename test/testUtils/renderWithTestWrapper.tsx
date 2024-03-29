import React, { PropsWithChildren } from 'react';
import { render as rtlRender } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ConnectionStatus, GCContextProvider } from '../../src/contexts';
import { SWRConfig } from 'swr';
import { GRAND_CENTRAL_TOKEN_COOKIE } from '../../src/constants/cookie';

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
            sessionCookieName={GRAND_CENTRAL_TOKEN_COOKIE}
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

// override render method
export { render };
