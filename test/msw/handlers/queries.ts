import {
  getTablesColumnsQuery,
  getTablesDDLQuery,
  getViewsDDLQuery,
} from 'constants/queries';
import { http, HttpResponse } from 'msw';
import {
  getTablesColumnsResult,
  getTablesDDLQueryResult,
  getViewsDDLQueryResult,
  queryResult,
} from 'test/__mocks__/query';
import { useClusterNodeStatusMock } from 'test/__mocks__/useClusterNodeStatusMock';
import { useTablesShardsMock } from 'test/__mocks__/useTablesShardsMock';
import { useCurrentUserMock } from 'test/__mocks__/useCurrentUserMock';
import { useClusterInfoMock } from 'test/__mocks__/useClusterInfoMock';
import { useAllocationsMock } from 'test/__mocks__/useAllocationsMock';
import { useUsersRolesMock } from 'test/__mocks__/useUsersRolesMock';
import { useSchemaTreeMock } from 'test/__mocks__/useSchemaTreeMock';
import { useQueryStatsMock } from 'test/__mocks__/useQueryStatsMock';
import { useTablesMock } from 'test/__mocks__/useTablesMock';
import { useShardsMock } from 'test/__mocks__/useShardsMock';
import handlerFactory from 'test/msw/handlerFactory';

const executeJWTQueryPost = http.post(
  'http://localhost:4200/_sql',
  async ({ request }) => {
    const url = new URL(request.url);
    const ident = url.searchParams.get('ident')?.split('/').slice(0, 2).join('/');
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

    return HttpResponse.json(result);
  },
);

const executeQueryPost = http.post('/api/_sql', async ({ request }) => {
  const body = (await request.json()) as { stmt: string };

  let result: null | object = null;

  switch (body?.stmt) {
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

  return HttpResponse.json(result);
});

export const executeJWTQueryHandlers = [executeJWTQueryPost];
export const executeQueryHandlers = [executeQueryPost];

export const customExecuteQueryResponse = handlerFactory('/api/_sql', 'POST');
