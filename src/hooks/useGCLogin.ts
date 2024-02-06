import { apiGet } from '../utils/api';
import Cookies from 'js-cookie';
import { GRAND_CENTRAL_TOKEN_COOKIE } from '../constants/cookie';
import axios from 'axios';

const authApi = axios.create();

export type GCLoginParams = {
  token: string;
  refresh?: string | null;
  gcUrl: string;
};
export default function useGCLogin() {
  return async ({ token, refresh, gcUrl }: GCLoginParams) => {
    let qs = `?token=${encodeURIComponent(token)}`;
    if (refresh) {
      qs += `&refresh=${encodeURIComponent(refresh)}`;
    }
    try {
      const res = await apiGet(authApi, `${gcUrl}/api/auth${qs}`, {});
      if (res.success && res.status == 200) {
        Cookies.set(GRAND_CENTRAL_TOKEN_COOKIE, token);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };
}
