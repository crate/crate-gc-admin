import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnFiltersState,
  Header,
  SortingState,
  ColumnSort,
  Row,
} from '@tanstack/react-table';
import { Button, Pagination, Table } from 'components';
import { useEffect, useState } from 'react';
import DataTableFilters from './DataTableFilters';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { cn } from 'utils';
import { useLocation, useNavigate } from 'react-router-dom';

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  enableFilters?: boolean;
  elementsPerPage?: number;
  additionalState?: unknown;
  defaultSorting?: ColumnSort[];
  getRowId?: (data: TData, index: number, row?: Row<TData>) => string;
};

const getFiltersFromQuery = <TData, TValue>(
  search: string,
  columns: ColumnDef<TData, TValue>[],
) => {
  const urlSearch = new URLSearchParams(search);
  const columnFilters: ColumnFiltersState = [];
  const enableFilterKeys = columns.filter(c => c.enableColumnFilter).map(c => c.id);

  urlSearch.forEach((value, key) => {
    if (enableFilterKeys.includes(key)) {
      columnFilters.push({
        id: key,
        value: value.split(','),
      });
    }
  });

  return columnFilters;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  defaultSorting,
  enableFilters = false,
  elementsPerPage = 50,
  additionalState,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>(defaultSorting || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    getFiltersFromQuery(location.search, columns),
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: elementsPerPage,
      },
      additionalState,
    },
    state: {
      sorting,
      columnFilters,
      globalFilter: searchTerm,
    },
    defaultColumn: {
      filterFn: 'arrIncludesSome',
      enableSorting: false,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearchTerm,
    globalFilterFn: 'includesString',
    getRowId,
  });

  const currentPage = table.getState().pagination.pageIndex;
  const pageCount = Math.max(1, table.getPageCount());

  const renderHeader = (
    header: Header<TData, unknown>,
    renderingFilters: boolean = false,
  ) => {
    if (header.isPlaceholder) {
      return null;
    }
    if (
      header.column.columnDef.meta &&
      header.column.columnDef.meta.filter &&
      header.column.columnDef.meta.filter.label &&
      renderingFilters
    ) {
      return header.column.columnDef.meta.filter.label;
    }

    return flexRender(header.column.columnDef.header, header.getContext());
  };

  // Sync col filters with query param!
  useEffect(() => {
    const urlSearch = new URLSearchParams(location.search);

    // Clean all filter key from urlSearch
    const enableFilterKeys = columns
      .filter(c => c.enableColumnFilter)
      .map(c => c.id!);
    enableFilterKeys.forEach(key => {
      urlSearch.delete(key);
    });

    columnFilters.forEach(colFilter => {
      const value = colFilter.value as string[];
      if (value.length === 0) {
        urlSearch.delete(colFilter.id);
      } else {
        urlSearch.set(colFilter.id, (colFilter.value as string[]).join(','));
      }
    });

    navigate(`?${urlSearch.toString()}`);
  }, [columnFilters]);

  return (
    <div className="flex flex-col gap-2">
      {/* Filters */}
      {enableFilters && (
        <DataTableFilters
          data={data}
          table={table}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          renderHeader={renderHeader}
        />
      )}

      {/* Table */}
      <div>
        <Table className={className}>
          <Table.Header>
            {table.getHeaderGroups().map(headerGroup => (
              <Table.RowHeader key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <Table.Head
                      key={header.id}
                      style={{
                        width: header.column.columnDef.meta
                          ? header.column.columnDef.meta.columnWidth
                          : undefined,
                      }}
                    >
                      {renderHeader(header)}

                      {header.column.getCanSort() && (
                        <Button
                          kind={Button.kinds.TERTIARY}
                          className={cn(
                            '!leading-3',
                            {
                              'opacity-20': !header.column.getIsSorted(),
                              'opacity-70': header.column.getIsSorted(),
                            },
                            'hover:opacity-100',
                          )}
                          onClick={() => {
                            header.column.toggleSorting(
                              header.column.getIsSorted() !== 'desc',
                            );
                          }}
                        >
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUpOutlined className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowDownOutlined className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </Table.Head>
                  );
                })}
              </Table.RowHeader>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <Table.Row
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  data-row-key={row.id}
                >
                  {row.getVisibleCells().map(cell => (
                    <Table.Cell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination className="justify-end">
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              disabled={currentPage === 0}
              onClick={() => {
                table.setPageIndex(currentPage - 1);
              }}
            />
          </Pagination.Item>
          {currentPage !== 0 && (
            <Pagination.Item>
              <Pagination.Button
                onClick={() => {
                  table.setPageIndex(0);
                }}
              >
                1
              </Pagination.Button>
            </Pagination.Item>
          )}
          {currentPage > 1 && (
            <Pagination.Item>
              <Pagination.Ellipsis />
            </Pagination.Item>
          )}
          {currentPage > 1 && (
            <Pagination.Item>
              <Pagination.Button
                onClick={() => {
                  table.setPageIndex(currentPage - 1);
                }}
              >
                {currentPage - 1 + 1}
              </Pagination.Button>
            </Pagination.Item>
          )}
          <Pagination.Item>
            <Pagination.Button isActive>{currentPage + 1}</Pagination.Button>
          </Pagination.Item>
          {currentPage + 2 < pageCount && (
            <Pagination.Item>
              <Pagination.Button
                onClick={() => {
                  table.setPageIndex(currentPage + 1);
                }}
              >
                {currentPage + 1 + 1}
              </Pagination.Button>
            </Pagination.Item>
          )}
          {currentPage + 3 < pageCount && (
            <Pagination.Item>
              <Pagination.Ellipsis />
            </Pagination.Item>
          )}
          {currentPage !== pageCount - 1 && (
            <Pagination.Item>
              <Pagination.Button
                onClick={() => {
                  table.setPageIndex(pageCount - 1);
                }}
              >
                {pageCount}
              </Pagination.Button>
            </Pagination.Item>
          )}
          <Pagination.Item>
            <Pagination.Next
              disabled={currentPage === pageCount - 1}
              onClick={() => {
                table.setPageIndex(currentPage + 1);
              }}
            />
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}
