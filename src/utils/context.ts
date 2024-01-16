import React, { useContext } from 'react';
import { ConnectionStatus } from './gc/connectivity';

type GCContextType = {
  gcStatus: ConnectionStatus;
  gcUrl: string | undefined;
  crateUrl: string | undefined;
  sqlUrl: string | undefined;
};

export const GCContext = React.createContext<GCContextType>({
  gcStatus: ConnectionStatus.PENDING,
  gcUrl: process.env.REACT_APP_GRAND_CENTRAL_URL,
  crateUrl: 'http://localhost:4200',
  sqlUrl: undefined,
});

export const useGCContext = () => {
  return useContext(GCContext);
};
