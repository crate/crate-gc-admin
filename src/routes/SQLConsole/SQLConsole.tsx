import React, { useCallback, useContext, useState } from 'react';
import SQLEditor from '../../components/SQLEditor/SQLEditor';
import execSql, { QueryResults } from '../../utilities/gc/execSql';
import SQLResultsTable from '../../components/SQLEditor/SQLResultsTable';
import { GCContext } from '../../utilities/context';
import { Spin } from 'antd';
import { Heading } from '@crate.io/crate-ui-components';

function SQLConsole() {
  const { sqlUrl } = useContext(GCContext);

  const specifiedQuery = new URLSearchParams(location.search).get('q');

  const [results, setResults] = useState<QueryResults | QueryResults[] | undefined>(
    undefined,
  );
  const [running, setRunning] = useState(false);

  const execute = useCallback(
    (sql: string) => {
      setRunning(true);
      setResults(undefined);
      execSql(sqlUrl, sql).then(({ data }) => {
        setRunning(false);
        setResults(data);
      });
    },
    [sqlUrl],
  );

  const renderResults = () => {
    if (running) {
      return <Spin />;
    }
    return <SQLResultsTable results={results} />;
  };

  return (
    <>
      <Heading level="h1" className="mb-2">
        Console
      </Heading>
      <SQLEditor execCallback={execute} results={results} value={specifiedQuery} />
      <div className="mt-4">{renderResults()}</div>
    </>
  );
}

export default SQLConsole;
