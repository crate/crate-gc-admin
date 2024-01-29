import { Input, Modal, Form } from 'antd';
import { PropsWithChildren, useState } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import CopyToClipboard from '../CopyToClipboard';
import SubmitButtonGroup from '../SubmitButtonGroup';
import Text from '../Text';

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
        <div className="bg-neutral-100 border border-neutral-300 flex mb-4 rounded-md">
          <code className="flex-grow p-2">{confirmText}</code>
          <CopyToClipboard textToCopy={confirmText}>
            <div className="px-3 py-2 border-l border-neutral-300 bg-white text-crate-blue hover:text-[#23bfde]">
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
