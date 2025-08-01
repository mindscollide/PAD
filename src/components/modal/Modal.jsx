import React, { memo } from "react";
import { Modal } from "antd";

const GlobalModal = ({
  visible,
  onCancel,
  centered,
  closable,
  width,
  className,
  style,
  modalHeader,
  modalBody,
  modalFooter,
  bodyClassName,
  headerClassName,
  maskClosable,
  destroyOnClose,
}) => {
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={modalFooter || null}
      centered={centered}
      closable={closable}
      width={width}
      className={className}
      style={style}
      maskClosable={maskClosable}
      destroyOnClose={destroyOnClose}
    >
      {modalHeader && <div className={headerClassName}>{modalHeader}</div>}
      <div className={bodyClassName}>{modalBody}</div>
    </Modal>
  );
};

export default GlobalModal;
