import { useEffect, useMemo, useState } from 'react';
import AceEditor from 'react-ace';
import { Tree } from 'antd';
import { CaretRightOutlined, FormatPainterOutlined } from '@ant-design/icons';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import './mode-cratedb';
import { format as formatSQL } from 'sql-formatter';
import { Ace } from 'ace-builds';
import Button from '../../components/Button';
import Text from '../../components/Text';
import cn from '../../utils/cn';
import { annotate } from './annotationUtils';
import { QueryResults } from '../../types/query';
import { SchemaTableColumn } from 'types/cratedb';
import { useGetTableColumnsQuery } from '../../hooks/queryHooks';

type SQLEditorProps = {
  value?: string | undefined | null;
  results: QueryResults;
  localStorageKey?: string;
  showRunButton?: boolean;
  runButtonLabel?: string;
  error?: React.ReactNode;
  onExecute: (queries: string) => void;
  onChange?: (queries: string) => void;
  setShowHistory?: (show: boolean) => void;
};

type AntDesignTreeItem = {
  title: string;
  key: string;
  children?: AntDesignTreeItem[];
};

const getInitialValue = (
  value: string | null | undefined,
  dataFromLocalStorage: string | null | undefined,
) => {
  if (typeof value !== 'undefined' && value !== null) {
    return value;
  } else return dataFromLocalStorage || '';
};

function SQLEditor({
  value,
  results,
  localStorageKey,
  showRunButton = true,
  error = undefined,
  runButtonLabel = 'Execute',
  onExecute,
  onChange,
  setShowHistory,
}: SQLEditorProps) {
  const MIN_LINES = 14;
  const MAX_LINES = 25;
  const STANDARD_EDITOR_LINEHEIGHT = 16;
  const TABLETREE_PADDING = 4;

  const SQL_EDITOR_CONTENT_KEY =
    localStorageKey && `crate.gc.admin.${localStorageKey}`;
  const SQL_HISTORY_CONTENT_KEY =
    localStorageKey && `crate.gc.admin.${localStorageKey}-history`;
  const SQL_HISTORY_TEMP_CONTENT_KEY =
    localStorageKey && `crate.gc.admin.${localStorageKey}-history-temp`;

  const getTableColumns = useGetTableColumnsQuery();
  const dataFromLocalStorage = SQL_EDITOR_CONTENT_KEY
    ? localStorage.getItem(SQL_EDITOR_CONTENT_KEY)
    : undefined;
  const [sql, setSql] = useState<string>(
    getInitialValue(value, dataFromLocalStorage),
  );
  const [ace, setAce] = useState<Ace.Editor | undefined>(undefined);
  const [tablesTree, setTableTree] = useState<AntDesignTreeItem[] | undefined>(
    undefined,
  );
  const [tablesTreeHeight, setTablesTreeHeight] = useState<number>(
    MIN_LINES * STANDARD_EDITOR_LINEHEIGHT + TABLETREE_PADDING,
  );

  const isLocalStorageUsed = useMemo(() => {
    return (
      typeof SQL_EDITOR_CONTENT_KEY !== 'undefined' &&
      typeof SQL_HISTORY_CONTENT_KEY !== 'undefined' &&
      typeof SQL_HISTORY_TEMP_CONTENT_KEY !== 'undefined'
    );
  }, [
    SQL_EDITOR_CONTENT_KEY,
    SQL_HISTORY_CONTENT_KEY,
    SQL_HISTORY_TEMP_CONTENT_KEY,
  ]);

  const constructTableTree = (input: SchemaTableColumn[]) => {
    const getColumns = (schema: string, table: string) => {
      return input
        .filter(i => i.table_schema === schema)
        .filter(i => i.table_name === table)
        .filter(column => !column.column_name?.endsWith(']'))
        .map(column => ({
          title: column.column_name,
          key: `${schema}.${table}.${column.column_name}`,
        }));
    };

    const getTables = (schema: string) => {
      const tables: string[] = [
        ...new Set(
          input.filter(i => i.table_schema === schema).map(i => i.table_name),
        ),
      ];

      return tables.map(table => ({
        title: table,
        key: `${schema}.${table}`,
        children: getColumns(schema, table),
      }));
    };

    const schemas: string[] = [...new Set(input.map(i => i?.table_schema))];
    setTableTree(
      schemas.map(schema => ({
        title: schema,
        key: schema,
        children: getTables(schema),
      })),
    );
  };

  useEffect(() => {
    getTableColumns().then(constructTableTree);
  }, []);

  useEffect(() => {
    /*
      We have to do this hack to reset the command used by the shortcut, because Ace
      keeps hang of it between re-renders and does not update. And it does need to
      update, i.e. if the URL to the backend changes.
     */
    if (!ace) {
      return;
    }
    ace.commands.byName.gcExec.exec = editor => exec(editor.getValue());
    setTableTreeHeight(); // editor is loaded, ensure table tree is the same height
  }, [ace, onExecute]);

  // Update annotations when results are ready
  useEffect(() => {
    if (!ace) {
      return;
    }
    // Compute and set Ace Editor annotations
    const ann = annotate(ace, results, sql, SQL_EDITOR_CONTENT_KEY);
    if (ann) {
      ace.getSession().setAnnotations(ann);
    } else {
      ace.getSession().clearAnnotations();
    }

    getTableColumns().then(constructTableTree);
  }, [results]);

  useEffect(() => {
    if (setShowHistory) {
      ace?.getSession().setValue(value || '');
    }
  }, [value]);

  const exec = (sql: string | null) => {
    if (!sql) {
      return;
    }
    if (isLocalStorageUsed) {
      localStorage.setItem(SQL_EDITOR_CONTENT_KEY!, sql);
      pushHistory(sql);
    }
    onExecute(sql);
    ace?.focus();
  };

  /*
  This keeps track of two states in local storage - the entire history and the
  currently navigating one. When we execute code, two things happen:
  1. We push it to the history
  2. We clear the currently navigating history

  As the user navigates (Ctrl+Up/Ctrl+Down) we keep updating the temporary history.
  Note that due to this being execute from within Ace, it suffers from the issue with
  stale closures. As a result, we cannot use useState() - until someone figures out a
  way to do that.
   */
  const pushHistory = (sql: string) => {
    if (!isLocalStorageUsed) {
      return;
    }
    const strHistory = localStorage.getItem(SQL_HISTORY_CONTENT_KEY!) || '[]';
    let historyArray: string[] = JSON.parse(strHistory);
    const last = historyArray.slice(-1);
    if (last.length > 0 && last[0] == sql) {
      // do not push if same as last
      return;
    }
    historyArray.push(sql);
    if (historyArray.length > 100) {
      historyArray = historyArray.slice(1); // remove the head
    }
    localStorage.setItem(SQL_HISTORY_CONTENT_KEY!, JSON.stringify(historyArray));
    localStorage.removeItem(SQL_HISTORY_TEMP_CONTENT_KEY!);
  };

  const popHistory = (reverse: boolean = false): string | undefined => {
    if (!isLocalStorageUsed) {
      return;
    }
    const history: string[] = JSON.parse(
      localStorage.getItem(SQL_HISTORY_CONTENT_KEY!) || '[]',
    );
    const tempHistory: string[] = JSON.parse(
      localStorage.getItem(SQL_HISTORY_TEMP_CONTENT_KEY!) || '[]',
    );
    let historyToUse = history;
    if (tempHistory.length > 0) {
      historyToUse = tempHistory;
    }
    if (reverse) {
      historyToUse = history.slice(0, tempHistory.length + 2);
    }
    const ret = historyToUse.pop();
    localStorage.setItem(
      SQL_HISTORY_TEMP_CONTENT_KEY!,
      JSON.stringify(historyToUse),
    );
    return ret;
  };

  const formatSql = () => {
    if (sql && ace) {
      const formatted = formatSQL(sql, { language: 'postgresql' });
      ace.getSession().setValue(formatted);
      setTableTreeHeight();
      ace.focus();
    }
  };

  const setTableTreeHeight = () => {
    if (!ace) {
      return;
    }

    const lineHeight = ace.renderer.lineHeight;
    const editorInnerHeight = ace.getSession().getScreenLength() * lineHeight;
    const minHeight = MIN_LINES * lineHeight;
    const maxHeight = MAX_LINES * lineHeight;

    const treeHeight = Math.max(Math.min(editorInnerHeight, maxHeight), minHeight);
    if (treeHeight != tablesTreeHeight - TABLETREE_PADDING) {
      setTablesTreeHeight(treeHeight + TABLETREE_PADDING);
    }
  };

  // onChange method
  const onValueChange = (newValue: string) => {
    // It updates current state and call onChange
    setSql(newValue);

    if (onChange) {
      onChange(newValue);
    }

    setTableTreeHeight();
  };

  const renderInstructions = () => {
    const isMac = navigator.userAgent.indexOf('Mac OS') != -1;

    const cmdChar = isMac ? '⌘' : 'Ctrl';

    const executeString = `${cmdChar} + ↵ to execute`;

    let historyString: string | null = null;
    if (isLocalStorageUsed) {
      historyString = `${cmdChar} + ↑/↓ to navigate history`;
    }

    return (
      <div className="ml-2 flex flex-col flex-wrap items-end justify-end text-sm">
        {historyString && <span className="whitespace-nowrap">{historyString}</span>}
        <span className="whitespace-nowrap">{executeString}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-[1fr_10fr] gap-2">
      <div>
        {/* important: keep the outer div so the grid expands correctly */}
        <div
          className="ant-tree-tiny h-full min-w-[100px] max-w-[360px] overflow-auto rounded border-2 p-1.5"
          style={{ maxHeight: tablesTreeHeight + 'px' }}
        >
          {/* wait for tablesTree to be ready else defaultExpandedKeys won't work */}
          {tablesTree && tablesTree.length > 0 && (
            <Tree selectable={false} treeData={tablesTree} />
          )}
        </div>
      </div>
      <div
        className={cn('flex-auto rounded border-2', {
          'border-red-600': error,
        })}
      >
        <AceEditor
          width="100%"
          minLines={MIN_LINES}
          maxLines={MAX_LINES}
          mode="cratedb"
          theme="github"
          fontSize={16}
          highlightActiveLine
          enableLiveAutocompletion
          editorProps={{ $blockScrolling: true }}
          defaultValue={sql}
          commands={[
            {
              name: 'gcExec',
              bindKey: {
                win: 'Ctrl-Enter',
                mac: 'Command-Enter',
                // @ts-expect-error type problem
                linux: 'Ctrl-Enter',
              },
              exec: editor => exec(editor.getValue()),
            },
            {
              name: 'gcPrev',
              bindKey: {
                win: 'Ctrl-Up',
                mac: 'Command-Up',
                // @ts-expect-error type problem
                linux: 'Ctrl-Up',
              },
              exec: editor => {
                const val = popHistory();
                if (val) {
                  editor.setValue(val);
                }
              },
            },
            {
              name: 'gcNext',
              bindKey: {
                win: 'Ctrl-Down',
                mac: 'Command-Down',
                // @ts-expect-error type problem
                linux: 'Ctrl-Down',
              },
              exec: editor => {
                const val = popHistory(true);
                if (val) {
                  editor.setValue(val);
                }
              },
            },
            {
              name: 'gcPrev',
              bindKey: {
                win: 'Ctrl-Up',
                mac: 'Command-Up',
                // @ts-expect-error type problem
                linux: 'Ctrl-Up',
              },
              exec: editor => {
                const val = popHistory();
                if (val) {
                  editor.setValue(val);
                }
              },
            },
            {
              name: 'gcNext',
              bindKey: {
                win: 'Ctrl-Down',
                mac: 'Command-Down',
                // @ts-expect-error type problem
                linux: 'Ctrl-Down',
              },
              exec: editor => {
                const val = popHistory(true);
                if (val) {
                  editor.setValue(val);
                }
              },
            },
          ]}
          setOptions={{
            showLineNumbers: true,
            tabSize: 2,
            showPrintMargin: false,
          }}
          onChange={onValueChange}
          onLoad={editor => {
            setAce(editor);
          }}
        />
      </div>

      <div>{/* purposefully empty */}</div>
      <div>
        {error && <Text className="w-full text-red-600">{error}</Text>}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {showRunButton && (
              <Button kind="primary" onClick={() => exec(sql)}>
                <CaretRightOutlined className="mr-2" />
                {runButtonLabel}
              </Button>
            )}
            <Button kind="secondary" onClick={formatSql}>
              <FormatPainterOutlined className="mr-2" />
              Format
            </Button>
            {setShowHistory && (
              <Button
                onClick={() => setShowHistory(true)}
                kind="tertiary"
                size="small"
              >
                Show history
              </Button>
            )}
          </div>
          {renderInstructions()}
        </div>
      </div>
    </div>
  );
}

export default SQLEditor;
