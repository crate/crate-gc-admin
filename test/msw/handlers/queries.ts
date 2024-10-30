import { RestHandler, rest } from 'msw';
import {
  getTablesColumnsResult,
  getTablesDDLQueryResult,
  getViewsDDLQueryResult,
  queryResult,
} from 'test/__mocks__/query';

import { useAllocationsMock } from 'test/__mocks__/useAllocationsMock';
import { useCurrentUserMock } from 'test/__mocks__/useCurrentUserMock';
import { useClusterInfoMock } from 'test/__mocks__/useClusterInfoMock';
import { useClusterNodeStatusMock } from 'test/__mocks__/useClusterNodeStatusMock';
import { useQueryStatsMock } from 'test/__mocks__/useQueryStatsMock';
import { useSchemaTreeMock } from 'test/__mocks__/useSchemaTreeMock';
import { useShardsMock } from 'test/__mocks__/useShardsMock';
import { useTablesMock } from 'test/__mocks__/useTablesMock';
import { useTablesShardsMock } from 'test/__mocks__/useTablesShardsMock';
import { useUsersRolesMock } from 'test/__mocks__/useUsersRolesMock';

import handlerFactory from 'test/msw/handlerFactory';
import {
  getTablesColumnsQuery,
  getTablesDDLQuery,
  getViewsDDLQuery,
} from 'constants/queries';

const executeJWTQueryPost: RestHandler = rest.post(
  'http://localhost:4200/_sql',
  async (req, res, ctx) => {
    const ident = req.url.searchParams
      .get('ident')
      ?.split('/')
      .slice(0, 2)
      .join('/');
    let result: null | object = null;

    switch (ident) {
      case '/console-query':
        result = {
          col_types: [],
          cols: [],
          rows: [],
          rowcount: 0,
          duration: 123.45,
        };
        break;
      case '/ddl-table-query':
        result = getTablesDDLQueryResult;
        break;
      case '/ddl-view-query':
        result = getViewsDDLQueryResult;
        break;
      case '/use-allocations':
        result = useAllocationsMock;
        break;
      case '/use-cluster-info':
        result = useClusterInfoMock;
        break;
      case '/use-cluster-node-status':
        result = useClusterNodeStatusMock;
        break;
      case '/use-current-user':
        result = useCurrentUserMock;
        break;
      case '/use-query-stats':
        result = useQueryStatsMock;
        break;
      case '/use-schema-tree':
        result = useSchemaTreeMock;
        break;
      case '/use-shards':
        result = useShardsMock;
        break;
      case '/use-tables':
        result = useTablesMock;
        break;
      case '/use-tables-shards':
        result = useTablesShardsMock;
        break;
      case '/use-users-roles':
        result = useUsersRolesMock;
        break;
      default:
        result = queryResult; // todo
    }

    return res(ctx.status(200), ctx.json(result));
  },
);

const executeQueryPost: RestHandler = rest.post(
  '/api/_sql',
  async (req, res, ctx) => {
    const body = await req.json();

    let result: null | object = null;

    switch (body.stmt) {
      case getTablesDDLQuery('new_schema', 'new_table'):
        result = getTablesDDLQueryResult;
        break;
      case getViewsDDLQuery('new_schema', 'new_view'):
        result = getViewsDDLQueryResult;
        break;
      case getTablesColumnsQuery:
        result = getTablesColumnsResult;
        break;
      default:
        result = queryResult;
        break;
    }

    return res(ctx.status(200), ctx.json(result));
  },
);

export const executeJWTQueryHandlers: RestHandler[] = [executeJWTQueryPost];
export const executeQueryHandlers: RestHandler[] = [executeQueryPost];

export const customExecuteQueryResponse = handlerFactory('/api/_sql', 'POST');
