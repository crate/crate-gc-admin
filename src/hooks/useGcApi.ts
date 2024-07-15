import axios, { HttpStatusCode } from 'axios';
import Cookies from 'js-cookie';
import { useGCContext } from 'contexts';

const RENEW_JWT_CODES: HttpStatusCode[] = [
  HttpStatusCode.Unauthorized, // 401
  HttpStatusCode.Forbidden, // 403
];

export default function useGcApi() {
  const { gcUrl, onGcApiJwtExpire, sessionCookieName } = useGCContext();

  const instance = axios.create({
    baseURL: gcUrl,
    withCredentials: true,
  });

  instance.interceptors.request.use(config => {
    const token = Cookies.get(sessionCookieName);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
            RENEW_JWT_CODES.includes(err.response.status) &&
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
