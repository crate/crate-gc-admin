import { ColumnDef } from '@tanstack/react-table';
import { ErrorMessage } from 'types/cratedb';

export type SampleData = {
  name: string;
  surname: string;
};

export type SampleDataWithError = SampleData & {
  errorMessages: ErrorMessage[];
};

export const generateData = (numberOfElements: number = 250): SampleData[] => {
  return Array.from({ length: numberOfElements }, (_, i) => ({
    name: `NAME_${i}`,
    surname: `SURNAME_${i}`,
  }));
};

export const colDef: ColumnDef<SampleData, unknown>[] = [
  {
    header: 'Name',
    id: 'name',
    meta: {
      filter: {
        label: 'Names',
        accessorFn: sample => sample.name,
      },
    },
    accessorKey: 'name',
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    header: 'Surname',
    id: 'surname',
    accessorKey: 'surname',
  },
];
