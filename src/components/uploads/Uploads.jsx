import React from "react";
import { Upload, List } from "antd";
import { CloseCircleOutlined, UploadOutlined } from "@ant-design/icons";

// Import your custom icons
import PDFIcon from "../../assets/img/pdf.png";
import ExcelIcon from "../../assets/img/xls.png";

const getFileIcon = (fileName) => {
  if (fileName.endsWith(".pdf"))
    return <img src={PDFIcon} alt="pdf" style={{ width: 20, height: 20 }} />;
  if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx"))
    return (
      <img src={ExcelIcon} alt="excel" style={{ width: 20, height: 20 }} />
    );
  // fallback
  return <UploadOutlined style={{ fontSize: 20, color: "#1677ff" }} />;
};

const UploadComponent = ({ fileList, setFileList }) => {
  const props = {
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      return false; // prevent auto upload
    },
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
