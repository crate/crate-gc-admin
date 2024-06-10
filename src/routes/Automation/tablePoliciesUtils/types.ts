import { TPolicyActionValue } from 'types';

export type ActionsInfoTablesError = {
  partitions: number;
  table_name: string;
  table_schema: string;
};
export type ActionsInfoError = {
  action: TPolicyActionValue;
  tables: ActionsInfoTablesError[];
};
