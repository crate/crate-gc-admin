import { useEffect, useState } from 'react';
import { Heading, Loader, SQLEditor, SQLHistory, SQLResults } from 'components';
import { useGCContext } from 'contexts';
import useExecuteSql from 'hooks/useExecuteSql';
import { QueryResults } from 'types/query';

function SQLConsole() {
  const executeSql = useExecuteSql();
  const { headings } = useGCContext();
  const specifiedQuery = new URLSearchParams(location.search).get('q');
  const [results, setResults] = useState<QueryResults | undefined>(undefined);
  const [running, setRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  const [rerender, setRerender] = useState(false);

  // if a query is specified in the URL, place it in the editor
  useEffect(() => {
    if (specifiedQuery && !currentQuery) {
      setCurrentQuery(specifiedQuery);
    }
  }, [specifiedQuery]);

  const execute = (sql: string) => {
    setRunning(true);
    setResults(undefined);

    const stripSingleLineCommentsRegex = /^((\s)*--).*$/gm;
    executeSql(sql.replace(stripSingleLineCommentsRegex, '')).then(({ data }) => {
      setRunning(false);
      if (data) {
        setResults(data);
      }
    });
  };

  const LOCAL_STORAGE_KEY = 'sql-editor';
  const SQL_HISTORY_CONTENT_KEY = `crate.gc.admin.${LOCAL_STORAGE_KEY}-history`;
  const history = JSON.parse(localStorage.getItem(SQL_HISTORY_CONTENT_KEY) || '[]');

  const clearHistory = () => {
    localStorage.removeItem(SQL_HISTORY_CONTENT_KEY);
    setRerender(!rerender); // force re-render
  };

  const removeHistoryItem = (index: number) => {
    history.splice(index, 1);
    localStorage.setItem(SQL_HISTORY_CONTENT_KEY, JSON.stringify(history));
    setRerender(!rerender); // force re-render
  };

  const displayHistoryItem = (query: string) => {
    setCurrentQuery(query);
    setResults(undefined);
    setShowHistory(false);
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
        localStorageKey={LOCAL_STORAGE_KEY}
        value={currentQuery}
        setShowHistory={setShowHistory}
      />
      <div className="mt-4">
        {running && <Loader />}
        {!running && <SQLResults results={results} />}
      </div>
      <SQLHistory
        history={history}
        showHistory={showHistory}
        clearHistory={clearHistory}
        removeHistoryItem={removeHistoryItem}
        displayHistoryItem={displayHistoryItem}
        setShowHistory={setShowHistory}
      />
    </div>
  );
}

export default SQLConsole;
