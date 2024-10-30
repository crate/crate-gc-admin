export const getTablesColumnsQuery = `
  SELECT
    c.table_schema,
    c.table_name,
    c.column_name,
    QUOTE_IDENT(c.table_schema) AS quoted_table_schema,
    QUOTE_IDENT(c.table_name) AS quoted_table_name,
    QUOTE_IDENT(c.column_name) AS quoted_column_name,
    c.data_type,
    t.table_type,
    column_details['path'] AS path_array
  FROM
    "information_schema"."columns" c
  JOIN
    "information_schema"."tables" t ON c.table_schema = t.table_schema AND c.table_name = t.table_name
  ORDER BY
    table_schema,
    table_name,
    ordinal_position`;

export const getTablesDDLQuery = (schema: string, table: string) =>
  `SHOW CREATE TABLE "${schema}"."${table}"`;

export const getViewsDDLQuery = (schema: string, view: string) =>
  `SELECT
    concat(
      'CREATE OR REPLACE VIEW "${schema}"."${view}" AS (',
        (
          SELECT
            view_definition
          FROM
            information_schema.views
          WHERE
            table_schema = '${schema}'
            and table_name = '${view}'
        ),
        ')'
    ) AS create_view;`;
