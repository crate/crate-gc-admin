import React, { PropsWithChildren, useContext } from 'react';
import { ConnectionStatus } from '../utils/gc/connectivity';

type GCContextType = {
  gcStatus: ConnectionStatus;
  gcUrl: string | undefined;
  crateUrl: string | undefined;
  sqlUrl: string | undefined;
  headings: boolean;
};

const GCContext = React.createContext<GCContextType>({
  gcStatus: ConnectionStatus.PENDING,
  gcUrl: process.env.REACT_APP_GRAND_CENTRAL_URL,
  crateUrl: 'http://localhost:4200',
  sqlUrl: undefined,
  headings: false,
});

export const GCContextProvider = ({
  children,
  ...restOfProps
}: PropsWithChildren<GCContextType>) => {
  return <GCContext.Provider value={restOfProps}>{children}</GCContext.Provider>;
};

export const useGCContext = () => {
  return useContext(GCContext);
};
