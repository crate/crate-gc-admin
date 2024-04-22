import { RestHandler, rest } from 'msw';
import {
  clusterInfoQueryResult,
  queryResult,
  schemasQueryResult,
  shardsQueryResult,
  singleNodesQueryResult,
} from '../../__mocks__/query';
import handlerFactory from '../handlerFactory';
import {
  clusterInfoQuery,
  getPartitionedTablesQuery,
  nodesQuery,
  shardsQuery,
} from 'constants/queries';
import { clusterNode } from 'test/__mocks__/nodes';
import { shards } from 'test/__mocks__/shards';

const executeQueryPost: RestHandler = rest.post(
  '/api/_sql',
  async (req, res, ctx) => {
    const body = await req.json();

    let result: null | object = null;

    switch (body.stmt) {
      case nodesQuery:
        result = singleNodesQueryResult(clusterNode);
        break;
      case clusterInfoQuery:
        result = clusterInfoQueryResult;
        break;
      case shardsQuery:
        result = shardsQueryResult(shards);
        break;
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

export const customExecuteQueryResponse = handlerFactory('/api/_sql', 'POST');
