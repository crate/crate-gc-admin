import { apiGet } from '../utils/api';
import Cookies from 'js-cookie';
import axios from 'axios';

const authApi = axios.create();

export type GCLoginParams = {
  token: string;
  refresh?: string | null;
  gcUrl: string;
  sessionCookieName: string;
};
export default function useGCLogin() {
  return async ({ token, refresh, gcUrl, sessionCookieName }: GCLoginParams) => {
    let qs = `?token=${encodeURIComponent(token)}`;
    if (refresh) {
      qs += `&refresh=${encodeURIComponent(refresh)}`;
    }
    try {
      const res = await apiGet(authApi, `${gcUrl}/api/auth${qs}`);
      if (res.success && res.status == 200) {
        Cookies.set(sessionCookieName, token);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };
}
