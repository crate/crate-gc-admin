import { useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { NoDataView, SQLEditor, SQLHistory, SQLResults } from 'components';
import useExecuteMultiSql from 'hooks/useExecuteMultiSql';
import useJWTManagerStore from 'state/jwtManager';
import { SQL_EDITOR_QUERIES_QUOTA } from 'constants/defaults';
import { SqlEditorHistoryEntry } from 'types/localStorage';

const getAndMigrateHistory = (
  oldHistoryKey: string,
  oldTempHistoryKey: string,
  newHistoryKey: string,
  clusterId: string | undefined,
): SqlEditorHistoryEntry[] => {
  // get old and new history
  const oldHistory: string[] = JSON.parse(
    localStorage.getItem(oldHistoryKey) || '[]',
  );
  let newHistory: SqlEditorHistoryEntry[] = JSON.parse(
    localStorage.getItem(newHistoryKey) || '[]',
  );

  // migrate old history
  oldHistory.forEach(query => {
    newHistory.push({
      clusterId,
      query,
    });
  });

  // get last SQL_EDITOR_QUERIES_QUOTA items
  newHistory = newHistory.slice(-SQL_EDITOR_QUERIES_QUOTA);

  // save new history
  localStorage.setItem(newHistoryKey, JSON.stringify(newHistory));

  // remove old history
  localStorage.removeItem(oldHistoryKey);
  localStorage.removeItem(oldTempHistoryKey);

  return newHistory;
};

type SQLConsoleProps = {
  onQuery?: () => void;
  onViewHistory?: () => void;
  onDownloadResult?: (format: 'csv' | 'json') => void;
};

function SQLConsole({ onQuery, onViewHistory, onDownloadResult }: SQLConsoleProps) {
  const { executeSqlWithStatus, queryResults, resetResults } = useExecuteMultiSql();
  const specifiedQuery = new URLSearchParams(location.search).get('q');
  const [showHistory, setShowHistory] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  const [rerender, setRerender] = useState(false);
  const outerHeight = useRef(null);
  const innerHeight = useRef(null);
  const clusterId = useJWTManagerStore(state => state.clusterId);

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
  const OLD_SQL_HISTORY_CONTENT_KEY = `crate.gc.admin.${LOCAL_STORAGE_KEY}-history.${clusterId || ''}`;
  const OLD_TEMP_SQL_HISTORY_CONTENT_KEY = `crate.gc.admin.${LOCAL_STORAGE_KEY}-history-temp.${clusterId || ''}`;
  const SQL_HISTORY_CONTENT_KEY = `crate.gc.admin.${LOCAL_STORAGE_KEY}-history`;
  const history = getAndMigrateHistory(
    OLD_SQL_HISTORY_CONTENT_KEY,
    OLD_TEMP_SQL_HISTORY_CONTENT_KEY,
    SQL_HISTORY_CONTENT_KEY,
    clusterId,
  );

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
              results={queryResults ? queryResults : undefined}
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
          {queryResults && (
            <SQLResults results={queryResults} onDownloadResult={onDownloadResult} />
          )}
          {!queryResults && <NoDataView />}
        </Panel>
      </PanelGroup>
      <SQLHistory
        history={history.filter(el => el.clusterId === clusterId)}
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
