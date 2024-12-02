import {
  ApartmentOutlined,
  CloseCircleFilled,
  CompassOutlined,
  FilterOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SearchOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Checkbox, Dropdown, Tree } from 'antd';
import Button from 'components/Button';
import CopyToClipboard from 'components/CopyToClipboard';
import Loader from 'components/Loader';
import Popover, { PopoverContent, PopoverTrigger } from 'components/Popover';
import Text from 'components/Text';
import { getTablesDDLQuery, getViewsDDLQuery } from 'constants/queries';
import useExecuteSql from 'hooks/useExecuteSql';
import useMessage from 'hooks/useMessage';
import { useState } from 'react';
import { useSchemaTree, Schema, SchemaTable, SchemaTableColumn } from 'src/swr/jwt';
import { tryFormatSql } from 'utils';
import useJWTManagerStore from 'state/jwtManager';

type AntDesignTreeItem = {
  title: React.ReactNode;
  key: string;
  children?: AntDesignTreeItem[];
};

const FILTER_TYPES = {
  TABLE: 'table',
  VIEW: 'view',
  FOREIGN: 'foreign',
  SYSTEM: 'system',
} as const;

function SQLEditorSchemaTree() {
  const clusterId = useJWTManagerStore(state => state.clusterId);
  const {
    data: schemaTree,
    mutate: mutateSchemaTree,
    isValidating: schemaTreeIsValidating,
  } = useSchemaTree(clusterId);

  const executeSql = useExecuteSql();
  const { showLoadingMessage, showErrorMessage, showSuccessMessage } = useMessage();

  const [treeFilterSearch, setTreeFilterSearch] = useState<string>('');
  const [treeFilterType, setTreeFilterType] = useState<string[]>([
    FILTER_TYPES.TABLE,
    FILTER_TYPES.VIEW,
    FILTER_TYPES.FOREIGN,
    FILTER_TYPES.SYSTEM,
  ]);

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

  const filterTreeData = (filteredSchemaTree: Schema[]): Schema[] => {
    // if no filters are applied, return the full tree
    if (treeFilterSearch === '' && treeFilterType.length === 4) {
      return filteredSchemaTree;
    }

    // filter: system tables
    if (!treeFilterType.includes(FILTER_TYPES.SYSTEM)) {
      filteredSchemaTree = filteredSchemaTree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table => !table.is_system_table),
      }));
    }

    // filter: tables
    if (!treeFilterType.includes(FILTER_TYPES.TABLE)) {
      filteredSchemaTree = filteredSchemaTree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table => table.table_type !== 'BASE TABLE'),
      }));
    }

    // filter: foreign tables
    if (!treeFilterType.includes(FILTER_TYPES.FOREIGN)) {
      filteredSchemaTree = filteredSchemaTree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table => table.table_type !== 'FOREIGN'),
      }));
    }

    // filter: views
    if (!treeFilterType.includes(FILTER_TYPES.VIEW)) {
      filteredSchemaTree = filteredSchemaTree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table => table.table_type !== 'VIEW'),
      }));
    }

    // filter: search string
    if (treeFilterSearch !== '') {
      const searchString = treeFilterSearch.toLowerCase();
      filteredSchemaTree = filteredSchemaTree.map(schema => ({
        ...schema,
        tables: schema.tables.filter(table =>
          table.path.join('.').toLowerCase().includes(searchString),
        ),
      }));
    }

    // tidy up: remove all empty schemas
    return filteredSchemaTree.filter(schema => schema.tables.length > 0);
  };

  const drawTreeData = (filteredSchemaTree: Schema[]): AntDesignTreeItem[] => {
    const drawColumns = (columns: SchemaTableColumn[]): AntDesignTreeItem[] => {
      return columns.map(column => ({
        title: (
          <span data-testid={column.path.join('.')}>
            <CopyToClipboard textToCopy={column.column_name}>
              {column.column_name}
            </CopyToClipboard>
            <Text pale className="ml-1 inline text-xs italic !leading-3">
              {column.data_type}
            </Text>
          </span>
        ),
        key: column.path.join('.'),
        children: column.children ? drawColumns(column.children) : undefined,
      }));
    };

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

    const drawSchemaRow = (schema: Schema) => (
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

    const drawContextMenu = (table: SchemaTable) => {
      const copyCreateStatement = async () => {
        showLoadingMessage('Generating statement...');

        // get DDL statement
        const ddlResult = await executeSql(
          table.table_type === 'VIEW'
            ? getViewsDDLQuery(table.schema_name, table.table_name)
            : getTablesDDLQuery(table.schema_name, table.table_name),
          table.table_type === 'VIEW' ? '/ddl-view-query' : '/ddl-table-query',
        );

        // check error
        if (
          ddlResult.data &&
          !('error' in ddlResult.data) &&
          !Array.isArray(ddlResult.data)
        ) {
          const ddlStatement = `${ddlResult.data.rows[0][0]};`;

          // format and copy
          navigator.clipboard.writeText(tryFormatSql(ddlStatement));
          showSuccessMessage('Copied');
        } else {
          showErrorMessage('Error genering DDL statement.');
        }
      };

      const copySelectStatement = () => {
        // generate DQL
        const dqlStatement = `SELECT ${table.columns
          .map(el => el.column_name)
          .join(', ')} FROM ${table.path.join('.')} LIMIT 100;`;

        // format and copy
        navigator.clipboard.writeText(tryFormatSql(dqlStatement));
        showSuccessMessage('Copied');
      };

      const contextMenu = [];

      contextMenu.push({
        label: (
          <Button
            id={`copy-create-${table.table_name}`}
            kind={Button.kinds.TERTIARY}
            size={Button.sizes.SMALL}
            className="!leading-3 !text-black hover:!text-crate-blue"
            onClick={() => {
              copySelectStatement();
            }}
          >
            Copy SELECT
          </Button>
        ),
        key: 'copy-dql',
      });

      // No DDL option for system tables
      if (!table.is_system_table) {
        contextMenu.push({
          label: (
            <Button
              id={`copy-select-${table.table_name}`}
              kind={Button.kinds.TERTIARY}
              size={Button.sizes.SMALL}
              className="!leading-3 !text-black hover:!text-crate-blue"
              onClick={() => {
                copyCreateStatement();
              }}
            >
              Copy CREATE {table.table_type === 'VIEW' ? 'VIEW' : 'TABLE'}
            </Button>
          ),
          key: 'copy-ddl',
        });
      }

      return contextMenu;
    };

    const drawTableRow = (table: SchemaTable) => (
      <Dropdown
        menu={{
          items: [
            {
              key: 'generate-sql-group',
              type: 'group',
              label: 'Generate SQL',
              children: drawContextMenu(table),
            },
          ],
        }}
        trigger={['contextMenu']}
      >
        <span className="flex items-center" data-testid={table.path.join('.')}>
          {drawTableIcon(table.table_type)}
          <CopyToClipboard textToCopy={table.path.join('.')}>
            {table.table_name}
          </CopyToClipboard>
          <Text pale className="ml-1 inline text-xs italic !leading-3">
            {drawTableDescription(table.table_type)}
          </Text>
        </span>
      </Dropdown>
    );

    return filteredSchemaTree.map(schema => ({
      title: drawSchemaRow(schema),
      key: schema.path[0],
      children: schema.tables.map(table => ({
        title: drawTableRow(table),
        key: table.path.join('.'),
        children: drawColumns(table.columns),
      })),
    }));
  };

  if (!schemaTree) {
    return <Loader />;
  }

  const filteredSchemaTree = filterTreeData(schemaTree);

  return (
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
          {schemaTreeIsValidating ? (
            <LoadingOutlined data-testid="reload-spinner" />
          ) : (
            <button
              onClick={() => {
                mutateSchemaTree();
              }}
              data-testid="reload-button"
            >
              <ReloadOutlined />
            </button>
          )}
        </div>
      </div>
      <div className="ant-tree-tiny grow overflow-auto px-1 py-2">
        {filteredSchemaTree.length > 0 ? (
          <Tree
            data-testid="tables-tree"
            selectable={false}
            showIcon
            treeData={drawTreeData(filteredSchemaTree)}
          />
        ) : (
          <div className="px-2 text-center text-sm text-crate-border-mid">
            No data found
          </div>
        )}
      </div>
    </div>
  );
}

export default SQLEditorSchemaTree;
