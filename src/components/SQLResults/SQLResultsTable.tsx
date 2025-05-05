import { Radio } from 'antd';
import { ColumnDef } from '@tanstack/react-table';
import _ from 'lodash';
import Chip from 'components/Chip';
import DataTable from 'components/DataTable';
import Switch from 'components/Switch';
import TypeAwareValue from './TypeAwareValue/TypeAwareValue';
import { dbTypeToHumanReadable } from './utils';
import Papa from 'papaparse';
import {
  ColumnType,
  QueryResult,
  QueryResultError,
  QueryResultSuccess,
} from 'types/query';
import useSessionStore from 'state/session';

type Params = {
  result: QueryResult | undefined;
  format?: boolean;
};

type JSONData = {
  json: string;
  SQL_RESULTS_ROW_NUMBER: React.ReactNode;
};
type CSVData = {
  csv: string;
};
type TableViewData = Record<string, React.ReactNode> & {
  SQL_RESULTS_ROW_NUMBER: React.ReactNode;
};
type NoColumnsData = {
  result: string;
};

type DataTableColumnData<T> = {
  columns: ColumnDef<T>[];
  data: T[];
};

function SQLResultsTable({ result }: Params) {
  const { showErrorTrace, tableResultsFormat } = useSessionStore();
  const setShowErrorTrace = useSessionStore(store => store.setShowErrorTrace);
  const setTableResultsFormat = useSessionStore(
    store => store.setTableResultsFormat,
  );

  const toggleErrorTrace = () => {
    setShowErrorTrace(!showErrorTrace);
  };

  const renderErrorTable = (result: QueryResultError) => {
    return (
      <div className="p-4">
        <div className="flex min-h-12 flex-row items-center justify-between rounded border p-2">
          <div className="flex items-center gap-4 pr-2 text-sm">
            <Chip color={Chip.colors.RED}>Error</Chip>
            {typeof result.error.code !== 'undefined' && (
              <a
                href="https://cratedb.com/docs/crate/reference/en/latest/interfaces/http.html#error-codes"
                target="_blank"
              >
                {result.error?.code}
              </a>
            )}
            <span className="font-mono text-xs">{result.error?.message}</span>
          </div>
          {result.error_trace && (
            <div className="flex select-none items-center gap-2">
              <span
                className="cursor-pointer whitespace-nowrap text-sm"
                onClick={toggleErrorTrace}
              >
                Show error trace
              </span>
              <Switch.Root
                checked={showErrorTrace}
                onCheckedChange={() => setShowErrorTrace(!showErrorTrace)}
                size="small"
              />
            </div>
          )}
        </div>
        {showErrorTrace && (
          <div className="mt-4">
            <div className="font-bold">Error trace:</div>
            <pre className="text-xs">{result.error_trace}</pre>
          </div>
        )}
      </div>
    );
  };

  const nicelyHandleTypes = (
    type: ColumnType,
    value: unknown,
    numColumns: number,
  ): React.ReactNode => {
    if (tableResultsFormat === 'pretty') {
      return (
        <TypeAwareValue
          value={value}
          columnType={type}
          totalNumColumns={numColumns}
        />
      );
    }
    if (tableResultsFormat === 'raw' && typeof value === 'boolean') {
      return value.toString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value as string;
  };

  const asJson = (result: QueryResultSuccess): DataTableColumnData<JSONData> => {
    const columns: ColumnDef<JSONData>[] = [
      {
        header: () => <div className="font-bold">JSON</div>,
        accessorKey: 'json',
        cell: ({ cell }) => (
          // select all contents on double click
          <pre
            onDoubleClick={event => {
              window?.getSelection()?.selectAllChildren(event.currentTarget);
            }}
          >
            {cell.getValue<string>()}
          </pre>
        ),
      },
    ];

    // add row number
    columns.unshift({
      header: () => <div className="w-1"></div>,
      accessorKey: 'SQL_RESULTS_ROW_NUMBER',
      cell: ({ cell }) => cell.getValue(),
      meta: { width: '1px' },
    });

    const data: JSONData[] = result.rows
      .map(row =>
        _.zip(result.cols, row).reduce((result: Record<string, unknown>, arr) => {
          result[arr[0] as string] = arr[1];
          return result;
        }, {}),
      )
      .map((row, idx) => {
        return {
          json: JSON.stringify(row),
          SQL_RESULTS_ROW_NUMBER: (
            <div className="text-right text-xs text-neutral-400">{idx + 1}</div>
          ),
        };
      });

    return {
      columns,
      data,
    } satisfies DataTableColumnData<JSONData>;
  };

  const asCSV = (result: QueryResultSuccess): DataTableColumnData<CSVData> => {
    const columns: ColumnDef<CSVData>[] = [
      {
        header: () => <div className="font-bold">CSV</div>,
        accessorKey: 'csv',
        cell: ({ cell }) => (
          // select all contents on double click
          <pre
            onDoubleClick={event => {
              window?.getSelection()?.selectAllChildren(event.currentTarget);
            }}
          >
            {cell.getValue<string>()}
          </pre>
        ),
      },
    ];

    const unparsedCSV = result.rows.map(row =>
      _.zip(result.cols, row)
        .map(arr => {
          arr[1] =
            typeof arr[1] === 'object' || typeof arr[1] === 'string'
              ? JSON.stringify(arr[1])
              : arr[1];
          return arr;
        })
        .reduce((result: Record<string, unknown>, arr: [unknown, unknown]) => {
          result[arr[0] as string] = arr[1];
          return result;
        }, {}),
    );
    const csvString = Papa.unparse(unparsedCSV).replace(/"""/g, '"');

    return {
      columns,
      data: [
        {
          csv:
            csvString ||
            'Looks like this data cannot be displayed as a CSV. We tried, sorry.',
        },
      ] satisfies CSVData[],
    } satisfies DataTableColumnData<CSVData>;
  };

  const asTable = (
    result: QueryResultSuccess,
  ): DataTableColumnData<TableViewData> => {
    const columns: ColumnDef<TableViewData>[] = _.zip(
      result.col_types,
      result.cols,
    ).flatMap((arr, idx) => {
      const [type, col] = arr;
      return {
        header: () => (
          <div>
            <div className="overflow-hidden text-ellipsis font-bold">{col}</div>
            <div className="text-xs opacity-50">{dbTypeToHumanReadable(type)}</div>
          </div>
        ),
        accessorKey: `col${idx}`,
        cell: ({ cell }) => cell.getValue(),
      };
    });

    // prepend row number
    columns.unshift({
      header: () => <div className="w-1"></div>,
      accessorKey: 'SQL_RESULTS_ROW_NUMBER',
      cell: ({ cell }) => cell.getValue(),
      meta: { width: '1px' },
    });

    const data: TableViewData[] = result?.rows
      .map(row => {
        const res: Record<string, React.ReactNode> = {};
        const len = result.cols.length;
        _.zip(result.col_types, row).forEach((arr, idx) => {
          const [t, v] = arr;
          // Array types are noted as [100, X]
          const actualType = Array.isArray(t) ? t[0]! : t!;
          const actualValue = nicelyHandleTypes(actualType!, v, len);

          res[`col${idx}`] = <pre>{actualValue}</pre>;
        });
        return res;
      })
      .map((row, idx) => ({
        ...row,
        SQL_RESULTS_ROW_NUMBER: (
          <div className="text-right text-xs text-neutral-400">{idx + 1}</div>
        ),
      }));

    return {
      columns,
      data,
    } satisfies DataTableColumnData<TableViewData>;
  };

  if (!result) {
    return null;
  }

  if ('error' in result) {
    return renderErrorTable(result);
  }

  let output:
    | DataTableColumnData<JSONData>
    | DataTableColumnData<CSVData>
    | DataTableColumnData<TableViewData>
    | DataTableColumnData<NoColumnsData>;

  if (tableResultsFormat === 'json') {
    output = asJson(result);
  } else if (tableResultsFormat === 'csv') {
    output = asCSV(result);
  } else {
    output = asTable(result);
  }

  if (
    output.columns.length === 1 &&
    ['json', 'pretty', 'raw'].includes(tableResultsFormat)
  ) {
    output = {
      columns: [
        {
          header: () => <span className="font-bold">result</span>,
          accessorKey: 'result',
        },
      ],
      data: [
        {
          result: 'OK',
        },
      ],
    } satisfies DataTableColumnData<NoColumnsData>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <DataTable
        {...(output as DataTableColumnData<unknown>)}
        elementsPerPage={100}
        hidePaginationPageSize
        stickyHeader
        className="block h-full w-full overflow-auto"
        paginationAtTop
        paginationContent={
          <div className="flex w-full items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <Chip color={Chip.colors.GREEN}>OK</Chip>
              <div className="whitespace-nowrap leading-[1.1] text-neutral-600">
                <div>
                  {`${result.rowcount}`} {result.rowcount === 1 ? 'row' : 'rows'}
                </div>
                <div>{(Math.round(result?.duration) / 1000).toFixed(3)} seconds</div>
              </div>
            </div>
            <Radio.Group
              className="whitespace-nowrap"
              options={[
                { label: 'Pretty', value: 'pretty' },
                { label: 'Raw', value: 'raw' },
                { label: 'CSV', value: 'csv' },
                { label: 'JSON', value: 'json' },
              ]}
              onChange={evt => setTableResultsFormat(evt.target.value)}
              value={tableResultsFormat}
              optionType="button"
              buttonStyle="solid"
              size="small"
            />
          </div>
        }
      />
    </div>
  );
}

export default SQLResultsTable;
