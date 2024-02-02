import React, { PropsWithChildren } from 'react';
import { render as rtlRender } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { GCContextProvider } from '../../src/contexts';
import { ConnectionStatus } from '../../src/utils/gc/connectivity';
import { SWRConfig } from 'swr';

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
