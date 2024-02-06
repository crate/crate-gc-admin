import axios from 'axios';
import Cookies from 'js-cookie';
import { useGCContext } from '../contexts';
import { GRAND_CENTRAL_TOKEN_COOKIE } from '../constants/cookie.ts';

export default function useGcApi() {
  const { gcUrl, onGcApiJwtExpire } = useGCContext();

  const instance = axios.create({
    baseURL: gcUrl,
    withCredentials: true,
  });

  instance.interceptors.request.use(config => {
    const token = Cookies.get(GRAND_CENTRAL_TOKEN_COOKIE);
    if (token) {
      config.headers.Authorization = `Bearer ${Cookies.get(GRAND_CENTRAL_TOKEN_COOKIE)}`;
    }
    return config;
  });

  if (onGcApiJwtExpire) {
    instance.interceptors.response.use(
      res => res,
      async err => {
        const originalConfig = err.config;

        if (err.response) {
          // Check if Access Token was expired
          if (
            err.response.status === 401 &&
            !originalConfig._retry &&
            onGcApiJwtExpire
          ) {
            originalConfig._retry = true;

            try {
              await onGcApiJwtExpire();

              return instance(originalConfig);
            } catch (_error) {
              return Promise.reject(_error);
            }
          }
        }

        return Promise.reject(err);
      },
    );
  }

  return instance;
}
