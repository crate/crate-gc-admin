import { Modal } from 'antd';
import Button from '../../components/Button';
import SyntaxHighlighter from '../SyntaxHighlighter';

export type QueryStackTraceModalProps = {
  modalTitle: string;
  visible?: boolean;
  onClose?: () => void;
  query: string;
  queryError: string;
};

function QueryStackTraceModal({
  modalTitle,
  visible = false,
  onClose,
  query,
  queryError,
}: QueryStackTraceModalProps) {
  const onOk = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onOk={onOk}
      width="80%"
      footer={
        <div>
          <Button onClick={onClose}>OK</Button>
        </div>
      }
    >
      <div className="max-h-[400px] overflow-auto flex flex-col gap-4">
        <SyntaxHighlighter language="sql" title="Failed Query Execution">
          {query}
        </SyntaxHighlighter>
        <SyntaxHighlighter title="Stack Trace">{queryError}</SyntaxHighlighter>
      </div>
    </Modal>
  );
}

export default QueryStackTraceModal;
