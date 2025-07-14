import { PropsWithChildren, useState } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { Input, Modal, Form } from 'antd';
import SubmitButtonGroup from 'components/SubmitButtonGroup';
import CopyToClipboard from 'components/CopyToClipboard';
import Text from 'components/Text';

export type ConfirmDeleteProps = {
  title: string;
  visible: boolean;
  disclaimer?: string;
  prompt: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmDelete({
  title,
  visible,
  disclaimer,
  children,
  prompt,
  confirmText,
  onCancel,
  onConfirm,
}: PropsWithChildren<ConfirmDeleteProps>) {
  const [form] = Form.useForm();
  const [confirmEnabled, setConfirmEnabled] = useState(false);

  const inputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmEnabled(event.target.value === confirmText);
  };

  const resetState = () => {
    form.setFieldsValue({ 'confirm-entity-name': '' });
    setConfirmEnabled(false);
  };

  const handleConfirm = () => {
    if (form.getFieldValue('confirm-entity-name') === confirmText) {
      resetState();
      onConfirm();
    }
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  return (
    <Modal
      closable={false}
      footer={
        <div className="py-1">
          <SubmitButtonGroup
            disabled={!confirmEnabled}
            form="confirm-delete"
            onCancel={handleCancel}
            warn
          />
        </div>
      }
      onCancel={handleCancel}
      title={title}
      open={visible}
    >
      <Form
        aria-label="confirm-delete"
        id="confirm-delete"
        onFinish={handleConfirm}
        form={form}
      >
        {children && children}
        <Text className="mb-4">{prompt}</Text>
        <div className="mb-4 flex rounded-md border border-neutral-300 bg-neutral-100">
          <code className="flex-grow p-2">{confirmText}</code>
          <CopyToClipboard textToCopy={confirmText}>
            <div className="border-l border-neutral-300 bg-white px-3 py-2 text-crate-blue hover:text-[#23bfde]">
              <CopyOutlined />
            </div>
          </CopyToClipboard>
        </div>
        <Form.Item name="confirm-entity-name">
          <Input
            aria-label="confirm entity name"
            placeholder={confirmText}
            onChange={inputChanged}
          />
        </Form.Item>
        <Text className="mb-6">
          {disclaimer ||
            'Be aware that this action cannot be reversed. All data will be lost.'}
        </Text>
      </Form>
    </Modal>
  );
}

export default ConfirmDelete;
