// the state in this file is not persisted to localStorage
// currently used for API error notifications only

import { create } from 'zustand';
import { LoadAverage } from '../types/cratedb.ts';

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
};

const initialState = {
  notification: null,
  load: [],
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
