// Eligible Columns API
export type EligibleColumnTarget = {
  table_name: string;
  table_schema: string;
};
export type EligibleColumnsApiOutput = {
  eligible_columns: Record<string, EligibleColumnTarget[]>;
};
