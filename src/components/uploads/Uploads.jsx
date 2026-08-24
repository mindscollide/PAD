import React from "react";
import { Upload, List, message } from "antd";
import { CloseCircleOutlined, UploadOutlined } from "@ant-design/icons";

// Import your custom icons
import PDFIcon from "../../assets/img/pdf.png";

const getFileIcon = (fileName) => {
  if (fileName.endsWith(".pdf"))
    return <img src={PDFIcon} alt="pdf" style={{ width: 20, height: 20 }} />;
  // fallback (unreachable now that only PDFs pass beforeUpload below, kept
  // in case a future caller reuses this list rendering for other types)
  return <UploadOutlined style={{ fontSize: 20, color: "#1677ff" }} />;
};

const UploadComponent = ({ fileList, setFileList }) => {
  const props = {
    // PDF-only: `accept` alone doesn't block drag-and-drop, so the actual
    // enforcement happens here - non-PDF files are rejected outright
    // (never added to fileList), same rule as
    // UploadReconcileTicketModal/UploadHeadOfComplianceTicketModal.
    beforeUpload: (file) => {
      const isPdf =
        file.type === "application/pdf" ||
        file.name?.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        message.error(`"${file.name}" is not a PDF. Only PDF files can be uploaded.`);
        return Upload.LIST_IGNORE;
      }

      setFileList((prev) => [...prev, file]);
      return false; // prevent auto upload
    },
    accept: ".pdf",
    fileList: [],
  };

  const removeFile = (name) => {
    setFileList((prev) => prev.filter((f) => f.name !== name));
  };

  return (
    <div>
      {/* Drag & drop upload area */}
      <Upload.Dragger {...props} style={{ marginBottom: 20 }}>
        <p className="ant-upload-drag-icon">
          <UploadOutlined style={{ fontSize: 40, color: "#1677ff" }} />
        </p>
        <p className="ant-upload-text">Upload Deal Ticket</p>
        <p className="ant-upload-hint">Drag & drop files here to upload</p>
      </Upload.Dragger>

      {/* Uploaded files list */}
      <List
        dataSource={fileList}
        renderItem={(file) => (
          <List.Item
            actions={[
              <CloseCircleOutlined
                key="remove"
                onClick={() => removeFile(file.name)}
                style={{ color: "red", fontSize: 18, cursor: "pointer" }}
              />,
            ]}
          >
            {getFileIcon(file.name)}
            <span style={{ marginLeft: 10 }}>{file.name}</span>
          </List.Item>
        )}
      />
    </div>
  );
};

export default UploadComponent;
