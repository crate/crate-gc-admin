import { useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Loader, NoDataView, SQLEditor, SQLHistory, SQLResults } from 'components';
import useExecuteSql from 'hooks/useExecuteSql';
import { QueryResults } from 'types/query';

type SQLConsoleProps = { onQuery?: () => void; onViewHistory?: () => void };

function SQLConsole({ onQuery, onViewHistory }: SQLConsoleProps) {
  const executeSql = useExecuteSql();
  const specifiedQuery = new URLSearchParams(location.search).get('q');
  const [results, setResults] = useState<QueryResults | undefined>(undefined);
  const [running, setRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  const [rerender, setRerender] = useState(false);
  const outerHeight = useRef(null);
  const innerHeight = useRef(null);

  // if a query is specified in the URL, place it in the editor
  useEffect(() => {
    if (specifiedQuery && !currentQuery) {
      setCurrentQuery(specifiedQuery);
    }
  }, [specifiedQuery]);

  const execute = (sql: string) => {
    setRunning(true);
    setResults(undefined);
    if (onQuery) {
      onQuery();
    }

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
    <>
      <PanelGroup direction="vertical" ref={outerHeight}>
        <Panel defaultSize={40} minSize={5} ref={innerHeight}>
          <div className="h-full overflow-auto">
            <SQLEditor
              onExecute={execute}
              localStorageKey={LOCAL_STORAGE_KEY}
              results={results}
              setShowHistory={() => {
                if (onViewHistory) {
                  onViewHistory();
                }
                setShowHistory;
              }}
              value={currentQuery}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="flex h-1 justify-center bg-neutral-200 hover:bg-crate-blue">
          <div className="h-full w-10 bg-crate-blue" />
        </PanelResizeHandle>
        <Panel minSize={5}>
          <div className="h-full overflow-auto">
            {running && <Loader />}
            {!running && <SQLResults results={results} />}
            {!running && !results && <NoDataView />}
          </div>
        </Panel>
      </PanelGroup>
      <SQLHistory
        history={history}
        showHistory={showHistory}
        clearHistory={clearHistory}
        removeHistoryItem={removeHistoryItem}
        displayHistoryItem={displayHistoryItem}
        setShowHistory={setShowHistory}
      />
    </>
  );
}

export default SQLConsole;
