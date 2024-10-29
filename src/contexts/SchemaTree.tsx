import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import useExecuteSql from 'hooks/useExecuteSql';
import { SYSTEM_SCHEMAS } from 'constants/database';
import { getTablesColumnsQuery } from 'constants/queries';

const REFRESH_INTERVAL_SECONDS = 60;

// a schema description row, as returned direct from the DB
export type SchemaDescription = {
  table_schema: string;
  table_name: string;
  column_name: string;
  quoted_table_schema: string;
  quoted_table_name: string;
  quoted_column_name: string;
  data_type: string;
  table_type: string;
  path_array: string[];
};

export type SchemaTableColumn = {
  column_name: string;
  quoted_column_name: string;
  data_type: string;
  path: string;
  path_array: string[];
  quoted_path: string;
};

type SchemaTableType = 'BASE TABLE' | 'VIEW' | 'FOREIGN';

export type SchemaTable = {
  schema_name: string;
  table_name: string;
  table_type: SchemaTableType;
  quoted_table_name: string;
  path: string;
  quoted_path: string;
  columns: SchemaTableColumn[];
  is_system_table: boolean;
};

export type Schema = {
  schema_name: string;
  quoted_schema_name: string;
  path: string;
  quoted_path: string;
  tables: SchemaTable[];
};

type SchemaTreeContextType = {
  schemaTree: Schema[];
  refreshSchemaTree: () => void;
};

const defaultProps: SchemaTreeContextType = {
  schemaTree: [],
  refreshSchemaTree: () => {},
};

const SchemaTreeContext = React.createContext(defaultProps);

export const SchemaTreeContextProvider = ({ children }: PropsWithChildren) => {
  const executeSql = useExecuteSql();
  const [lastSync, setLastSync] = useState<number>(0);
  const [schemaTree, setSchemaTree] = useState<Schema[]>([]);

  const constructSchemaTreeFromFlatList = (input: SchemaDescription[]) => {
    const constructTables = (input: SchemaDescription[]): SchemaTable[] => {
      const tree: SchemaTable[] = [];

      // for convenience, create a lookup dict of the tables/columns in this schema
      const tableLookup: {
        [key: string]: {
          schema_name: string;
          name: string;
          quotedName: string;
          type: string;
          path: string;
          quotedPath: string;
          is_system_table: boolean;
        };
      } = input.reduce((prev, next) => {
        return {
          ...prev,
          [next.table_name]: {
            name: next.table_name,
            schema_name: next.table_schema,
            quotedName: next.quoted_table_name,
            type: next.table_type,
            path: `${next.table_schema}.${next.table_name}`,
            quotedPath: `${next.quoted_table_schema}.${next.quoted_table_name}`,
            schema: next.table_schema,
            is_system_table: SYSTEM_SCHEMAS.includes(next.table_schema),
          },
        };
      }, {});

      // loop through array of tables
      const tableNames = [...new Set(input.map(i => i.table_name))];
      tableNames.forEach(tableName => {
        tree.push({
          schema_name: tableLookup[tableName].schema_name,
          table_name: tableLookup[tableName].name,
          quoted_table_name: tableLookup[tableName].quotedName,
          table_type: tableLookup[tableName].type as SchemaTableType,
          path: tableLookup[tableName].path,
          quoted_path: tableLookup[tableName].quotedPath,
          is_system_table: tableLookup[tableName].is_system_table,
          columns: input
            .filter(i => i.table_name === tableName)
            .map(
              column =>
                ({
                  column_name: column.column_name,
                  quoted_column_name: column.quoted_column_name,
                  data_type: column.data_type,
                  path: `${tableLookup[tableName].path}.${column.column_name}`,
                  path_array: column.path_array,
                  quoted_path: `${tableLookup[tableName].quotedPath}.${column.quoted_column_name}`,
                }) satisfies SchemaTableColumn,
            ),
        });
      });

      return tree;
    };

    const constructSchemas = (input: SchemaDescription[]): Schema[] => {
      const tree: Schema[] = [];

      // loop through array of unique schema names
      const schemaNames = [...new Set(input.map(i => i.table_schema))];
      schemaNames.forEach(schemaName => {
        const quotedSchemaName = input.find(
          i => i.table_schema === schemaName,
        )!.quoted_table_schema;

        tree.push({
          schema_name: schemaName,
          quoted_schema_name: quotedSchemaName,
          path: schemaName,
          quoted_path: quotedSchemaName,
          tables: constructTables(input.filter(i => i.table_schema === schemaName)),
        });
      });

      return tree;
    };

    return constructSchemas(input);
  };

  const retrieveSchemaFromCluster = async () => {
    let cols: SchemaDescription[] = [];

    setLastSync(new Date().valueOf());
    const res = await executeSql(getTablesColumnsQuery);
    if (res.data && !('error' in res.data) && !Array.isArray(res.data)) {
      cols = res.data.rows.map(
        r =>
          ({
            table_schema: r[0],
            table_name: r[1],
            column_name: r[2],
            quoted_table_schema: r[3],
            quoted_table_name: r[4],
            quoted_column_name: r[5],
            data_type: r[6],
            table_type: r[7],
            path_array: r[8],
          }) satisfies SchemaDescription,
      );
    }

    setSchemaTree(constructSchemaTreeFromFlatList(cols));
  };

  const refreshSchemaTree = () => {
    retrieveSchemaFromCluster();
  };

  // populate the tree on mount
  useEffect(() => {
    retrieveSchemaFromCluster();
  }, []);

  // manage the interval timer
  useEffect(() => {
    const interval = setInterval(() => {
      const secondsSinceLastSync = (new Date().valueOf() - lastSync) / 1000;
      if (secondsSinceLastSync > REFRESH_INTERVAL_SECONDS) {
        retrieveSchemaFromCluster();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastSync]);

  return (
    <SchemaTreeContext.Provider value={{ schemaTree, refreshSchemaTree }}>
      {children}
    </SchemaTreeContext.Provider>
  );
};

export const useSchemaTreeContext = () => {
  return useContext(SchemaTreeContext);
};
