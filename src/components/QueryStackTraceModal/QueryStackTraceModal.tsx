import { Modal } from 'antd';
import SyntaxHighlighter from 'components/SyntaxHighlighter';
import DisplayUTCDate from 'components/DisplayUTCDate';
import Button from 'components/Button';

export type QueryStackTraceModalProps = {
  modalTitle: string;
  visible?: boolean;
  onClose: () => void;
  query: string;
  timestamp: string;
  queryError: string;
};

function QueryStackTraceModal({
  modalTitle,
  visible = false,
  onClose,
  query,
  queryError,
  timestamp,
}: QueryStackTraceModalProps) {
  return (
    <Modal
      title={modalTitle}
      open={visible}
      onOk={onClose}
      onCancel={onClose}
      width="80%"
      footer={
        <div>
          <Button onClick={onClose}>OK</Button>
        </div>
      }
    >
      <div className="flex max-h-[400px] flex-col gap-4 overflow-auto">
        <SyntaxHighlighter
          language="sql"
          title={
            <>
              Failed Query Execution (<DisplayUTCDate isoDate={timestamp} tooltip />)
            </>
          }
        >
          {query}
        </SyntaxHighlighter>
        <SyntaxHighlighter title="Stack Trace">{queryError}</SyntaxHighlighter>
      </div>
    </Modal>
  );
}

export default QueryStackTraceModal;
