import { DefaultBodyType, http, HttpHandler, HttpResponse } from 'msw';

export type HandlerFactoryType = (respondWith: DefaultBodyType) => HttpHandler;

type MSWHttpMethod = 'GET' | 'POST';

export default function handlerFactory(
  url: string,
  method: MSWHttpMethod = 'GET',
): HandlerFactoryType {
  return (respondWith: DefaultBodyType) => {
    switch (method) {
      case 'GET': {
        return http.get(url, () => HttpResponse.json(respondWith));
      }
      case 'POST': {
        return http.post(url, () => HttpResponse.json(respondWith));
      }
    }
  };
}
