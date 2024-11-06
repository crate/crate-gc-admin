import { RestHandler, rest } from 'msw';
import {
  clusterInfoQueryResult,
  getTablesColumnsResult,
  getTablesDDLQueryResult,
  getUsersQueryResult,
  getViewsDDLQueryResult,
  queryResult,
  schemasQueryResult,
  shardsQueryResult,
  singleNodesQueryResult,
} from 'test/__mocks__/query';
import { clusterNode } from 'test/__mocks__/nodes';
import { shards } from 'test/__mocks__/shards';
import handlerFactory from 'test/msw/handlerFactory';
import {
  clusterInfoQuery,
  getPartitionedTablesQuery,
  getTablesColumnsQuery,
  getTablesDDLQuery,
  getViewsDDLQuery,
  nodesQuery,
  shardsQuery,
  usersQuery,
} from 'constants/queries';

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
      case getTablesDDLQuery('new_schema', 'new_table'):
        result = getTablesDDLQueryResult;
        break;
      case getViewsDDLQuery('new_schema', 'new_view'):
        result = getViewsDDLQueryResult;
        break;
      case getTablesColumnsQuery:
        result = getTablesColumnsResult;
        break;
      case usersQuery:
        result = getUsersQueryResult;
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
