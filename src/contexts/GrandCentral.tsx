import React, { PropsWithChildren, useContext } from 'react';

type GCContextType = {
  gcStatus: ConnectionStatus;
  gcUrl?: string;
  crateUrl?: string;
  headings?: boolean;
  onGcApiJwtExpire?: () => Promise<void>;
};

export enum ConnectionStatus {
  CONNECTED,
  NOT_CONFIGURED,
  NOT_LOGGED_IN,
  ERROR,
  PENDING,
}

const defaultProps: GCContextType = {
  gcStatus: ConnectionStatus.PENDING,
  gcUrl: process.env.REACT_APP_GRAND_CENTRAL_URL,
  crateUrl: undefined,
  headings: true,
};

const GCContext = React.createContext<GCContextType>(defaultProps);

export const GCContextProvider = ({
  children,
  ...restOfProps
}: PropsWithChildren<GCContextType>) => {
  return (
    <GCContext.Provider
      value={{
        ...defaultProps,
        ...restOfProps,
      }}
    >
      {children}
    </GCContext.Provider>
  );
};

export const useGCContext = () => {
  return useContext(GCContext);
};
