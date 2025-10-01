import React, { useState } from "react";
import { Upload, Row, Col, Button } from "antd";
import { UploadOutlined, CloseCircleFilled } from "@ant-design/icons";
import UploadImg from "../../../../../assets/img/Upload.png";
import PDF from "../../../../../assets/img/pdf.png";
import Excel from "../../../../../assets/img/xls.png";
import Zip from "../../../../../assets/img/Zip.png";
import Word from "../../../../../assets/img/word.png";
import PNGImg from "../../../../../assets/img/PNGImg.png";
import CrossImg from "../../../../../assets/img/CrossImg.png";
import { GlobalModal } from "../../../../../components";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../components/buttons/button";
import styles from "./UploadModal.module.css";

const UploadModal = () => {
  const { uploadComplianceModal, setUploadComplianceModal } = useGlobalModal();
  const [fileList, setFileList] = useState([]);

  const props = {
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      return false;
    },
    fileList: [],
    multiple: true,
    showUploadList: false,
  };

  const removeFile = (name) => {
    setFileList((prev) => prev.filter((f) => f.name !== name));
  };

  // Get file icon based on extension
  const getFileIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return PDF;
      case "xlsx":
        return Excel;
      case "png":
        return PNGImg;
      case "zip":
        return Zip;
      case "word":
        return Word;

      default:
        return UploadOutlined;
    }
  };

  return (
    <GlobalModal
      visible={uploadComplianceModal}
      width={"935px"}
      height={"495px"}
      onCancel={() => setUploadComplianceModal(false)}
      modalBody={
        <div className={styles.mainContainer}>
          {/* Upload Section */}
          <Row>
            <Col>
              <h1 className={styles.uploadTicketHeading}>Upload Ticket</h1>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Upload.Dragger {...props}>
                <div>
                  <img
                    src={UploadImg}
                    alt="upload"
                    className={styles.uploadImg}
                  />
                </div>
                <span className={styles.uploadtext}>Upload Deal Ticket</span>
                <p className={styles.uploadSubText}>
                  Drag & drop files here to upload
                </p>
              </Upload.Dragger>
            </Col>
          </Row>

          {/* Files Grid */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            {fileList.map((file) => (
              <Col span={12} key={file.uid || file.name}>
                <div className={styles.fileListMainDiv}>
                  {/* Left: Icon + Name */}
                  <div className={styles.fileListSubDiv}>
                    {typeof getFileIcon(file.name) === "string" ? (
                      <img
                        src={getFileIcon(file.name)}
                        alt="file-icon"
                        className={styles.fileImagesclass}
                        // style={{ width: 20, marginRight: 8 }}
                      />
                    ) : (
                      React.createElement(getFileIcon(file.name), {
                        style: { marginRight: 8, fontSize: 18 },
                      })
                    )}
                    <span className={styles.fileNameText}>{file.name}</span>
                  </div>

                  {/* Right: Delete */}
                  <img
                    src={CrossImg}
                    className={styles.crossImageClass}
                    onClick={() => removeFile(file.name)}
                  />
                </div>
              </Col>
            ))}
          </Row>

          {/* Footer Buttons */}
          <Row justify="end" style={{ marginTop: 24, gap: "20px" }}>
            <Col>
              <CustomButton
                text={"Close"}
                className="big-light-button"
                onClick={() => setUploadComplianceModal(false)}
              />
            </Col>
            <Col>
              <CustomButton
                text={"Save"}
                className="big-dark-button"
                onClick={() => setUploadComplianceModal(false)}
              />
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default UploadModal;
