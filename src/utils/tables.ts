import { TreeItem } from 'components/Tree/Tree';
import _ from 'lodash';
import { TableListEntry } from 'types/cratedb';

export const mapTableListEntriesToTreeItem = (
  entries: TableListEntry[],
): TreeItem[] => {
  const schemas = _.groupBy(entries, 'table_schema');
  return Object.keys(schemas).map(tableSchema => {
    const tables = schemas[tableSchema];
    return {
      title: tableSchema,
      key: tableSchema,
      'data-testid': 'tableSchema',
      children: tables.map(table => {
        return {
          title: table.table_name,
          'data-testid': `${tableSchema}.${table.table_name}`,
          key: `${tableSchema}.${table.table_name}`,
        } satisfies TreeItem;
      }),
    } satisfies TreeItem;
  });
};
