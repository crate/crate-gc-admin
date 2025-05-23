// the state in this file is not persisted to localStorage
// currently used for API error notifications only

import { create } from 'zustand';
import { FSStats, LoadAverage } from 'types/cratedb';

type Notification = {
  type?: NotificationType;
  message: string;
  description?: string | React.ReactElement;
};

type SessionStore = {
  notification: Notification | null;
  clearNotification: () => void;
  setNotification: (
    type: NotificationType,
    message: string,
    description?: string,
  ) => void;
  load: LoadAverage[];
  fsStats: { [key: string]: FSStats };
  tableResultsFormatPretty: boolean;
  setTableResultsFormatPretty: (pretty: boolean) => void;
  showErrorTrace: boolean;
  setShowErrorTrace: (showErrorTrace: boolean) => void;
};

const initialState = {
  notification: null,
  load: [],
  fsStats: {},
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
  setShowErrorTrace: (showErrorTrace: boolean) => {
    set({ showErrorTrace });
  },
  setTableResultsFormatPretty: (pretty: boolean) => {
    set({ tableResultsFormatPretty: pretty });
  },
}));
export default useSessionStore;
