import {
  getTablesColumnsQuery,
  getTablesDDLQuery,
  getViewsDDLQuery,
} from 'constants/queries';
import { DefaultBodyType, http, HttpResponse } from 'msw';
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

const getJWTQueryResult = (ident?: string | null): object => {
  const identMap: Record<string, object> = {
    '/console-query': {
      col_types: [],
      cols: [],
      rows: [],
      rowcount: 0,
      duration: 123.45,
    },
    '/ddl-table-query': getTablesDDLQueryResult,
    '/ddl-view-query': getViewsDDLQueryResult,
    '/use-allocations': useAllocationsMock,
    '/use-cluster-info': useClusterInfoMock,
    '/use-cluster-node-status': useClusterNodeStatusMock,
    '/use-current-user': useCurrentUserMock,
    '/use-query-stats': useQueryStatsMock,
    '/use-schema-tree': useSchemaTreeMock,
    '/use-shards': useShardsMock,
    '/use-tables': useTablesMock,
    '/use-tables-shards': useTablesShardsMock,
    '/use-users-roles': useUsersRolesMock,
  };
  return ident && identMap[ident] ? identMap[ident] : queryResult;
};

const executeJWTQueryPost = http.post(
  'http://localhost:4200/_sql',
  async ({ request }) => {
    const url = new URL(request.url);
    const ident = url.searchParams.get('ident')?.split('/').slice(0, 2).join('/');
    return HttpResponse.json(getJWTQueryResult(ident));
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

export const customExecuteJWTQueryResponse = (
  responses: Record<string, DefaultBodyType>,
) => {
  return http.post('http://localhost:4200/_sql', async ({ request }) => {
    const url = new URL(request.url);
    const ident = url.searchParams.get('ident')?.split('/').slice(0, 2).join('/');

    if (ident && responses[ident] !== undefined) {
      return HttpResponse.json(responses[ident]);
    }

    return HttpResponse.json(getJWTQueryResult(ident));
  });
};

export const executeJWTQueryHandlers = [executeJWTQueryPost];
export const executeQueryHandlers = [executeQueryPost];

export const customExecuteQueryResponse = handlerFactory('/api/_sql', 'POST');
