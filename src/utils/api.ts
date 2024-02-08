import useSessionStore, { NotificationType } from '../state/session';
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

export type HttpMethod = 'DELETE' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'GET';
type HttpBody = unknown;
type HttpOptions = AxiosRequestConfig;

export type ApiOutput<T> = {
  success: boolean;
  data: T | null;
  status: number;
  errors?: Record<string, string[]>;
};

const dispatchNotification = (type: NotificationType, message: string) => {
  useSessionStore.getState().setNotification(type, message);
};

const api = async <T>(
  instance: AxiosInstance,
  url: string,
  method: HttpMethod,
  data: HttpBody,
  options: HttpOptions = {},
  notification = true,
): Promise<ApiOutput<T>> => {
  let response: AxiosResponse<T>;
  try {
    response = await instance<T>({
      method,
      url,
      data,
      headers: data
        ? {
            'Content-Type': 'application/json; charset=utf-8',
          }
        : {},
      ...options,
    });
  } catch (e) {
    const axiosError = e as AxiosError<T>;
    response = axiosError.response!;
  }

  const responseOk = response.status >= 200 && response.status < 300;

  // update the output depending on the result of the fetch()
  const outputData: T | null = response.data || null;

  const output: ApiOutput<T> = {
    success: responseOk,
    status: response.status,
    data: outputData,
  };

  // do not show a 404 error for invalid invitation tokens
  if (response.status === 404 && url.includes('/accept-invite/')) {
    output.success = false;
    return output;
  }

  if (!responseOk && notification) {
    if (response.status === 404) {
      dispatchNotification('error', 'The requested resource was not found. ');
    } else if (response.status >= 500) {
      dispatchNotification(
        'error',
        'An error occurred while accessing the server. Please try again later.',
      );
    } else if (
      response.status >= 400 &&
      output.data &&
      typeof output.data === 'object' &&
      'message' in output.data
    ) {
      dispatchNotification('error', output.data!.message as string);
    }

    output.success = false;
  }

  return output;
};

// exported functions
export const apiDelete = async <T>(
  instance: AxiosInstance,
  url: string,
  data: HttpBody,
  options = {},
) => api<T>(instance, url, 'DELETE', data, options);
export const apiHead = async <T>(
  instance: AxiosInstance,
  url: string,
  data: HttpBody,
  options = {},
) => api<T>(instance, url, 'HEAD', data, options);
export const apiPatch = async <T>(
  instance: AxiosInstance,
  url: string,
  data: HttpBody,
  options = {},
) => api<T>(instance, url, 'PATCH', data, options);
export const apiPost = async <T>(
  instance: AxiosInstance,
  url: string,
  data: HttpBody,
  options = {},
  notification = true,
) => api<T>(instance, url, 'POST', data, options, notification);
export const apiPut = async <T>(
  instance: AxiosInstance,
  url: string,
  data: HttpBody,
  options = {},
  notification = true,
) => api<T>(instance, url, 'PUT', data, options, notification);
export const apiGet = async <T>(
  instance: AxiosInstance,
  url: string,
  data: HttpBody,
  options = {},
) => api<T>(instance, url, 'GET', data, options);
