// the state in this file is not persisted to localStorage
// currently used for API error notifications only

import { create } from 'zustand';
import { FSStats, LoadAverage } from '../types/cratedb';

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
  tableResultsFormat: string;
  setTableResultsFormat: (format: string) => void;
  showErrorTrace: boolean;
  setShowErrorTrace: (showErrorTrace: boolean) => void;
};

const initialState = {
  notification: null,
  load: [],
  fsStats: {},
  tableResultsFormat: 'pretty',
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
  setTableResultsFormat: (format: string) => {
    set({ tableResultsFormat: format });
  },
}));
export default useSessionStore;
