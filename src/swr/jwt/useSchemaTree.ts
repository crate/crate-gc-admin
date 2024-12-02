import useSWR from 'swr';
import swrJWTFetch from '../swrJWTFetch';
import { SYSTEM_SCHEMAS } from 'constants/database';
import { QueryResultSuccess } from 'types/query';

// a schema description row, as returned direct from the DB
type SchemaDescription = {
  table_schema: string;
  table_name: string;
  table_type: string;
  column_paths: string[];
  data_types: string[];
};

export type SchemaTableColumn = {
  children?: SchemaTableColumn[];
  column_name: string;
  data_type: string;
  path: string[];
};

type SchemaTableType = 'BASE TABLE' | 'VIEW' | 'FOREIGN';

export type SchemaTable = {
  schema_name: string;
  table_name: string;
  table_type: SchemaTableType;
  path: string[];
  columns: SchemaTableColumn[];
  is_system_table: boolean;
};

export type Schema = {
  schema_name: string;
  path: string[];
  tables: SchemaTable[];
};

export const postFetch = (data: QueryResultSuccess): Schema[] => {
  const constructSchemaTreeFromFlatList = (input: SchemaDescription[]) => {
    const formatDataType = (dataType: string) => {
      while (dataType.includes('_array')) {
        dataType = `array(${dataType.replace('_array', '')})`;
      }

      return dataType;
    };

    const constructColumns = (
      input: SchemaDescription,
      path: string[],
    ): SchemaTableColumn[] => {
      // we need to convert a data structure consisting of 3 separate arrays,
      // into a nested tree structure. this is harder than it looks, but the
      // following code is fairly efficient.
      //
      // first, it makes a temporary list of all the columns (nodeList) and
      // their parent indexes, then uses that list to recursively build the
      // tree via the getNestedColumns() functionbelow.
      const nodeList = input.column_paths
        .map((_, i) => {
          const paths = [...input.column_paths[i]];
          return {
            data_type: formatDataType(input.data_types[i]),
            path: paths.slice(0, -1),
            name: paths.slice(-1)[0],
            index: i,
          };
        })
        .map(t => ({
          ...t,
          path_string: t.path.join('.'),
          parent_index: -1,
        }));

      nodeList.forEach(name => {
        if (name.path.length > 0) {
          const nodeName = name.path[name.path.length - 1];
          const nodePathString = name.path.slice(0, -1).join('.');
          name.parent_index = nodeList.findIndex(
            x =>
              x.path.length === name.path.length - 1 &&
              x.name === nodeName &&
              x.path_string === nodePathString,
          );
        }
      });

      const getNestedColumns = (
        parentIndex: number,
        childPath: string[],
      ): SchemaTableColumn[] => {
        return nodeList
          .filter(node => node.parent_index === parentIndex)
          .map(node => {
            const path = childPath.concat([node.name]);
            const childNodes = getNestedColumns(node.index, path);

            const output: SchemaTableColumn = {
              column_name: node.name,
              data_type: node.data_type,
              path: path,
            };
            if (childNodes) {
              output['children'] = childNodes;
            }
            return output;
          });
      };

      return getNestedColumns(-1, path);
    };

    const constructTables = (input: SchemaDescription[]): SchemaTable[] => {
      return input.map(row => {
        const path = [row.table_schema, row.table_name];

        return {
          columns: constructColumns(row, path),
          is_system_table: SYSTEM_SCHEMAS.includes(row.table_schema),
          path: path,
          schema_name: row.table_schema,
          table_name: row.table_name,
          table_type: row.table_type as SchemaTableType,
        };
      });
    };

    const constructSchemas = (input: SchemaDescription[]): Schema[] => {
      const tree: Schema[] = [];

      // loop through array of unique schema names
      const schemaNames = [...new Set(input.map(i => i.table_schema))];
      schemaNames.forEach(schemaName => {
        tree.push({
          schema_name: schemaName,
          path: [schemaName],
          tables: constructTables(input.filter(i => i.table_schema === schemaName)),
        });
      });

      return tree;
    };

    return constructSchemas(input);
  };

  return constructSchemaTreeFromFlatList(
    data.rows.map(row => ({
      table_schema: row[0],
      table_name: row[1],
      table_type: row[2],
      column_paths: row[3],
      data_types: row[4],
    })),
  );
};

const QUERY = `
  WITH column_details AS (
    SELECT
      table_schema,
      table_name,
      ARRAY_AGG([QUOTE_IDENT(column_details['name'])] || column_details['path']) column_paths,
      ARRAY_AGG(data_type) data_types
    FROM "information_schema"."columns"
    GROUP BY table_schema, table_name
  )

  SELECT
    QUOTE_IDENT(c.table_schema) AS table_schema,
    QUOTE_IDENT(c.table_name) AS table_name,
    t.table_type,
    column_paths,
    data_types
  FROM column_details c
  JOIN "information_schema"."tables" t
    ON c.table_schema = t.table_schema
  AND c.table_name = t.table_name
  ORDER BY table_schema, table_name;
`;

const useSchemaTree = (clusterId?: string) => {
  return useSWR<Schema[]>(
    [`/use-schema-tree/${clusterId}`, clusterId],
    ([url]: [string]) => swrJWTFetch(url, QUERY, postFetch),
    {},
  );
};

export default useSchemaTree;
