// the state in this file is not persisted to localStorage
// currently used for API error notifications only

import { create } from 'zustand';

type Notification = {
  type?: NotificationType;
  message: string;
  description?: string | React.ReactElement;
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

  // table results format
  tableResultsFormatPretty: boolean;
  setTableResultsFormatPretty: (pretty: boolean) => void;

  // error trace
  showErrorTrace: boolean;
  setShowErrorTrace: (showErrorTrace: boolean) => void;
};

const initialState = {
  notification: null,
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
