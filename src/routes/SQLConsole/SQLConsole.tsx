import React, { useCallback, useContext, useEffect, useState } from 'react';
import SQLEditor from '../../components/SQLEditor/SQLEditor';
import GCStatusIndicator from '../../components/GCStatusIndicator/GCStatusIndicator';
import { ConnectionStatus } from '../../utilities/gc/connectivity';
import execSql, { QueryResults } from '../../utilities/gc/execSql';
import SQLResultsTable from '../../components/SQLEditor/SQLResultsTable';
import { GCContext } from '../../utilities/context';
import { Spin } from 'antd';

function SQLConsole() {
  const { gcStatus, gcUrl, crateUrl } = useContext(GCContext);

  const [url, setUrl] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<QueryResults | QueryResults[] | undefined>(
    undefined,
  );
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (gcStatus == ConnectionStatus.CONNECTED) {
      setUrl(`${gcUrl}/api/_sql?multi=true`);
    } else {
      setUrl(`${crateUrl}/_sql`);
    }
  }, [setUrl, gcStatus, gcUrl, crateUrl]);

  const execute = useCallback(
    (sql: string) => {
      setRunning(true);
      setResults(undefined);
      execSql(url, sql).then(({ data }) => {
        setRunning(false);
        setResults(data);
      });
    },
    [url],
  );

  const renderResults = () => {
    if (running) {
      return <Spin />;
    }
    return <SQLResultsTable results={results} />;
  };

  return (
    <>
      <GCStatusIndicator />
      <SQLEditor execCallback={execute} results={results} />
      <div className="mt-4">{renderResults()}</div>
    </>
  );
}

export default SQLConsole;
