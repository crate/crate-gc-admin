import React, { useCallback, useContext, useState } from 'react';
import SQLEditor from '../../components/SQLEditor/SQLEditor';
import execSql, { QueryResults } from '../../utilities/gc/execSql';
import SQLResultsTable from '../../components/SQLEditor/SQLResultsTable';
import { GCContext } from '../../utilities/context';
import { Spin } from 'antd';

function SQLConsole() {
  const { sqlUrl } = useContext(GCContext);

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
      <SQLEditor execCallback={execute} results={results} />
      <div className="mt-4">{renderResults()}</div>
    </>
  );
}

export default SQLConsole;
