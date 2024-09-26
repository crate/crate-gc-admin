import { useEffect, useMemo, useState } from 'react';
import AceEditor from 'react-ace';
import { Checkbox, Tree } from 'antd';
import {
  ApartmentOutlined,
  CaretRightOutlined,
  CloseCircleFilled,
  CompassOutlined,
  FilterOutlined,
  FormatPainterOutlined,
  SearchOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import './mode-cratedb';
import { format as formatSQL } from 'sql-formatter';
import { Ace } from 'ace-builds';
import { Popover, PopoverContent, PopoverTrigger } from 'components';
import { cn } from 'utils';
import { annotate } from './annotationUtils';
import { QueryResults } from 'types/query';
import { SchemaTableColumn } from 'types/cratedb';
import { useGetTableColumnsQuery } from 'hooks/queryHooks';
import { Loader, Text, Button, CopyToClipboard } from 'components';
import { SYSTEM_SCHEMAS } from 'constants/database';
import { useGCContext } from 'contexts';

export type SQLEditorProps = {
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
  onViewHistory?: () => void;
  title?: React.ReactNode;
};

type AntDesignTreeItem = {
  title: React.ReactNode;
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

type InternalTreeColumn = {
  column_name: string;
  data_type: string;
  path: string;
};

type InternalTreeTable = {
  table_name: string;
  table_type: string;
  path: string;
  columns: InternalTreeColumn[];
  is_system_table: boolean;
};

type InternalTreeSchema = {
  schema_name: string;
  path: string;
  tables: InternalTreeTable[];
};

const FILTER_TYPES = {
  TABLE: 'table',
  VIEW: 'view',
  FOREIGN: 'foreign',
  SYSTEM: 'system',
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
  onViewHistory,
  title,
}: SQLEditorProps) {
  const { clusterId } = useGCContext();

  const SQL_EDITOR_CONTENT_KEY =
    localStorageKey && `crate.gc.admin.${localStorageKey}.${clusterId || ''}`;
  const SQL_HISTORY_CONTENT_KEY =
    localStorageKey &&
    `crate.gc.admin.${localStorageKey}-history.${clusterId || ''}`;
  const SQL_HISTORY_TEMP_CONTENT_KEY =
    localStorageKey &&
    `crate.gc.admin.${localStorageKey}-history-temp.${clusterId || ''}`;

  const getTableColumns = useGetTableColumnsQuery();
  const dataFromLocalStorage = SQL_EDITOR_CONTENT_KEY
    ? localStorage.getItem(SQL_EDITOR_CONTENT_KEY)
    : undefined;
  const [sql, setSql] = useState<string>(
    getInitialValue(value, dataFromLocalStorage),
  );
  const [ace, setAce] = useState<Ace.Editor | undefined>(undefined);
  const [internalSchemaTree, setInternalSchemaTree] = useState<InternalTreeSchema[]>(
    [],
  );
  const [treeFilterSearch, setTreeFilterSearch] = useState<string>('');
  const [treeFilterType, setTreeFilterType] = useState<string[]>([
    FILTER_TYPES.TABLE,
    FILTER_TYPES.VIEW,
    FILTER_TYPES.FOREIGN,
    FILTER_TYPES.SYSTEM,
  ]);

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

  const constructSchemaTree = (input: SchemaTableColumn[]) => {
    const constructTables = (input: SchemaTableColumn[]) => {
      const tree: InternalTreeTable[] = [];

      // for convenience, create a lookup dict of the tables/columns in this schema
      const tableLookup: {
        [key: string]: {
          name: string;
          type: string;
          path: string;
          is_system_table: boolean;
        };
      } = input.reduce((prev, next) => {
        return {
          ...prev,
          [next.table_name]: {
            name: next.table_name as string,
            type: next.table_type,
            path: `${next.table_schema}.${next.table_name}`,
            schema: next.table_schema,
            is_system_table: SYSTEM_SCHEMAS.includes(next.table_schema),
          },
        };
      }, {});

      // loop through array of tables
      const tableNames = [...new Set(input.map(i => i.table_name))];
      tableNames.forEach(tableName => {
        tree.push({
          table_name: tableLookup[tableName].name,
          table_type: tableLookup[tableName].type,
          path: tableLookup[tableName].path,
          is_system_table: tableLookup[tableName].is_system_table,
          columns: input
            .filter(i => i.table_name === tableName)
            .map(column => ({
              column_name: column.column_name,
              data_type: column.data_type,
              path: `${tableLookup[tableName].path}.${column.column_name}`,
            })),
        });
      });

      return tree;
    };

    const constructSchemas = (input: SchemaTableColumn[]) => {
      const tree: InternalTreeSchema[] = [];

      // loop through array of unique schema names
      const schemaNames = [...new Set(input.map(i => i.table_schema))];
      schemaNames.forEach(schemaName => {
        tree.push({
          schema_name: schemaName,
          path: schemaName,
          tables: constructTables(input.filter(i => i.table_schema === schemaName)),
        });
      });

      return tree;
    };

    setInternalSchemaTree(constructSchemas(input));
  };

  useEffect(() => {
    getTableColumns().then(constructSchemaTree);
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
    ace.commands.byName.gcExec.exec = () => exec();
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

    getTableColumns().then(constructSchemaTree);
  }, [results]);

  useEffect(() => {
    if (setShowHistory) {
      ace?.getSession().setValue(value || '');
    }
  }, [value]);

  const exec = () => {
    const sql = ace?.getSelectedText().trim() || ace?.getValue() || '';
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

  const drawFilterCheckbox = (label: string, type: string) => (
    <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap">
      <Checkbox
        checked={treeFilterType.includes(type)}
        onChange={() => {
          updateFilterTypes(type);
        }}
        data-testid={`filter-checkbox-${type}`}
      />
      <span className="opacity-70">{label}</span>
    </label>
  );

  const updateFilterTypes = (type: string) => {
    if (treeFilterType.includes(type)) {
      const types = [...treeFilterType].filter(t => t !== type);
      if (types.length > 0) {
        setTreeFilterType(types);
      }
    } else {
      setTreeFilterType([...treeFilterType, type]);
    }
  };

  const filterTreeData = (tree: InternalTreeSchema[]) => {
    // if no filters are applied, return the full tree
    if (treeFilterSearch === '' && treeFilterType.length === 4) {
      return tree;
    }

    // filter: system tables
    if (!treeFilterType.includes(FILTER_TYPES.SYSTEM)) {
      tree = tree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table => !table.is_system_table),
      }));
    }

    // filter: tables
    if (!treeFilterType.includes(FILTER_TYPES.TABLE)) {
      tree = tree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table => table.table_type !== 'BASE TABLE'),
      }));
    }

    // filter: foreign tables
    if (!treeFilterType.includes(FILTER_TYPES.FOREIGN)) {
      tree = tree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table => table.table_type !== 'FOREIGN'),
      }));
    }

    // filter: views
    if (!treeFilterType.includes(FILTER_TYPES.VIEW)) {
      tree = tree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table => table.table_type !== 'VIEW'),
      }));
    }

    // filter: search string
    if (treeFilterSearch !== '') {
      const searchString = treeFilterSearch.toLowerCase();
      tree = tree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table =>
          table.path.toLowerCase().includes(searchString),
        ),
      }));
    }

    // tidy up: remove all empty schemas
    return tree.filter(schema => schema.tables.length > 0);
  };

  const drawTreeData = (): AntDesignTreeItem[] => {
    const drawColumn = (column: InternalTreeColumn) => (
      <span data-testid={column.path}>
        <CopyToClipboard textToCopy={column.column_name}>
          {column.column_name}
        </CopyToClipboard>
        <Text pale className="ml-1 inline text-xs italic !leading-3">
          {column.data_type}
        </Text>
      </span>
    );

    const drawTableIcon = (tableType: string) => {
      switch (tableType) {
        case 'FOREIGN':
          return <CompassOutlined className="mr-1 size-3 opacity-50" />;
        case 'VIEW':
          return <SearchOutlined className="mr-1 size-3 opacity-50" />;
        default:
          return <TableOutlined className="mr-1 size-3 opacity-50" />;
      }
    };

    const drawTableDescription = (tableType: string) => {
      switch (tableType) {
        case 'FOREIGN':
          return <div>foreign table</div>;
        case 'VIEW':
          return <div>view</div>;
        default:
          return <div>table</div>;
      }
    };

    const drawSchemaRow = (schema: InternalTreeSchema) => (
      <span
        className="flex cursor-default !leading-3"
        data-testid={`schema-${schema.schema_name}`}
      >
        <ApartmentOutlined className="mr-1.5 size-3 opacity-50" />
        {schema.schema_name}
        {schema.tables.find(table => table.is_system_table) && (
          <Text className="ml-1 inline text-xs italic !leading-3" pale>
            system
          </Text>
        )}
      </span>
    );

    const drawTableRow = (table: InternalTreeTable) => (
      <span className="flex items-center" data-testid={table.path}>
        {drawTableIcon(table.table_type)}
        <CopyToClipboard textToCopy={table.path}>{table.table_name}</CopyToClipboard>
        <Text pale className="ml-1 inline text-xs italic !leading-3">
          {drawTableDescription(table.table_type)}
        </Text>
      </span>
    );

    return filterTreeData(internalSchemaTree).map(schema => ({
      title: drawSchemaRow(schema),
      key: schema.path,
      children: schema.tables.map(table => ({
        title: drawTableRow(table),
        key: table.path,
        children: table.columns.map(column => ({
          title: drawColumn(column),
          key: column.path,
        })),
      })),
    }));
  };

  const treeData = drawTreeData();

  return (
    <PanelGroup direction="horizontal">
      <Panel>
        {internalSchemaTree.length > 0 ? (
          <div className="flex h-full flex-col">
            <div
              className="min-w-32 shrink-0 border-b px-1 py-1"
              data-testid="object-filter-panel"
            >
              <div className="flex items-center gap-1">
                <div className="flex grow select-none items-center rounded border-2 pl-2 pr-1">
                  <input
                    type="text"
                    placeholder="Filter"
                    className="w-full text-sm outline-none"
                    value={treeFilterSearch}
                    onChange={e => setTreeFilterSearch(e.target.value)}
                    data-testid="object-filter-input"
                  />
                  {treeFilterSearch && (
                    <CloseCircleFilled
                      className="text opacity-25 hover:text-crate-blue hover:opacity-100"
                      onClick={() => setTreeFilterSearch('')}
                    />
                  )}
                </div>
                <Popover>
                  <PopoverTrigger>
                    <div
                      className={`group h-5 w-5 rounded ${treeFilterType.length === 4 ? 'text-black' : 'bg-crate-blue text-white'} `}
                    >
                      <FilterOutlined
                        className="opacity-80 group-hover:opacity-100"
                        data-testid="show-filter-options-icon"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="select-none space-y-1">
                    {drawFilterCheckbox('Tables', FILTER_TYPES.TABLE)}
                    {drawFilterCheckbox('Views', FILTER_TYPES.VIEW)}
                    {drawFilterCheckbox('Foreign tables', FILTER_TYPES.FOREIGN)}
                    <div className="py-1">
                      <hr />
                    </div>
                    {drawFilterCheckbox('System schemas', FILTER_TYPES.SYSTEM)}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="ant-tree-tiny grow overflow-auto px-1 py-2">
              {treeData.length > 0 ? (
                <Tree
                  data-testid="tables-tree"
                  selectable={false}
                  showIcon
                  treeData={drawTreeData()}
                />
              ) : (
                <div className="px-2 text-center text-sm text-crate-border-mid">
                  No data found
                </div>
              )}
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </Panel>
      <PanelResizeHandle className="flex w-1 flex-col justify-center bg-neutral-200 hover:bg-crate-blue">
        <div className="h-10 w-full bg-crate-blue" />
      </PanelResizeHandle>
      <Panel defaultSize={78} minSize={25}>
        <div className="flex h-full flex-col">
          {title}
          <div
            className={cn('flex-auto border-b', {
              'border-red-600': ariaInvalid,
            })}
            data-testid="ace-editor-wrapper"
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
                  exec: () => exec(),
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
              scrollMargin={[5, 5, 0, 5]}
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
                  <Button kind="primary" size="small" onClick={() => exec()}>
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
                    onClick={() => {
                      if (onViewHistory) {
                        onViewHistory();
                      }
                      setShowHistory(true);
                    }}
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
