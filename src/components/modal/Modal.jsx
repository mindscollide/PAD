import React from "react";
import { Modal } from "antd";

const GlobalModal = ({
  visible,
  onCancel,
  modalHeader,
  modalBody,
  modalFooter,
  width,
  height,
  centered,
  closable,
  className = "",
  style = {},
  bodyClassName = "",
  headerClassName = "",
  maskClosable = false,
}) => {
  return (
    <Modal
      open={visible} // ✅ Correct prop for AntD v5+
      onCancel={onCancel}
      footer={modalFooter || null}
      centered={centered}
      closable={closable}
      width={width}
      height={height}
      className={className}
      style={style}
      maskClosable={maskClosable}
    >
      {/* Header */}
      {modalHeader && (
        <div className={headerClassName} style={{ marginBottom: 16 }}>
          {modalHeader}
        </div>
      )}

      {/* Body */}
      <div className={bodyClassName}>{modalBody}</div>
    </Modal>
  );
};

export default GlobalModal;
