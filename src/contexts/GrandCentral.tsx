import React, { PropsWithChildren, useContext } from 'react';
import { GRAND_CENTRAL_TOKEN_COOKIE } from 'constants/cookie';

type GCContextType = {
  gcStatus: ConnectionStatus;
  gcUrl?: string;
  crateUrl?: string;
  sessionCookieName: string;
  headings?: boolean;
  onGcApiJwtExpire?: () => Promise<void>;
  clusterId?: string;
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
  sessionCookieName: GRAND_CENTRAL_TOKEN_COOKIE,
  crateUrl: undefined,
  headings: true,
  clusterId: undefined,
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
