// Eligible Tables API
export type EligibleTable = {
  partitions_affected: number;
  table_name: string;
  table_schema: string;
};

export type EligibleTablesApiOutput = {
  eligible_tables: EligibleTable[];
};
