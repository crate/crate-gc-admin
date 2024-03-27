import { useState } from 'react';
import { Spin, Table } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Button from '../Button';
import NoDataView from '../NoDataView';
import { RenderExpandIcon } from 'rc-table/lib/interface';

type TablePropsType<RecordType extends object> = React.ComponentProps<
  typeof Table<RecordType>
>;
type TableColumnsType<RecordType extends object> =
  TablePropsType<RecordType>['columns'];
type TableSizeType<RecordType extends object> = TablePropsType<RecordType>['size'];
type TableScrollType<RecordType extends object> =
  TablePropsType<RecordType>['scroll'];
type TableExpandableType<RecordType extends object> =
  TablePropsType<RecordType>['expandable'];
type TablePaginationType<RecordType extends object> =
  TablePropsType<RecordType>['pagination'];
type TableSummaryType<RecordType extends object> =
  TablePropsType<RecordType>['summary'];
type UnaryFunction<RecordType, ReturnType> = (el: RecordType) => ReturnType;

export type CrateTableProps<RecordType extends object> = {
  columns: TableColumnsType<RecordType>;
  dataSource?: readonly RecordType[];
  emptyText?: string;
  rowClassName?: string | UnaryFunction<RecordType, string>;
  rowKey: Extract<keyof RecordType, string> | UnaryFunction<RecordType, string>;
  showHeader?: boolean;
  size?: TableSizeType<RecordType>;
  scroll?: TableScrollType<RecordType>;
  expandable?: TableExpandableType<RecordType>;
  pagination?: TablePaginationType<RecordType>;
  testId?: string;
  summary?: TableSummaryType<RecordType>;
};

function CrateTable<RecordType extends object>({
  dataSource = [],
  columns,
  rowKey,
  showHeader = true,
  rowClassName,
  emptyText = '',
  size,
  scroll,
  expandable,
  pagination = false,
  testId,
  summary,
}: CrateTableProps<RecordType>) {
  const [tableEmpty, setTableEmpty] = useState(false);

  const showBody = () => {
    if (!dataSource) {
      return (
        <div className="mt-10 text-center">
          <Spin
            data-testid="crate-table-loading-spinner"
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          />
        </div>
      );
    }
    return '';
  };

  const customExpandIcon: RenderExpandIcon<RecordType> = ({
    expanded,
    onExpand,
    record,
  }) => {
    return (
      <button
        className="mr-2.5 size-[17px] cursor-pointer p-0 text-neutral-400 transition duration-200 hover:border-crate-blue hover:text-crate-blue"
        onClick={event => onExpand(record, event)}
        type={Button.types.BUTTON}
      >
        {expanded ? '−' : '+'}
      </button>
    );
  };

  const handleChange: TablePropsType<RecordType>['onChange'] = (
    _pagination,
    _filters,
    _sorter,
    tableContent,
  ) => {
    setTableEmpty(tableContent.currentDataSource.length === 0);
  };

  const getDescriptionOfEmptyTable = () => {
    if (tableEmpty) return 'No results found';
    return emptyText.length > 0 ? emptyText : 'No data';
  };

  return (
    <div data-testid={testId}>
      <Table<RecordType>
        bordered={false}
        className={!showHeader ? 'without-header' : ''}
        columns={columns}
        dataSource={dataSource}
        onChange={handleChange}
        pagination={pagination}
        rowClassName={rowClassName}
        rowKey={rowKey}
        showHeader={showHeader}
        size={size}
        scroll={scroll}
        expandable={expandable && { ...expandable, expandIcon: customExpandIcon }}
        summary={summary}
      />
      {dataSource &&
      (tableEmpty || dataSource.length === 0) &&
      (!summary || (summary && !summary(dataSource))) ? (
        <div className="mt-10 text-center">
          <NoDataView description={getDescriptionOfEmptyTable()} />
        </div>
      ) : (
        showBody()
      )}
    </div>
  );
}

export default CrateTable;
