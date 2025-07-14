import { PropsWithChildren } from 'react';
import { cn } from 'utils';
import _ from 'lodash';
import { TreeItem } from 'components/Tree/Tree';
import { TableListEntry } from 'types/cratedb';
import { TPolicyTarget } from 'types';

type TreeItemLabelProps = PropsWithChildren<{
  disabled?: boolean;
}>;
const TreeItemLabel = ({ children, disabled }: TreeItemLabelProps) => {
  return (
    <span>
      <span
        className={cn({
          'line-through': disabled,
        })}
      >
        {children}
      </span>{' '}
      {disabled && <span className="italic"> (deleted)</span>}
    </span>
  );
};

const createTableTreeItem = (
  schema: string,
  table: string,
  disabled: boolean = false,
) => {
  return {
    title: <TreeItemLabel disabled={disabled}>{table}</TreeItemLabel>,
    'data-testid': `${schema}.${table}`,
    key: `${schema}.${table}`,
  } satisfies TreeItem;
};

const createSchemaTreeItem = (
  schema: string,
  tables: string[] = [],
  disabled: boolean = false,
) => {
  return {
    title: <TreeItemLabel disabled={disabled}>{schema}</TreeItemLabel>,
    key: schema,
    'data-testid': schema,
    children: tables.map(table => {
      return createTableTreeItem(schema, table);
    }),
  } satisfies TreeItem;
};

export const mapTableListEntriesToTreeItem = (
  entries: TableListEntry[],
  currentTargets: TPolicyTarget[] = [],
): TreeItem[] => {
  const schemas = _.groupBy(entries, 'table_schema');
  const treeItems = Object.keys(schemas).map(schema => {
    const schemaTables = schemas[schema];

    return createSchemaTreeItem(
      schema,
      schemaTables.map(table => table.table_name),
    );
  });

  currentTargets
    .sort((target1, target2) => {
      // Sort to handle schemas before tables
      if (target1.type === 'schema' && target2.type === 'table') {
        return 1;
      } else if (target2.type === 'schema' && target1.type === 'table') {
        return -1;
      }
      return 0;
    })
    .forEach(target => {
      if (target.type === 'schema') {
        const schemaInTreeItems = treeItems.find(item => item.key === target.name);
        if (!schemaInTreeItems) {
          treeItems.push(createSchemaTreeItem(target.name, [], true));
        }
      } else if (target.type === 'table') {
        const [schema, table] = target.name.split('.');

        const schemaInTreeItems = treeItems.find(item => item.key === schema);
        const tableInTreeItems = schemaInTreeItems?.children.find(
          item => item.key === `${schema}.${table}`,
        );

        if (!schemaInTreeItems) {
          // Create schema + table
          const createdSchemaItem = createSchemaTreeItem(schema, [], true);
          createdSchemaItem.children.push(createTableTreeItem(schema, table, true));
          treeItems.push(createdSchemaItem);
        } else if (!tableInTreeItems) {
          // Create table
          schemaInTreeItems.children.push(createTableTreeItem(schema, table, true));
        }
      }
    });

  return treeItems;
};
