import { format as formatSQL } from 'sql-formatter';

export const tryFormatSql = (sql: string) => {
  try {
    return formatSQL(sql, {
      language: 'postgresql',
    });
  } catch {
    return sql;
  }
};
