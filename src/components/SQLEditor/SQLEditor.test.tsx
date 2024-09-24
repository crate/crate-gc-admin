import { render, screen, waitFor, within } from 'test/testUtils';
import SQLEditor, { SQLEditorProps } from './SQLEditor';
import { SYSTEM_SCHEMAS } from 'constants/database';
import {
  schameTablesNonSystemMock,
  schemaTableColumnMock,
} from 'test/__mocks__/schemaTableColumn';
import _ from 'lodash';
import { UserEvent } from '@testing-library/user-event';

const getSchemaTableColumns = () => {
  const schemaTableColumnsParsed = schemaTableColumnMock.rows.map(r => ({
    table_schema: r[0],
    table_name: r[1],
    column_name: r[2],
    data_type: r[3],
  }));

  const groupedBySchema = _.groupBy(schemaTableColumnsParsed, 'table_schema');

  return Object.keys(groupedBySchema).map(schema => {
    const schemaTables = groupedBySchema[schema];
    const tables = [...new Set(schemaTables.map(i => i.table_name))];

    return {
      schemaName: schema,
      tables: tables.map(tableName => {
        return {
          tableName: tableName,
          columns: schemaTableColumnsParsed
            .filter(
              e =>
                e.table_schema === schema &&
                e.table_name === tableName &&
                !e.column_name?.endsWith(']'),
            )
            .map(el => {
              return {
                columnName: el.column_name,
                dataType: el.data_type,
              } as const;
            }),
        } as const;
      }),
    };
  });
};
const schemaTableColumns = getSchemaTableColumns();

const triggerTreeItem = async (
  user: UserEvent,
  text: string,
  textToWait?: string,
) => {
  const triggerIcon = screen
    .getByText(text)
    .closest('.ant-tree-treenode')
    ?.getElementsByClassName('ant-tree-switcher')[0];

  await user.click(triggerIcon!);

  if (textToWait) {
    // wait for first element
    await waitFor(() => {
      expect(screen.getByText(textToWait)).toBeInTheDocument();
    });
  }
};

const onExecute = jest.fn();
const onChange = jest.fn();
const setShowHistory = jest.fn();
const onViewHistory = jest.fn();
const defaultProps: SQLEditorProps = {
  onExecute,
  onChange,
  results: [],
};

const setup = async (props: Partial<SQLEditorProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  const renderResult = render(<SQLEditor {...combinedProps} />);

  // wait for tables render
  await waitFor(() => {
    expect(screen.getByTestId('tables-tree')).toBeInTheDocument();
  });

  return renderResult;
};

describe('The SQLEditor component', () => {
  it('displays the editor', async () => {
    await setup();

    expect(screen.getByTestId('mocked-ace-editor')).toBeInTheDocument();
  });

  describe('the schemas-tables-columns tree', () => {
    describe('the schemas', () => {
      it('displays schema name with system tag if table is a system table', async () => {
        await setup();

        // SYSTEM schemas should have system text
        SYSTEM_SCHEMAS.forEach(schema => {
          expect(screen.getByTestId(`schema-${schema}`)).toBeInTheDocument();
          expect(
            within(screen.getByTestId(`schema-${schema}`)).getByText('system'),
          ).toBeInTheDocument();
        });
      });

      it('displays only schema name for non system table', async () => {
        await setup();

        // NON SYSTEM schemas should NOT have system text
        schameTablesNonSystemMock.forEach(schema => {
          expect(screen.getByTestId(`schema-${schema}`)).toBeInTheDocument();
          expect(
            within(screen.getByTestId(`schema-${schema}`)).queryByText('system'),
          ).not.toBeInTheDocument();
        });
      });
    });

    describe('the tables', () => {
      it('shows the table names', async () => {
        const { user } = await setup();

        const schema = schemaTableColumns[0];

        // open schema tree
        await triggerTreeItem(user, schema.schemaName, schema.tables[0].tableName);

        schema.tables.forEach(table => {
          expect(screen.getByText(table.tableName)).toBeInTheDocument();
        });
      });

      it('clicking on table names copies the qualified table name', async () => {
        const { user } = await setup();

        const schema = schemaTableColumns[0];
        const table = schema.tables[0];

        // open schema tree
        await triggerTreeItem(user, schema.schemaName, table.tableName);

        // click on name
        await user.click(screen.getByText(table.tableName));

        // should have been copied
        const clipboardText = await navigator.clipboard.readText();
        expect(clipboardText).toBe(`${schema.schemaName}.${table.tableName}`);
      });
    });

    describe('the columns', () => {
      it('shows the column names with data type', async () => {
        const { user } = await setup();

        const schema = schemaTableColumns[0];
        const table = schema.tables[0];

        // open schema tree
        await triggerTreeItem(user, schema.schemaName, schema.tables[0].tableName);
        // open table tree
        await triggerTreeItem(user, table.tableName, table.columns[0].columnName);

        table.columns.forEach(column => {
          expect(
            screen.getByTestId(
              `${schema.schemaName}.${table.tableName}.${column.columnName}`,
            ),
          ).toBeInTheDocument();

          const wrapper = screen.getByTestId(
            `${schema.schemaName}.${table.tableName}.${column.columnName}`,
          );
          expect(within(wrapper).getByText(column.columnName)).toBeInTheDocument();
          expect(within(wrapper).getByText(column.dataType)).toBeInTheDocument();
        });
      });

      it('clicking on column names copies the name', async () => {
        const { user } = await setup();

        const schema = schemaTableColumns[0];
        const table = schema.tables[0];
        const column = table.columns[0];

        // open schema tree
        await triggerTreeItem(user, schema.schemaName, table.tableName);
        // open table tree
        await triggerTreeItem(user, table.tableName, column.columnName);

        // click on name
        await user.click(screen.getByText(column.columnName));

        // should have been copied
        const clipboardText = await navigator.clipboard.readText();
        expect(clipboardText).toBe(column.columnName);
      });
    });

    describe('filtering via the search input', () => {
      it('displays the filter search input', async () => {
        await setup();

        expect(screen.getByTestId('object-filter-input')).toBeInTheDocument();
      });

      it('entering a string which matches a schema name, shows that schema and all its tables', async () => {
        const { user } = await setup();

        await user.type(screen.getByTestId('object-filter-input'), 'gc');

        // should show gc schema
        expect(screen.getByText('gc')).toBeInTheDocument();
        expect(screen.queryByText('sys')).not.toBeInTheDocument();

        // open gc schema tree, should contain all tables for that schema
        await triggerTreeItem(user, 'gc');
        schemaTableColumns[0].tables.forEach(table => {
          expect(screen.getByText(table.tableName)).toBeInTheDocument();
        });
      });

      it('entering a string which matches a table name, but not a schema name, shows that schema and matching tables', async () => {
        const { user } = await setup();

        await user.type(screen.getByTestId('object-filter-input'), 'alembic');

        // should show gc schema
        expect(screen.getByText('gc')).toBeInTheDocument();
        expect(screen.queryByText('sys')).not.toBeInTheDocument();

        // open gc schema tree, should contain all tables for that schema
        await triggerTreeItem(user, 'gc');
        schemaTableColumns[0].tables.forEach(table => {
          if (table.tableName.includes('alembic')) {
            expect(screen.getByText(table.tableName)).toBeInTheDocument();
          } else {
            expect(screen.queryByText(table.tableName)).not.toBeInTheDocument();
          }
        });
      });
    });

    describe('filtering via the checkboxes', () => {
      it('displays the filter button', async () => {
        await setup();

        expect(screen.getByTestId('show-filter-options-icon')).toBeInTheDocument();
      });

      it('when filters are set, the filter button shows in a different color', async () => {
        const { user } = await setup();

        // button should initially be in the "off" state
        expect(
          screen.getByTestId('show-filter-options-icon').parentElement,
        ).not.toHaveClass('bg-crate-blue');

        // open the filter options, deselect 'system tables'
        await user.click(screen.getByTestId('show-filter-options-icon'));
        await user.click(screen.getByText('Views'));

        // should show gc schema
        expect(
          screen.getByTestId('show-filter-options-icon').parentElement,
        ).toHaveClass('bg-crate-blue');
      });

      it('when filtering out system tables, hide those schemas from the tree', async () => {
        const { user } = await setup();

        // open the filter options, deselect 'system tables'
        await user.click(screen.getByTestId('show-filter-options-icon'));
        await user.click(screen.getByText('System schemas'));

        // hide system schemas
        expect(screen.queryByText('gc')).not.toBeInTheDocument();
        expect(screen.queryByText('sys')).not.toBeInTheDocument();
      });
    });
  });

  describe('the value', () => {
    it('its empty by default', async () => {
      await setup();

      expect(screen.getByTestId('mocked-ace-editor')).toHaveValue('');
    });

    it('its initialized with the value prop', async () => {
      await setup({
        value: 'CUSTOM_VALUE',
      });

      expect(screen.getByText('CUSTOM_VALUE')).toBeInTheDocument();
      expect(screen.getByTestId('mocked-ace-editor')).toHaveValue('CUSTOM_VALUE');
    });

    it('changing the value trigger the onChange', async () => {
      const { user } = await setup();

      await user.type(screen.getByTestId('mocked-ace-editor'), 'CUSTOM_QUERY');

      expect(onChange).toHaveBeenCalled();
    });
  });

  it('displays the title', async () => {
    await setup({
      title: 'CUSTOM_TITLE',
    });

    expect(screen.getByText('CUSTOM_TITLE')).toBeInTheDocument();
  });

  it('displays error message if errorMessage prop is passed ', async () => {
    await setup({
      errorMessage: 'ERROR_MESSAGE',
    });

    expect(screen.getByText('ERROR_MESSAGE')).toBeInTheDocument();
  });

  it('displays red border if aria-invalid prop is passed ', async () => {
    await setup({
      'aria-invalid': 'true',
    });

    expect(screen.getByTestId('ace-editor-wrapper')).toHaveClass('border-red-600');
  });

  describe('the "Execute" button', () => {
    it('is shown by default', async () => {
      await setup();

      expect(screen.getByText('Execute')).toBeInTheDocument();
    });

    it('can be hidden by sedding showRunButton: false', async () => {
      await setup({
        showRunButton: false,
      });

      expect(screen.queryByText('Execute')).not.toBeInTheDocument();
    });

    it('can have a custom text by passing runButtonLabel', async () => {
      await setup({
        runButtonLabel: 'CUSTOM_EXECUTE_TEXT',
      });

      expect(screen.getByText('CUSTOM_EXECUTE_TEXT')).toBeInTheDocument();
    });
  });

  describe('the "Show history" button', () => {
    it('is hidden by default', async () => {
      await setup();

      expect(screen.queryByText('Show history')).not.toBeInTheDocument();
    });

    it('is shown if setShowHistory prop is passed', async () => {
      await setup({
        setShowHistory,
      });

      expect(screen.getByText('Show history')).toBeInTheDocument();
    });

    it('clicking on it triggers setShowHistory', async () => {
      const { user } = await setup({
        setShowHistory,
      });

      await user.click(screen.getByText('Show history'));

      expect(setShowHistory).toHaveBeenCalledWith(true);
    });

    describe('when an onViewHistory event function is passed', () => {
      it('clicking on it triggers onViewHistory', async () => {
        const { user } = await setup({ setShowHistory, onViewHistory });

        await user.click(screen.getByText('Show history'));

        expect(onViewHistory).toHaveBeenCalled();
      });
    });
  });

  describe('when localStorageKey is set', () => {
    const LOCAL_STORAGE_VALUE_KEY = 'crate.gc.admin.test.';
    const LOCAL_STORAGE_HISTORY_KEY = 'crate.gc.admin.test-history.';

    const initializeLocalStorage = (value: string, history: string) => {
      localStorage.setItem(LOCAL_STORAGE_VALUE_KEY, value);
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, history);
    };

    it('uses the saved value in local storage by default', async () => {
      initializeLocalStorage('CUSTOM_QUERY', '[]');
      await setup({
        localStorageKey: 'test',
      });

      expect(screen.getByTestId('mocked-ace-editor')).toHaveValue('CUSTOM_QUERY');
    });
  });
});
