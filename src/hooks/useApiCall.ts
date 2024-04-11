import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import {
  ApiOutput,
  HttpBody,
  HttpMethod,
  HttpOptions,
  apiDelete,
  apiGet,
  apiHead,
  apiPatch,
  apiPost,
  apiPut,
} from 'utils';

type CommonUseApiCallProps = {
  axiosInstance: AxiosInstance;
  url: string;
  options?: HttpOptions;
};
type BodyApiCallProps = {
  method: Exclude<HttpMethod, 'GET'>;
  body?: HttpBody;
};
type WithoutBodyApiCallProps = {
  method: 'GET';
};

type UseApiCallProps = CommonUseApiCallProps &
  (WithoutBodyApiCallProps | BodyApiCallProps);

export const useApiCall = <T>(props: UseApiCallProps) => {
  const { method, axiosInstance, url, options } = props;
  const [response, setResponse] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApiResponse = (data: ApiOutput<T>) => {
    setLoading(false);
    setResponse(data.data);
  };

  useEffect(() => {
    setLoading(true);
    switch (method) {
      case 'GET':
        apiGet<T>(axiosInstance, url, options).then(handleApiResponse);
        break;
      case 'POST':
        apiPost<T>(axiosInstance, url, props.body, options).then(handleApiResponse);
        break;
      case 'PUT':
        apiPut<T>(axiosInstance, url, props.body, options).then(handleApiResponse);
        break;
      case 'PATCH':
        apiPatch<T>(axiosInstance, url, props.body, options).then(handleApiResponse);
        break;
      case 'DELETE':
        apiDelete<T>(axiosInstance, url, props.body, options).then(
          handleApiResponse,
        );
        break;
      case 'HEAD':
        apiHead<T>(axiosInstance, url, props.body, options).then(handleApiResponse);
        break;
    }
  }, []);

  return {
    data: response,
    loading,
  };
};
