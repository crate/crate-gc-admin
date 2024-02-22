import '@tanstack/react-table';
import type { AccessorFn } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // Extends ColumnMeta interface
  interface ColumnMeta<TData, TValue> {
    columnWidth?: string | number;
    filter?: {
      label?: string;
      accessorFn?: AccessorFn<TData, TValue>;
      searchBar?: boolean;
    };
  }

  // Add additional state to TableState and InitialTableState
  interface TableState {
    additionalState?: unknown;
  }
  interface InitialTableState {
    additionalState?: unknown;
  }
}
