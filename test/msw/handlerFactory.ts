import { DefaultBodyType, RestHandler, rest } from 'msw';

export type HandlerFactoryType = (respondWith: DefaultBodyType) => RestHandler;

type MSWHttpMethod = 'GET' | 'POST';

export default function handlerFactory(
  url: string,
  method: MSWHttpMethod = 'GET',
): HandlerFactoryType {
  return (respondWith: DefaultBodyType) => {
    switch (method) {
      case 'GET': {
        return rest.get(url, (_, res, ctx) => res(ctx.json(respondWith)));
      }
      case 'POST': {
        return rest.post(url, (_, res, ctx) => res(ctx.json(respondWith)));
      }
    }
  };
}
