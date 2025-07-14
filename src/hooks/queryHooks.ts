import useExecuteSql from 'hooks/useExecuteSql';
import { TableInfo } from 'types/cratedb';

export const useGetTableInformationQuery = () => {
  const executeSql = useExecuteSql();

  const getTableInformation = async (
    schema: string,
    table: string,
  ): Promise<TableInfo[]> => {
    const res = await executeSql(
      `
      SELECT
        c.ordinal_position,
        c.column_name,
        data_type,
        column_default,
        tc.constraint_type
      FROM
        information_schema.columns c
      LEFT OUTER JOIN information_schema.key_column_usage u ON (
        c.table_name = u.table_name
        AND c.column_name = u.column_name
      )
      LEFT OUTER JOIN information_schema.table_constraints tc ON (
        tc.table_name = u.table_name
        AND tc.constraint_name = u.constraint_name
        AND tc.constraint_name = u.constraint_name
      )
      WHERE
        c.table_name = '${table}'
        AND c.table_schema = '${schema}';
    `,
      '/table-information',
    );

    if (!res.data || 'error' in res.data || Array.isArray(res.data)) {
      return [];
    }

    return res.data.rows.map(r => {
      return {
        ordinal_position: r[0],
        column_name: r[1],
        data_type: r[2],
        column_default: r[3],
        constraint_type: r[4],
      };
    });
  };

  return getTableInformation;
};

export const useShowCreateTableQuery = () => {
  const executeSql = useExecuteSql();

  const showCreateTable = async (
    schema: string,
    table: string,
  ): Promise<string | undefined> => {
    const res = await executeSql(
      `SHOW CREATE TABLE "${schema}"."${table}"`,
      '/show-create-table',
    );

    if (!res.data || Array.isArray(res.data)) {
      return;
    }

    if (res.data && 'error' in res.data) {
      return;
    }
    return res.data && res.data.rows[0][0];
  };

  return showCreateTable;
};
