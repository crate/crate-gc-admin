import { useEffect, useMemo, useState } from 'react';
import AceEditor from 'react-ace';
import { Tree } from 'antd';
import { ApartmentOutlined, TableOutlined } from '@ant-design/icons';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CaretRightOutlined, FormatPainterOutlined } from '@ant-design/icons';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import './mode-cratedb';
import { format as formatSQL } from 'sql-formatter';
import { Ace } from 'ace-builds';
import Button from 'components/Button';
import { cn } from 'utils';
import { annotate } from './annotationUtils';
import { QueryResults } from 'types/query';
import { SchemaTableColumn } from 'types/cratedb';
import { useGetTableColumnsQuery } from 'hooks/queryHooks';

type SQLEditorProps = {
  value?: string | undefined | null;
  results: QueryResults;
  localStorageKey?: string;
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
  errorMessage?: React.ReactNode;
  showRunButton?: boolean;
  runButtonLabel?: string;
  onExecute: (queries: string) => void;
  onChange?: (queries: string) => void;
  setShowHistory?: (show: boolean) => void;
  title?: React.ReactNode;
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
  runButtonLabel = 'Execute',
  'aria-invalid': ariaInvalid,
  errorMessage,
  onExecute,
  onChange,
  setShowHistory,
  title,
}: SQLEditorProps) {
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
        icon: <TableOutlined className="relative -top-1.5 size-3 opacity-50" />,
        key: `${schema}.${table}`,
        children: getColumns(schema, table),
      }));
    };

    const schemas: string[] = [...new Set(input.map(i => i?.table_schema))];
    setTableTree(
      schemas.map(schema => ({
        title: schema,
        key: schema,
        icon: <ApartmentOutlined className="relative -top-1.5 size-3 opacity-50" />,
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
      ace.focus();
    }
  };

  // onChange method
  const onValueChange = (newValue: string) => {
    // It updates current state and call onChange
    setSql(newValue);

    if (onChange) {
      onChange(newValue);
    }
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
      <div className="ml-2 flex flex-col flex-wrap items-end justify-end text-xs">
        {historyString && <span className="whitespace-nowrap">{historyString}</span>}
        <span className="whitespace-nowrap">{executeString}</span>
      </div>
    );
  };

  return (
    <PanelGroup direction="horizontal">
      <Panel>
        <div className="ant-tree-tiny h-full overflow-auto p-2">
          {/* wait for tablesTree to be ready else defaultExpandedKeys won't work */}
          {tablesTree && tablesTree.length > 0 && (
            <Tree selectable={false} showIcon treeData={tablesTree} />
          )}
        </div>
      </Panel>
      <PanelResizeHandle className="flex w-1 flex-col justify-center bg-neutral-200 hover:bg-crate-blue">
        <div className="h-10 w-full bg-crate-blue" />
      </PanelResizeHandle>
      <Panel defaultSize={85} minSize={25}>
        <div className="flex h-full flex-col">
          {title}
          <div
            className={cn('flex-auto border-b', {
              'border-red-600': ariaInvalid,
            })}
          >
            <AceEditor
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
              defaultValue={sql}
              editorProps={{ $blockScrolling: true }}
              enableLiveAutocompletion
              fontSize={16}
              height="100%"
              highlightActiveLine
              mode="cratedb"
              onChange={onValueChange}
              onLoad={editor => {
                setAce(editor);
              }}
              setOptions={{
                showLineNumbers: true,
                tabSize: 2,
                showPrintMargin: false,
              }}
              style={{
                fontFamily:
                  "'Menlo', 'Monaco', 'Ubuntu Mono', 'Consolas', 'Source Code Pro', 'source-code-pro', monospace",
                minHeight: '48px',
              }}
              theme="github"
              width="100%"
            />
          </div>
          <div className="p-0">
            {errorMessage}
            <div className="flex w-full items-center justify-between px-2 py-1.5">
              <div className="flex items-center gap-2 ">
                {showRunButton && (
                  <Button kind="primary" size="small" onClick={() => exec(sql)}>
                    <CaretRightOutlined className="mr-2" />
                    {runButtonLabel}
                  </Button>
                )}
                <Button kind="secondary" size="small" onClick={formatSql}>
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
      </Panel>
    </PanelGroup>
  );
}

export default SQLEditor;
