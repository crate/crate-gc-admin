import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { Header, Table } from '@tanstack/react-table';
import { Button, Input, MultiSelect } from 'components';
import { distinct } from 'utils';

export type DataTableFiltersProps<TData> = {
  data: TData[];
  table: Table<TData>;
  searchTerm: string;
  enableSearchBox?: boolean;
  setSearchTerm: (value: string) => void;
  renderHeader: (
    header: Header<TData, unknown>,
    renderingFilters: boolean,
  ) => React.ReactNode;
};

export default function DataTableFilters<TData>({
  data,
  table,
  searchTerm,
  enableSearchBox = false,
  setSearchTerm,
  renderHeader,
}: DataTableFiltersProps<TData>) {
  const allColumns = table
    .getHeaderGroups()
    .flatMap(el => el.headers)
    .filter(
      header =>
        (header.column.accessorFn ||
          header.column.columnDef.meta?.filter?.accessorFn) &&
        header.column.columnDef.enableColumnFilter,
    );

  const activeFilters = table.getState().columnFilters;

  return (
    <div className="flex flex-col rounded-sm">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex gap-2">
          {allColumns.map(header => {
            const colMeta = header.column.columnDef.meta;
            const accessorFn =
              colMeta?.filter?.accessorFn || header.column.accessorFn;
            const searchBarEnabled =
              colMeta && colMeta.filter && colMeta.filter.searchBar;

            // Get all elements with distinct
            const filterElement = data.map(accessorFn!);
            const keys = distinct(filterElement);

            const colFilter = activeFilters.find(el => el.id === header.id);

            const updateFilter = (values: string[]) => {
              if (!colFilter) {
                // Add new filter
                table.setColumnFilters([
                  ...activeFilters,
                  {
                    id: header.id,
                    value: values,
                  },
                ]);
              } else {
                table.setColumnFilters([
                  ...activeFilters.filter(el => el.id !== header.id),
                  {
                    id: header.id,
                    value: values,
                  },
                ]);
              }
            };

            return (
              <MultiSelect
                key={header.id}
                value={colFilter ? (colFilter.value as string[]) : []}
                searchBar={searchBarEnabled}
                onChange={updateFilter}
                elements={keys.map(key => {
                  const sampleElementIndex = data.findIndex(
                    (el, index) => accessorFn!(el, index) === key,
                  );
                  const sampleElement = data[sampleElementIndex];

                  return {
                    id: key as string,
                    label: accessorFn!(sampleElement, sampleElementIndex) as string,
                  };
                })}
              >
                {renderHeader(header, true)} (
                {colFilter && colFilter.value
                  ? (colFilter.value as string[]).length
                  : 0}
                /{keys.length})
              </MultiSelect>
            );
          })}
        </div>

        {enableSearchBox && (
          <span className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 h-8 w-8 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
              }}
              className="w-[400px] px-8"
            />
            {searchTerm.length > 0 && (
              <Button
                kind={Button.kinds.TERTIARY}
                size={Button.sizes.SMALL}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => {
                  setSearchTerm('');
                }}
              >
                <CloseOutlined />
              </Button>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
