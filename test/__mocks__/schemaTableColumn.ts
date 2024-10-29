export const schemaTablesNonSystemMock = ['new_schema'];

export const schemaTableColumnMock = {
  cols: [
    'table_schema',
    'table_name',
    'column_name',
    'quoted_table_schema',
    'quoted_table_name',
    'quoted_column_name',
    'data_type',
  ],
  col_types: [4, 4, 4, 4, 4, 4, 4],
  rows: [
    [
      'gc',
      'alembic_version',
      'version_num',
      'gc',
      'alembic_version',
      'version_num',
      'text',
      'BASE TABLE',
    ],
    [
      'gc',
      'jwt_refresh_token',
      'id',
      'gc',
      'jwt_refresh_token',
      'id',
      'text',
      'BASE TABLE',
    ],
    [
      'information_schema',
      'character_sets',
      'character_repertoire',
      'information_schema',
      'character_sets',
      'character_repertoire',
      'text',
      'BASE TABLE',
    ],
    [
      'information_schema',
      'character_sets',
      'character_set_catalog',
      'information_schema',
      'character_sets',
      'character_set_catalog',
      'text',
      'BASE TABLE',
    ],
    [
      'new_schema',
      'new_table',
      'id',
      'new_schema',
      'new_table',
      'id',
      'bigint',
      'BASE TABLE',
    ],
    [
      'new_schema',
      'new_view',
      'view_column',
      'view_schema',
      'test_view',
      'version_num',
      'text',
      'VIEW',
    ],
    [
      'pg_catalog',
      'pg_am',
      'amhandler',
      'pg_catalog',
      'pg_am',
      'amhandler',
      'regproc',
      'BASE TABLE',
    ],
    [
      'pg_catalog',
      'pg_am',
      'amname',
      'pg_catalog',
      'pg_am',
      'amname',
      'text',
      'BASE TABLE',
    ],
    [
      'sys',
      'allocations',
      'current_state',
      'sys',
      'allocations',
      'current_state',
      'text',
      'BASE TABLE',
    ],
    [
      'sys',
      'allocations',
      'decisions',
      'sys',
      'allocations',
      'decisions',
      'object_array',
      'BASE TABLE',
    ],
    [
      'sys',
      'allocations',
      "decisions['explanations']",
      'sys',
      'allocations',
      "decisions['explanations']",
      'text_array_array',
      'BASE TABLE',
    ],
  ],
  rowcount: 10,
  duration: 2.215816,
};
