import { RestHandler, rest } from 'msw';
import { queryResult, schemasQueryResult } from '../../__mocks__/query';
import handlerFactory from '../handlerFactory';
import { getPartitionedTablesQuery } from 'constants/queries';

const executeQueryPost: RestHandler = rest.post(
  '/api/_sql',
  async (req, res, ctx) => {
    const body = await req.json();

    let result: null | object = null;

    switch (body.stmt) {
      case getPartitionedTablesQuery(false):
        result = schemasQueryResult;
        break;
      default:
        result = queryResult;
        break;
    }

    return res(ctx.status(200), ctx.json(result));
  },
);

export const executeQueryHandlers: RestHandler[] = [executeQueryPost];

export const customExecuteQueryResponse = handlerFactory('/api/_sql');
