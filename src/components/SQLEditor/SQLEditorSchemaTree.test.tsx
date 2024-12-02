import { render, screen, waitFor, within } from 'test/testUtils';
import SQLEditorSchemaTree from './SQLEditorSchemaTree';
import { UserEvent } from '@testing-library/user-event';
import { SYSTEM_SCHEMAS } from 'constants/database';
import { format as formatSQL } from 'sql-formatter';
import {
  getTablesDDLQueryResult,
  getViewsDDLQueryResult,
} from 'test/__mocks__/query';
import { useSchemaTreeMock } from 'test/__mocks__/useSchemaTreeMock';
import { postFetch } from 'src/swr/jwt/useSchemaTree';

const schemaTableColumns = postFetch(useSchemaTreeMock);

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

const nonSystemSchemas = ['new_schema'];

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
      nonSystemSchemas.forEach(schema => {
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

      const schema = schemaTableColumns.find(schema => schema.schema_name === 'gc')!;

      // open schema tree
      await triggerTreeItem(user, schema.schema_name, schema.tables[0].table_name);

      schema.tables.forEach(table => {
        expect(screen.getByText(table.table_name)).toBeInTheDocument();
      });
    });

    it('clicking on names copies the qualified table name', async () => {
      const { user } = await setup();

      const schema = schemaTableColumns.find(schema => schema.schema_name === 'gc')!;
      const table = schema.tables[0];

      // open schema tree
      await triggerTreeItem(user, schema.schema_name, table.table_name);

      // click on name
      await user.click(screen.getByText(table.table_name));

      // should have been copied
      const clipboardText = await navigator.clipboard.readText();
      expect(clipboardText).toBe(`${schema.schema_name}.${table.table_name}`);
    });

    describe('the context menu', () => {
      describe('the Copy SELECT button', () => {
        it('copies the SELECT statement', async () => {
          const schema = schemaTableColumns.find(
            schema => schema.schema_name === 'gc',
          )!;
          const table = schema.tables[0];

          const { user } = await setup();

          // open schema tree
          await triggerTreeItem(
            user,
            schema.schema_name,
            schema.tables[0].table_name,
          );

          // right click
          await user.pointer({
            keys: '[MouseRight>]',
            target: screen.getByText(table.table_name),
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
            schema => schema.schema_name === 'new_schema',
          )!;
          const table = schema.tables.find(
            table => table.table_name === 'new_view',
          )!;

          const { user } = await setup();

          // open schema tree
          await triggerTreeItem(
            user,
            schema.schema_name,
            schema.tables[0].table_name,
          );

          // right click
          await user.pointer({
            keys: '[MouseRight>]',
            target: screen.getByText(table.table_name),
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
            schema => schema.schema_name === nonSystemSchemas[0],
          )!;
          const table = schema.tables.find(
            table => table.table_name === 'new_table',
          )!;

          const { user } = await setup();

          // open schema tree
          await triggerTreeItem(
            user,
            schema.schema_name,
            schema.tables[0].table_name,
          );

          // right click
          await user.pointer({
            keys: '[MouseRight>]',
            target: screen.getByText(table.table_name),
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
      await triggerTreeItem(user, schema.schema_name, schema.tables[0].table_name);
      // open table tree
      await triggerTreeItem(user, table.table_name, table.columns[0].column_name);

      table.columns.forEach(column => {
        expect(
          screen.getByTestId(
            `${schema.schema_name}.${table.table_name}.${column.column_name}`,
          ),
        ).toBeInTheDocument();

        const wrapper = screen.getByTestId(
          `${schema.schema_name}.${table.table_name}.${column.column_name}`,
        );
        expect(within(wrapper).getByText(column.column_name)).toBeInTheDocument();
        expect(within(wrapper).getByText(column.data_type)).toBeInTheDocument();
      });
    });

    it('object columns are nested', async () => {
      const { user } = await setup();

      const schema = schemaTableColumns[1]; // information_schema
      const table = schema.tables[1]; // table_partitions
      const column = table.columns[5]; // settings
      const children = table.columns[5].children!; // blocks, codec, mapping, etc.

      // open schema tree
      await triggerTreeItem(user, schema.schema_name, schema.tables[1].table_name);
      // open table tree
      await triggerTreeItem(user, table.table_name, table.columns[5].column_name);
      // open column tree
      await triggerTreeItem(user, column.column_name, children[0].column_name);

      children.forEach(childColumn => {
        expect(
          screen.getByTestId(
            `${schema.schema_name}.${table.table_name}.${column.column_name}.${childColumn.column_name}`,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows a different data type when the columns is an array', async () => {
      const { user } = await setup();

      const schema = schemaTableColumns[0]; // gc
      const table = schema.tables[1]; // scheduled_jobs
      const column = table.columns[6]; // sql_queries

      // open schema tree
      await triggerTreeItem(user, schema.schema_name, table.table_name);
      // open table tree
      await triggerTreeItem(user, table.table_name, column.column_name);

      const wrapper = screen.getByTestId(
        `${schema.schema_name}.${table.table_name}.${column.column_name}`,
      );

      // alternate text for array types
      expect(within(wrapper).getByText('array(text)')).toBeInTheDocument();
    });

    it('clicking on column names copies the name', async () => {
      const { user } = await setup();

      const schema = schemaTableColumns[0];
      const table = schema.tables[0];
      const column = table.columns[0];

      // open schema tree
      await triggerTreeItem(user, schema.schema_name, table.table_name);
      // open table tree
      await triggerTreeItem(user, table.table_name, column.column_name);

      // click on name
      await user.click(screen.getByText(column.column_name));

      // should have been copied
      const clipboardText = await navigator.clipboard.readText();
      expect(clipboardText).toBe(column.column_name);
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
      schemaTableColumns
        .find(schema => schema.schema_name === 'gc')!
        .tables.forEach(table => {
          expect(screen.getByText(table.table_name)).toBeInTheDocument();
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
      schemaTableColumns
        .find(schema => schema.schema_name === 'gc')!
        .tables.forEach(table => {
          if (table.table_name.includes('alembic')) {
            expect(screen.getByText(table.table_name)).toBeInTheDocument();
          } else {
            expect(screen.queryByText(table.table_name)).not.toBeInTheDocument();
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

  describe('reloading the tree', () => {
    it('displays a reload button', async () => {
      await setup();

      expect(await screen.findByTestId('reload-button')).toBeInTheDocument();
    });
  });
});
