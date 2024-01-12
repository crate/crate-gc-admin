import React, { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import { format as formatSQL } from 'sql-formatter';
import { Button } from '@crate.io/crate-ui-components';
import { Ace } from 'ace-builds';
import { QueryResults } from '../../utilities/gc/execSql';

type Params = {
  execCallback: (editorContents: string) => void;
  value?: string | undefined | null;
  results: QueryResults | QueryResults[] | undefined;
};

function SQLEditor({ execCallback, value, results }: Params) {
  const [editorContents, setEditorContents] = useState(
    value || localStorage.getItem('sql-editor'),
  );
  const [ace, setAce] = useState<Ace.Editor | undefined>(undefined);

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
  }, [ace, execCallback]);

  useEffect(() => {
    if (!ace) {
      return;
    }
    const ann = annotate();
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
    localStorage.setItem('sql-editor', sql);
    execCallback(sql);
    ace?.focus();
  };

  const formatEditorContents = () => {
    if (editorContents && ace) {
      const formatted = formatSQL(editorContents, { language: 'postgresql' });
      ace.getSession().setValue(formatted);
      ace.focus();
    }
  };

  const annotate = (): Ace.Annotation[] | undefined => {
    if (!ace) {
      return;
    }
    if (!results) {
      return;
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

  return (
    <div className="max-w-screen-xl">
      <div className="border-2 rounded">
        <AceEditor
          height="300px"
          width="100%"
          mode="sql"
          theme="github"
          fontSize={16}
          highlightActiveLine
          enableLiveAutocompletion
          editorProps={{ $blockScrolling: true }}
          defaultValue={value || editorContents || ''}
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
          ]}
          setOptions={{
            showLineNumbers: true,
            tabSize: 2,
            showPrintMargin: false,
          }}
          onChange={(newValue: string) => setEditorContents(newValue)}
          onLoad={editor => {
            setAce(editor);
          }}
        />
      </div>
      <div className="mt-2">
        <Button kind="primary" onClick={() => exec(editorContents)}>
          Run
        </Button>
        <Button className="ml-2" kind="secondary" onClick={formatEditorContents}>
          Format SQL
        </Button>
      </div>
    </div>
  );
}

export default SQLEditor;
