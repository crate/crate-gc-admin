import { useState } from 'react';
import { Modal, Table } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, CopyToClipboard, NoDataView } from 'components';

type SQLHistoryProps = {
  history: string[];
  showHistory: boolean;
  clearHistory: () => void;
  removeHistoryItem: (index: number) => void;
  displayHistoryItem: (query: string) => void;
  setShowHistory: (show: boolean) => void;
};

function SQLHistory({
  history,
  showHistory,
  clearHistory,
  removeHistoryItem,
  displayHistoryItem,
  setShowHistory,
}: SQLHistoryProps) {
  const LINES_TO_SHOW = 3;
  const [expandedQueries, setExpandedQueries] = useState<number[]>([]);

  const drawQuery = (query: string, index: number) => {
    const lines = query.split('\n');
    const canBeExpanded = lines.length > LINES_TO_SHOW;
    const isExpanded = canBeExpanded && expandedQueries.includes(index);
    const output =
      canBeExpanded && !isExpanded
        ? lines.slice(0, LINES_TO_SHOW).join('\n') + '...'
        : query;

    return (
      <div>
        <pre
          className="cursor-pointer text-xs hover:text-crate-blue"
          onClick={() => {
            setExpandedQueries([]);
            displayHistoryItem(query);
          }}
        >
          {output}
        </pre>
        {canBeExpanded && !isExpanded && (
          <span
            className="cursor-pointer whitespace-nowrap text-xs text-crate-blue hover:underline"
            onClick={() => setExpandedQueries([...expandedQueries, index])}
          >
            Show more
          </span>
        )}
        {canBeExpanded && isExpanded && (
          <span
            className="cursor-pointer whitespace-nowrap text-xs text-crate-blue hover:underline"
            onClick={() =>
              setExpandedQueries(expandedQueries.filter(i => i !== index))
            }
          >
            Show less
          </span>
        )}
      </div>
    );
  };

  const tableData = history.map((query: string, index: number) => {
    return {
      key: `query_${index}`,
      query: drawQuery(query, index),
      manage: (
        <div className="flex gap-4">
          <CopyToClipboard textToCopy={query}>
            <CopyOutlined className="text-crate-blue" />
          </CopyToClipboard>
          <button
            onClick={() => {
              setExpandedQueries(
                expandedQueries
                  .filter(i => i !== index)
                  .map(i => (i > index ? i - 1 : i)),
              );
              removeHistoryItem(index);
            }}
            type="button"
          >
            <DeleteOutlined className="text-crate-blue" />
          </button>
        </div>
      ),
    };
  });

  return (
    <Modal
      bodyStyle={{ maxHeight: '75dvh', overflowY: 'auto' }}
      footer={
        <div className="flex justify-end">
          <Button
            disabled={history.length === 0}
            onClick={() => {
              setExpandedQueries([]);
              clearHistory();
            }}
            size="small"
          >
            Clear history
          </Button>
        </div>
      }
      onCancel={() => {
        setExpandedQueries([]);
        setShowHistory(false);
      }}
      open={showHistory}
      title="History"
      width="60%"
    >
      <div className="border">
        <Table
          columns={[
            {
              dataIndex: 'query',
              title: 'SQL query',
              key: 'query',
              width: '100%',
            },
            { dataIndex: 'manage', key: 'manage' },
          ]}
          dataSource={tableData}
          pagination={{ defaultPageSize: 20, position: ['bottomRight'] }}
          scroll={{
            x: 'max-content',
          }}
          size="small"
        />
        {history.length === 0 && <NoDataView description="No history available" />}
      </div>
    </Modal>
  );
}

export default SQLHistory;
