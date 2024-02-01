import { Modal } from 'antd';
import Button from '../../components/Button';
import SyntaxHighlighter from '../SyntaxHighlighter';
import DisplayUTCDate from '../DisplayUTCDate';

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
      <div className="max-h-[400px] overflow-auto flex flex-col gap-4">
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
