import { render, screen, waitFor, within } from 'test/testUtils';
import SQLEditorSchemaTree from './SQLEditorSchemaTree';
import { UserEvent } from '@testing-library/user-event';
import {
  schemaTableColumnMock,
  schemaTablesNonSystemMock,
} from 'test/__mocks__/schemaTableColumn';
import { SYSTEM_SCHEMAS } from 'constants/database';
import _ from 'lodash';
import { format as formatSQL } from 'sql-formatter';
import {
  getTablesDDLQueryResult,
  getViewsDDLQueryResult,
} from 'test/__mocks__/query';
import { SchemaDescription } from 'contexts';

const getSchemaTableColumns = () => {
  const schemaTableColumnsParsed = schemaTableColumnMock.rows.map(
    r =>
      ({
        table_schema: r[0] as string,
        table_name: r[1] as string,
        column_name: r[2] as string,
        quoted_table_schema: r[3] as string,
        quoted_table_name: r[4] as string,
        quoted_column_name: r[5] as string,
        data_type: r[6] as string,
        table_type: r[7] as string,
        path_array: r[8] as string[],
      }) satisfies SchemaDescription,
  );

  const groupedBySchema = _.groupBy(schemaTableColumnsParsed, 'table_schema');

  return Object.keys(groupedBySchema).map(schema => {
    const schemaTables = groupedBySchema[schema];
    const tables = [...new Set(schemaTables.map(i => i.table_name as string))];

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

const setup = async () => {
  const renderResult = render(<SQLEditorSchemaTree />);
  // wait for tables render
  await waitFor(() => {
    expect(screen.getByTestId('tables-tree')).toBeInTheDocument();
  });

  return renderResult;
};

describe('The SQLEditorSchemaTree component', () => {
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
      schemaTablesNonSystemMock.forEach(schema => {
        expect(screen.getByTestId(`schema-${schema}`)).toBeInTheDocument();
        expect(
          within(screen.getByTestId(`schema-${schema}`)).queryByText('system'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('the tables/view', () => {
    it('shows the names', async () => {
      const { user } = await setup();

      const schema = schemaTableColumns[0];

      // open schema tree
      await triggerTreeItem(user, schema.schemaName, schema.tables[0].tableName);

      schema.tables.forEach(table => {
        expect(screen.getByText(table.tableName)).toBeInTheDocument();
      });
    });

    it('clicking on names copies the qualified table name', async () => {
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

    describe('the context menu', () => {
      describe('the Copy SELECT button', () => {
        it('copies the SELECT statement', async () => {
          const schema = schemaTableColumns.find(
            schema => schema.schemaName === 'gc',
          )!;
          const table = schema.tables[0];

          const { user } = await setup();

          // open schema tree
          await triggerTreeItem(user, schema.schemaName, schema.tables[0].tableName);

          // right click
          await user.pointer({
            keys: '[MouseRight>]',
            target: screen.getByText(table.tableName),
          });

          // click on Copy Select button
          await user.click(screen.getByText(`Copy SELECT`));

          const clipboardText = await navigator.clipboard.readText();
          expect(clipboardText).toBe(
            formatSQL('SELECT version_num FROM gc.alembic_version LIMIT 100;', {
              language: 'postgresql',
            }),
          );
        });
      });

      describe('the Copy CREATE button', () => {
        it('for views it copies the CREATE OR REPLACE VIEW statement', async () => {
          const schema = schemaTableColumns.find(
            schema => schema.schemaName === 'new_schema',
          )!;
          const table = schema.tables.find(table => table.tableName === 'new_view')!;

          const { user } = await setup();

          // open schema tree
          await triggerTreeItem(user, schema.schemaName, schema.tables[0].tableName);

          // right click
          await user.pointer({
            keys: '[MouseRight>]',
            target: screen.getByText(table.tableName),
          });

          // click on Copy CREATE VIEW button
          await user.click(screen.getByText(`Copy CREATE VIEW`));

          const clipboardText = await navigator.clipboard.readText();
          expect(clipboardText).toBe(
            formatSQL(`${getViewsDDLQueryResult.rows[0][0]};`, {
              language: 'postgresql',
            }),
          );
        });

        it('for non-system tables it copies the CREATE TABLE statement', async () => {
          const schema = schemaTableColumns.find(
            schema => schema.schemaName === schemaTablesNonSystemMock[0],
          )!;
          const table = schema.tables.find(
            table => table.tableName === 'new_table',
          )!;

          const { user } = await setup();

          // open schema tree
          await triggerTreeItem(user, schema.schemaName, schema.tables[0].tableName);

          // right click
          await user.pointer({
            keys: '[MouseRight>]',
            target: screen.getByText(table.tableName),
          });

          // click on Copy CREATE TABLE button
          await user.click(screen.getByText(`Copy CREATE TABLE`));

          const clipboardText = await navigator.clipboard.readText();
          expect(clipboardText).toBe(
            formatSQL(`${getTablesDDLQueryResult.rows[0][0]};`, {
              language: 'postgresql',
            }),
          );
        });
      });
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
