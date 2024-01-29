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
  fs_stats: { [key: string]: FSStats };
};

const initialState = {
  notification: null,
  load: [],
  fs_stats: {},
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
}));
export default useSessionStore;
