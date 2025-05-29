// the state in this file is not persisted to localStorage
// currently used for API error notifications only

import { create } from 'zustand';
import { FSStats, LoadAverage } from 'types/cratedb';

type Notification = {
  type?: NotificationType;
  message: string;
  description?: string | React.ReactElement;
};

type ClusterHealth = {
  load: LoadAverage[];
  fsStats: { [key: string]: FSStats };
};

type SessionStore = {
  // notifications
  notification: Notification | null;
  clearNotification: () => void;
  setNotification: (
    type: NotificationType,
    message: string,
    description?: string,
  ) => void;

  // health
  clusterHealth: Record<string, ClusterHealth>;
  setClusterHealth: (clusterId: string, health: ClusterHealth) => void;

  // table results format
  tableResultsFormatPretty: boolean;
  setTableResultsFormatPretty: (pretty: boolean) => void;

  // error trace
  showErrorTrace: boolean;
  setShowErrorTrace: (showErrorTrace: boolean) => void;
};

const initialState = {
  notification: null,
  clusterHealth: {},
  tableResultsFormatPretty: true,
  showErrorTrace: false,
};

export type NotificationType = 'error' | 'warn' | 'info';

const useSessionStore = create<SessionStore>(set => ({
  ...initialState,

  clearNotification: () => {
    set({ notification: null });
  },
  setNotification: (
    type: NotificationType,
    message: string,
    description?: string,
  ) => {
    set({ notification: { type, message, description } });
  },
  setClusterHealth: (clusterId: string, health: ClusterHealth) => {
    set(state => {
      return {
        clusterHealth: {
          ...state.clusterHealth,
          [clusterId]: health,
        },
      };
    });
  },
  setShowErrorTrace: (showErrorTrace: boolean) => {
    set({ showErrorTrace });
  },
  setTableResultsFormatPretty: (pretty: boolean) => {
    set({ tableResultsFormatPretty: pretty });
  },
}));

export default useSessionStore;
