import useSessionStore, { NotificationType } from '../state/session';

export type HttpMethod = 'DELETE' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'GET';
type HttpBody = unknown;
type HttpOptions = RequestInit;

export type ApiOutput<T> = {
  success: boolean;
  data: T | null;
  status: number;
};

const dispatchNotification = (type: NotificationType, message: string) => {
  useSessionStore.getState().setNotification(type, message);
};

const api = async <T>(
  url: string,
  method: HttpMethod,
  data: HttpBody,
  options: HttpOptions = {},
  notification = true,
): Promise<ApiOutput<T>> => {
  const response = await fetch(url, {
    method,
    body: data ? JSON.stringify(data) : null,
    headers: data
      ? {
          'Content-Type': 'application/json; charset=utf-8',
        }
      : {},
    ...options,
  });

  // update the output depending on the result of the fetch()
  let outputData: T | null = null;

  try {
    outputData = (await response.json()) as T;
  } catch (error) {
    // API returned an empty response: do nothing
  }

  const output: ApiOutput<T> = {
    success: response.ok,
    status: response.status,
    data: outputData,
  };

  // do not show a 404 error for invalid invitation tokens
  if (response.status === 404 && url.includes('/accept-invite/')) {
    output.success = false;
    return output;
  }

  if (!response.ok && notification) {
    if (response.status === 404) {
      dispatchNotification(
        'error',
        'The requested resource was not found. ' +
          'If the problem persists, please contact customer support.',
      );
    } else if (response.status >= 500) {
      dispatchNotification(
        'error',
        'An error occurred while accessing the server. ' +
          'Our team have been notified. Please try again later.',
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
export const apiDelete = async <T>(url: string, data: HttpBody, options = {}) =>
  api<T>(url, 'DELETE', data, options);
export const apiHead = async <T>(url: string, data: HttpBody, options = {}) =>
  api<T>(url, 'HEAD', data, options);
export const apiPatch = async <T>(url: string, data: HttpBody, options = {}) =>
  api<T>(url, 'PATCH', data, options);
export const apiPost = async <T>(
  url: string,
  data: HttpBody,
  options = {},
  notification = true,
) => api<T>(url, 'POST', data, options, notification);
export const apiPut = async <T>(url: string, data: HttpBody, options = {}) =>
  api<T>(url, 'PUT', data, options);
export const apiGet = async <T>(url: string, data: HttpBody, options = {}) =>
  api<T>(url, 'GET', data, options);
