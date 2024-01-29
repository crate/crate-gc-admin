import { useCallback, useState } from 'react';
import executeSql, { QueryResults } from '../../utils/gc/executeSql';
import Heading from '../../components/Heading';
import Loader from '../../components/Loader';
import SQLEditor from '../../components/SQLEditor/SQLEditor';
import SQLResultsTable from '../../components/SQLResultsTable';
import { useGCContext } from '../../contexts';

function SQLConsole() {
  const { sqlUrl, headings } = useGCContext();
  const specifiedQuery = new URLSearchParams(location.search).get('q');
  const [results, setResults] = useState<QueryResults | undefined>(undefined);
  const [running, setRunning] = useState(false);

  const execute = useCallback(
    (sql: string) => {
      setRunning(true);
      setResults(undefined);
      executeSql(sqlUrl, sql).then(({ data }) => {
        setRunning(false);
        if (data) {
          setResults(data);
        }
      });
    },
    [sqlUrl],
  );

  const renderResults = () => {
    if (running) {
      return <Loader />;
    }
    return <SQLResultsTable results={results} />;
  };

  return (
    <div>
      {headings && (
        <Heading level="h1" className="mb-2">
          Console
        </Heading>
      )}
      <SQLEditor
        onExecute={execute}
        results={results}
        localStorageKey="sql-editor"
        value={specifiedQuery}
      />
      <div className="mt-4">{renderResults()}</div>
    </div>
  );
}

export default SQLConsole;
