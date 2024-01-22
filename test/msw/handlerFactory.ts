import { DefaultBodyType, RestHandler, rest } from 'msw';

export type HandlerFactoryType = (respondWith: DefaultBodyType) => RestHandler;

export default function handlerFactory(url: string): HandlerFactoryType {
  return (respondWith: DefaultBodyType) =>
    rest.get(url, (_, res, ctx) => res(ctx.json(respondWith)));
}
