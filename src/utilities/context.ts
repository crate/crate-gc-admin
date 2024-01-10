import React from 'react';
import { ConnectionStatus } from './gc/connectivity';

export const GCContext = React.createContext({
  gcStatus: ConnectionStatus.PENDING,
  gcUrl: process.env.REACT_APP_GRAND_CENTRAL_URL,
  crateUrl: 'http://localhost:4200',
});
