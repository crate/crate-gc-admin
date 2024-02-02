import axios from 'axios';
import { useGCContext } from '../contexts';

export default function useGcApi() {
  const { gcUrl, onGcApiJwtExpire } = useGCContext();

  const instance = axios.create({
    baseURL: gcUrl,
    withCredentials: true,
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
