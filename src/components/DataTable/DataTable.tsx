import * as React from 'react';
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
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
  TableOptions,
} from '@tanstack/react-table';
import { Button, Pagination, Table } from 'components';
import { useEffect, useState } from 'react';
import DataTableFilters from './DataTableFilters';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { cn } from 'utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { arrIncludesElement } from 'utils';

export const DEFAULT_ELEMENTS_PER_PAGE = 10;

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  noResultsLabel?: string;
  className?: string;
  enableFilters?: boolean;
  enableSearchBox?: boolean;
  elementsPerPage?: number;
  additionalState?: unknown;
  defaultSorting?: ColumnSort[];
  hidePaginationPageSize?: boolean;
  hidePaginationWhenSinglePage?: boolean;
  stickyHeader?: boolean;
  paginationContent?: React.ReactNode;
  paginationAtTop?: boolean;
  getRowId?: (data: TData, index: number, row?: Row<TData>) => string;
  customTableHeader?: React.ReactNode;
  disablePagination?: boolean;
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
  noResultsLabel = 'No results',
  enableFilters = false,
  enableSearchBox = false,
  hidePaginationPageSize = false,
  hidePaginationWhenSinglePage = false,
  stickyHeader = false,
  elementsPerPage = DEFAULT_ELEMENTS_PER_PAGE,
  additionalState,
  paginationContent,
  paginationAtTop = false,
  getRowId,
  customTableHeader = null,
  disablePagination = false,
}: DataTableProps<TData, TValue>) {
  const location = useLocation();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: elementsPerPage,
  });
  const [sorting, setSorting] = useState<SortingState>(defaultSorting || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    getFiltersFromQuery(location?.search, columns),
  );

  const getReactTableOptions = (): TableOptions<TData> => {
    const options: TableOptions<TData> = {
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      getSortedRowModel: getSortedRowModel(),
      filterFns: {
        arrIncludesElement: arrIncludesElement,
      },
      initialState: {
        additionalState,
      },
      state: {
        sorting,
        columnFilters,
        globalFilter: searchTerm,
        pagination,
      },
      defaultColumn: {
        filterFn: 'arrIncludesElement',
        enableSorting: false,
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setSearchTerm,
      onPaginationChange: setPagination,
      globalFilterFn: 'includesString',
      getRowId,
    };

    // include pagination if it is not disabled
    if (!disablePagination) {
      options['getPaginationRowModel'] = getPaginationRowModel();
    }

    return options;
  };

  const table = useReactTable(getReactTableOptions());
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
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

  const renderPagination = () => {
    // return null when there is nothing to show
    if (!paginationContent && pageCount === 1 && hidePaginationWhenSinglePage) {
      return null;
    }

    return (
      <div
        className={`flex min-h-10 items-center justify-between px-2 py-1 ${paginationAtTop ? 'border-b' : 'border-t'}`}
      >
        {paginationContent ? paginationContent : <div />}
        {!(pageCount === 1 && hidePaginationWhenSinglePage) && (
          <Pagination
            testId="datatable-pagination"
            className="justify-end"
            pageSize={pageSize}
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={(pageNumber: number) => {
              table.setPageIndex(pageNumber - 1);
            }}
            onPageSizeChange={(pageSize: number) => {
              table.setPageSize(pageSize);
            }}
            hidePageSize={hidePaginationPageSize}
          />
        )}
      </div>
    );
  };

  // Sync col filters with query param!
  useEffect(() => {
    const urlSearch = new URLSearchParams(location?.search);

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
    <>
      {/* Pagination */}
      {!disablePagination && paginationAtTop && renderPagination()}

      {/* Filters */}
      {enableFilters && (
        <DataTableFilters
          data={data}
          table={table}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          renderHeader={renderHeader}
          enableSearchBox={enableSearchBox}
        />
      )}

      {/* Table */}
      <Table className={className}>
        {customTableHeader ? (
          customTableHeader
        ) : (
          <Table.Header>
            {table.getHeaderGroups().map(headerGroup => (
              <Table.RowHeader key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <Table.Head
                      key={header.id}
                      colSpan={header.colSpan}
                      className={stickyHeader ? 'sticky top-0 z-10 bg-slate-50' : ''}
                      style={{
                        width: header.column.columnDef.meta?.width
                          ? header.column.columnDef.meta.width
                          : undefined,
                        minWidth: header.column.columnDef.meta?.minWidth
                          ? header.column.columnDef.meta.minWidth
                          : undefined,
                      }}
                      data-testid={`head_col_${header.id}`}
                      data-sorting={header.column.getIsSorted() || 'false'}
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
                          id={`sorting_button_${header.id}`}
                        >
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUpOutlined className="ml-2 size-4" />
                          ) : (
                            <ArrowDownOutlined className="ml-2 size-4" />
                          )}
                        </Button>
                      )}
                    </Table.Head>
                  );
                })}
              </Table.RowHeader>
            ))}
          </Table.Header>
        )}

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
            <Table.Row className="hover:bg-transparent">
              <Table.Cell
                colSpan={columns.length}
                className="h-24 pt-10 text-center leading-5 tracking-wide text-neutral-500"
              >
                {noResultsLabel}
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>

      {/* Pagination */}
      {!disablePagination && !paginationAtTop && renderPagination()}
    </>
  );
}
