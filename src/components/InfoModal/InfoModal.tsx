import { PropsWithChildren } from 'react';
import { Modal } from 'antd';

export type InfoModalProps = {
  title: string;
  visible?: boolean;
  onClose?: () => void;
};

function InfoModal({
  title,
  visible = false,
  onClose,
  children,
}: PropsWithChildren<InfoModalProps>) {
  const onOk = () => {
    if (onClose) {
      onClose();
    }
  };

  const onCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal title={title} open={visible} onCancel={onCancel} onOk={onOk}>
      {children}
    </Modal>
  );
}

export default InfoModal;
