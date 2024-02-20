import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { Header, Table } from '@tanstack/react-table';
import { Button, Chip, Input, MultiSelect } from 'components';
import { distinct } from 'utils';

export type DataTableFiltersProps<TData> = {
  data: TData[];
  table: Table<TData>;
  searchTerm: string;
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
      <div className="flex gap-2 flex-row-reverse justify-between items-center">
        <span className="relative">
          <SearchOutlined className="absolute w-8 h-8 top-1/2 left-3 -translate-y-1/2 text-slate-400" />
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
              className="absolute top-1/2 -translate-y-1/2 right-3"
              onClick={() => {
                setSearchTerm('');
              }}
            >
              <CloseOutlined />
            </Button>
          )}
        </span>

        <div className="flex gap-2">
          {allColumns.map(header => {
            const accessorFn =
              header.column.columnDef.meta?.filter?.accessorFn ||
              header.column.accessorFn;

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
      </div>
      {allColumns.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          {activeFilters.flatMap(el => el.value).length > 0 && (
            <div className="flex gap-2 items-center">
              <span>Filters: </span>
              {activeFilters.map(filter => {
                return (filter.value as string[]).map(value => {
                  return (
                    <Chip key={value} className="h-fit">
                      {value}{' '}
                      <Button
                        kind={Button.kinds.TERTIARY}
                        className="!leading-3 text-xs ml-1 text-red-600 hover:text-red-800 !py-0"
                        onClick={() => {
                          table.setColumnFilters([
                            ...activeFilters.filter(el => el.id !== filter.id),
                            {
                              id: filter.id,
                              value: (filter.value as string[]).filter(
                                v => v !== value,
                              ),
                            },
                          ]);
                        }}
                      >
                        <CloseOutlined />
                      </Button>
                    </Chip>
                  );
                });
              })}

              <Button
                kind={Button.kinds.TERTIARY}
                className="!leading-3"
                size={Button.sizes.SMALL}
                onClick={() => {
                  table.setColumnFilters([]);
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
