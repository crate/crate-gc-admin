import { useEffect, useMemo, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import { format as formatSQL } from 'sql-formatter';
import { Button } from '@crate.io/crate-ui-components';
import { Ace } from 'ace-builds';
import { QueryResults } from '../../utils/gc/executeSql';
import { CaretRightOutlined, FormatPainterOutlined } from '@ant-design/icons';

type SQLEditorProps = {
  value?: string | undefined | null;
  results: QueryResults;
  localStorageKey?: string;
  showRunButton?: boolean;
  onExecute: (queries: string) => void;
  onChange?: (queries: string) => void;
};

const annotate = (
  ace: Ace.Editor,
  results: QueryResults,
  text: string,
  localStorageKey?: string,
): Ace.Annotation[] | undefined => {
  if (!results) {
    return;
  }

  // Update Local Storage
  if (localStorageKey) {
    localStorage.setItem(localStorageKey, text);
  }

  if (Array.isArray(results)) {
    const err = results.find(r => r.error);
    if (!err) {
      return;
    }
    const q = err.original_query;
    if (!q) {
      return;
    }
    // we take the 1st 100 lines and see if any of them are contained in the
    // query that failed. A rather naive approach.
    const lines = ace.getSession().getLines(0, 100);
    const trimmed = q.trim();
    const pos = lines
      .map((v, i) => {
        const search = v.trim();
        if (search.length > 0 && trimmed.startsWith(search)) {
          return i;
        }
        return -1;
      })
      .find(v => v > 0);
    if (pos) {
      return [
        {
          row: pos,
          column: 0,
          text: err.error?.message || '',
          type: 'error',
        },
      ];
    }
    return;
  }

  if (results.error) {
    // We always show the 1st line and 1st column as the source of the error.
    return [
      {
        row: 0,
        column: 0,
        text: results.error.message,
        type: 'error',
      },
    ];
  }
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
  onExecute,
  onChange,
}: SQLEditorProps) {
  const SQL_EDITOR_CONTENT_KEY =
    localStorageKey && `crate.gc.admin.${localStorageKey}`;
  const SQL_HISTORY_CONTENT_KEY =
    localStorageKey && `crate.gc.admin.${localStorageKey}-history`;
  const SQL_HISTORY_TEMP_CONTENT_KEY =
    localStorageKey && `crate.gc.admin.${localStorageKey}-history-temp`;

  const dataFromLocalStorage = SQL_EDITOR_CONTENT_KEY
    ? localStorage.getItem(SQL_EDITOR_CONTENT_KEY)
    : undefined;
  const [sql, setSql] = useState<string>(
    getInitialValue(value, dataFromLocalStorage),
  );
  const [ace, setAce] = useState<Ace.Editor | undefined>(undefined);
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
  }, [results]);

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
    let strHistory = localStorage.getItem(SQL_HISTORY_CONTENT_KEY!);
    if (!strHistory) {
      strHistory = '[]';
    }
    let historyArray: string[] = JSON.parse(strHistory);
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

  return (
    <div className="w-full">
      <div className="border-2 rounded">
        {/* EDITOR */}
        <AceEditor
          height="300px"
          width="100%"
          mode="sql"
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

      <div className="w-full flex items-center justify-between mt-2">
        <div className="flex gap-2">
          {showRunButton && (
            <Button kind="primary" onClick={() => exec(sql)}>
              <CaretRightOutlined className="mr-2" />
              Run
            </Button>
          )}
          <Button kind="secondary" onClick={formatSql}>
            <FormatPainterOutlined className="mr-2" />
            Format SQL
          </Button>
        </div>
        <div className="ml-2 text-xs inline-flex">
          Ctrl(Cmd)+Enter to execute.{' '}
          {isLocalStorageUsed ? 'Ctrl(Cmd)+Up/Down to navigate history.' : null}
        </div>
      </div>
    </div>
  );
}

export default SQLEditor;
