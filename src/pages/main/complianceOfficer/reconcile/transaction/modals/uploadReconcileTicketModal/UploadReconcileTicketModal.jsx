import React, { useState } from "react";
import { Upload, Row, Col } from "antd";
import UploadImg from "../../../../../../../assets/img/Upload.png";
import PDF from "../../../../../../../assets/img/pdf.png";
import Excel from "../../../../../../../assets/img/xls.png";
import Zip from "../../../../../../../assets/img/Zip.png";
import Word from "../../../../../../../assets/img/word.png";
import PNGImg from "../../../../../../../assets/img/PNGImg.png";
import CrossImg from "../../../../../../../assets/img/CrossImg.png";
import NoDealTicket from "../../../../../../../assets/img/NoDealTicket.png";
import { GlobalModal } from "../../../../../../../components";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../../../components/buttons/button";
import styles from "./UploadReconcileTicketModal.module.css";

const UploadReconcileTicketModal = () => {
  const { uploadComplianceModal, setUploadComplianceModal } = useGlobalModal();
  const [fileList, setFileList] = useState([]);

  const handleBeforeUpload = (file) => {
    setFileList((prev) => [...prev, file]);
    return false; // Prevent automatic upload
  };

  const removeFile = (name) => {
    setFileList((prev) => prev.filter((f) => f.name !== name));
  };

  // ✅ Always return image paths
  const getFileIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return PDF;
      case "xlsx":
      case "xls":
        return Excel;
      case "png":
      case "jpg":
      case "jpeg":
        return PNGImg;
      case "zip":
      case "rar":
        return Zip;
      case "doc":
      case "docx":
        return Word;
      default:
        return UploadImg; // fallback image for unknown types
    }
  };

  const uploadProps = {
    beforeUpload: handleBeforeUpload,
    fileList: [],
    multiple: true,
    showUploadList: false,
  };

  return (
    <GlobalModal
      visible={uploadComplianceModal}
      width={"935px"}
      height={"495px"}
      onCancel={() => setUploadComplianceModal(false)}
      modalBody={
        <div className={styles.mainContainer}>
          {/* Title */}
          <Row>
            <Col>
              <h1 className={styles.uploadTicketHeading}>Upload Ticket</h1>
            </Col>
          </Row>

          {/* Upload Dragger */}
          <div className={styles.fileScrollerDiv}>
            <Row>
              <Col span={24}>
                <Upload.Dragger {...uploadProps}>
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

            {/* Files Display */}
            <Row gutter={[16, 16]} className={styles.fileListSpacingDiv}>
              {fileList.length === 0 ? (
                <Col span={24} className={styles.noDealTicketClass}>
                  <img
                    src={NoDealTicket}
                    alt="No Deal Ticket"
                  />
                </Col>
              ) : (
                fileList.map((file) => (
                  <Col span={12} key={file.uid || file.name}>
                    <div className={styles.fileListMainDiv}>
                      {/* Left: Icon + Name */}
                      <div className={styles.fileListSubDiv}>
                        <img
                          src={getFileIcon(file.name)}
                          alt="file-icon"
                          className={styles.fileImagesclass}
                        />
                        <span className={styles.fileNameText}>{file.name}</span>
                      </div>

                      {/* Right: Delete */}
                      <img
                        src={CrossImg}
                        alt="remove"
                        className={styles.crossImageClass}
                        onClick={() => removeFile(file.name)}
                      />
                    </div>
                  </Col>
                ))
              )}
            </Row>
          </div>

          {/* Footer Buttons */}
          <Row gutter={[16, 16]} className={styles.btnClassupload}>
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

export default UploadReconcileTicketModal;
