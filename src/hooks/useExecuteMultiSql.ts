import { sqlparse } from '@cratedb/cratedb-sqlparse';
import { Statement } from 'node_modules/@cratedb/cratedb-sqlparse/dist/parser';
import { QueryResult, QueryStatus, QueryStatusType } from 'types/query';
import useExecuteSql from './useExecuteSql';
import { HttpStatusCode } from 'axios';
import { useRef, useState } from 'react';

export type UpdateQueryResult = (result: QueryStatus[] | undefined) => void;

const parseQueries = (query: string) => {
  const stripSingleLineCommentsRegex = /^((\s)*--).*$/gm;
  return sqlparse(query.replace(stripSingleLineCommentsRegex, ''), false);
};

export default function useExecuteMultiSql() {
  // This state is used to keep track of the query execution(s).
  // Queries will be executed sequentially, this means that, for each query:
  // - status will be WAITING initially, since it is not executed yet
  // - it will pass in EXECUTING when the API call is made
  // - after getting the response, the status could be ERROR or SUCCESS
  // - if a query goes in ERROR, all the following ones will have NOT_EXECUTED status
  const [queryResults, setQueryResults] = useState<QueryStatus[] | undefined>([]);
  // The executionId is used to handle the fact that a user can execute a long query
  // and then execute a new query before the old query finishes;
  // this is used to avoid UI updating for "old" queries.
  const executionId = useRef(0);

  const executeSql = useExecuteSql();

  // This is used to update a query status,
  // only if this is the latest query executed by the user.
  const updateQueryStatus = (
    id: number,
    currentQueryStatus: QueryStatus[],
    resultIndex: number,
    status: QueryStatusType,
    result: QueryResult | undefined = undefined,
  ) => {
    // The update is done only if the execution ID is the same.
    if (executionId.current === id) {
      currentQueryStatus[resultIndex].status = status;
      currentQueryStatus[resultIndex].result = result;
      setQueryResults([...currentQueryStatus]);
    }
  };

  const executeSqlWithStatus = async (multipleQueries: string): Promise<void> => {
    // Get and update execution ID
    const id = executionId.current + 1;
    executionId.current = executionId.current + 1;

    // Parse queries
    let parsedQueries: Statement[];
    let errorStatement;
    try {
      parsedQueries = parseQueries(multipleQueries);
      errorStatement = parsedQueries.find(stmt => stmt.exception);
    } catch (e) {
      parsedQueries = [];
      errorStatement = {
        exception: { line: 1, message: 'Unable to parse queries' },
      };
    }

    if (errorStatement) {
      // set error
      setQueryResults([
        {
          status: 'ERROR',
          result: {
            error: {
              message: errorStatement.exception.message,
            },
            line: errorStatement.exception.line - 1,
          },
        } satisfies QueryStatus,
      ]);
      return;
    }

    // Initialize queries state (all in WAITING)
    const currentQueryStatus = parsedQueries.map(() => {
      return {
        status: 'WAITING',
        result: undefined,
      } as QueryStatus;
    });
    setQueryResults(currentQueryStatus);

    let hasError = false;
    // Execute each query sequentially
    for (const [queryIndex, singleQuery] of parsedQueries.entries()) {
      if (hasError) {
        // Error has happened in one of the previous queries,
        // set status to NOT_EXECUTED
        updateQueryStatus(id, currentQueryStatus, queryIndex, 'NOT_EXECUTED');
        continue;
      }

      // Update query status to EXECUTING
      updateQueryStatus(id, currentQueryStatus, queryIndex, 'EXECUTING');

      // call API
      const response = await executeSql(singleQuery.query);
      const data = {
        ...response.data,
        original_query: singleQuery,
      };
      const responseSuccess = response.status === HttpStatusCode.Ok;

      // Update query status
      updateQueryStatus(
        id,
        currentQueryStatus,
        queryIndex,
        responseSuccess ? 'SUCCESS' : 'ERROR',
        data as QueryResult,
      );

      // if query failed, then update hasError state
      if (!responseSuccess) {
        hasError = true;
      }
    }
  };

  return {
    executeSqlWithStatus,
    queryResults,
    resetResults: () => {
      setQueryResults(undefined);
    },
  };
}
