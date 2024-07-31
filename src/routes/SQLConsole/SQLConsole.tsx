import { useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { NoDataView, SQLEditor, SQLHistory, SQLResults } from 'components';
import useExecuteMultiSql from 'hooks/useExecuteMultiSql';
import { useGCContext } from 'contexts';

type SQLConsoleProps = {
  onQuery?: () => void;
  onViewHistory?: () => void;
};

function SQLConsole({ onQuery, onViewHistory }: SQLConsoleProps) {
  const { executeSqlWithStatus, queryResults, resetResults } = useExecuteMultiSql();
  const specifiedQuery = new URLSearchParams(location.search).get('q');
  const [showHistory, setShowHistory] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  const [rerender, setRerender] = useState(false);
  const outerHeight = useRef(null);
  const innerHeight = useRef(null);
  const { clusterId } = useGCContext();

  // if a query is specified in the URL, place it in the editor
  useEffect(() => {
    if (specifiedQuery && !currentQuery) {
      setCurrentQuery(specifiedQuery);
    }
  }, [specifiedQuery]);

  const execute = (sqlQueries: string) => {
    if (onQuery) {
      onQuery();
    }

    executeSqlWithStatus(sqlQueries);
  };

  const LOCAL_STORAGE_KEY = 'sql-editor';
  const SQL_HISTORY_CONTENT_KEY = `crate.gc.admin.${LOCAL_STORAGE_KEY}-history.${clusterId || ''}`;
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
    resetResults();
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
              results={
                queryResults
                  ? queryResults
                      .filter(el => el.result && 'error' in el.result)
                      .map(el => el.result!)
                  : undefined
              }
              setShowHistory={setShowHistory}
              onViewHistory={onViewHistory}
              value={currentQuery}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="flex h-1 justify-center bg-neutral-200 hover:bg-crate-blue">
          <div className="h-full w-10 bg-crate-blue" />
        </PanelResizeHandle>
        <Panel minSize={5}>
          <div className="h-full overflow-auto">
            {queryResults && <SQLResults results={queryResults} />}
            {!queryResults && <NoDataView />}
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
