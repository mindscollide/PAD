import React, { useState, useCallback, useMemo } from "react";
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
import { useReconcileContext } from "../../../../../../../context/reconsileContax";
import { UploadDocumentsRequest } from "../../../../../../../api/fileApi";
import { useApi } from "../../../../../../../context/ApiContext";
import useNotification from "antd/es/notification/useNotification";
import { useGlobalLoader } from "../../../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";

const fileIcons = {
  pdf: PDF,
  xlsx: Excel,
  xls: Excel,
  png: PNGImg,
  jpg: PNGImg,
  jpeg: PNGImg,
  zip: Zip,
  rar: Zip,
  doc: Word,
  docx: Word,
};

const UploadReconcileTicketModal = () => {
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const navigate = useNavigate();

  const {
    setUploadComplianceModal,
    setViewDetailReconcileTransaction,
    uploadComplianceModal,
  } = useGlobalModal();
  const [fileList, setFileList] = useState([]);

  const {
    reconcileTransactionViewDetailData,
    selectedReconcileTransactionData,
  } = useReconcileContext();

  const handleBeforeUpload = useCallback((file) => {
    setFileList((prev) => [...prev, file]);
    return false; // stop auto-upload
  }, []);
  console.log(" v", fileList);
  const removeFile = useCallback((name) => {
    setFileList((prev) => prev.filter((f) => f.name !== name));
  }, []);

  // ✅ handle save button
  const handleSave = async () => {
    if (fileList.length === 0) {
      showNotification({
        type: "warning",
        title: "No Files",
        description: "Please select at least one file before saving.",
      });
      return;
    }

    showLoader(true);

    try {
      const { uploadedFiles, failedFiles } = await UploadDocumentsRequest({
        callApi,
        showNotification,
        showLoader,
        fileList,
        navigate,
      });

      if (uploadedFiles.length > 0) {
        showNotification({
          type: "success",
          title: "Upload Successful",
          description: `${uploadedFiles.length} file(s) uploaded successfully.`,
        });
      }

      if (failedFiles.length > 0) {
        showNotification({
          type: "error",
          title: "Upload Failed",
          description: `${failedFiles.length} file(s) failed to upload.`,
        });
      }

      // ✅ Close modal if at least one file succeeded
      if (uploadedFiles.length > 0) {
        setUploadComplianceModal(false);
        setViewDetailReconcileTransaction(true);
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification({
        type: "error",
        title: "Upload Error",
        description: "Something went wrong while uploading files.",
      });
    } finally {
      showLoader(false);
    }
  };

  const getFileIcon = useCallback((name) => {
    const ext = name.split(".").pop().toLowerCase();
    return fileIcons[ext] || UploadImg;
  }, []);

  const uploadProps = useMemo(
    () => ({
      beforeUpload: handleBeforeUpload,
      fileList: [],
      multiple: true,
      showUploadList: false,
    }),
    [handleBeforeUpload]
  );

  const renderFiles = () => {
    if (fileList.length === 0) {
      return (
        <Col span={24} className={styles.noDealTicketClass}>
          <img src={NoDealTicket} alt="No Deal Ticket Available" />
        </Col>
      );
    }

    return fileList.map((file) => (
      <Col span={12} key={file.uid || file.name}>
        <div className={styles.fileListMainDiv}>
          {/* Left: Icon + Name */}
          <div className={styles.fileListSubDiv}>
            <img
              src={getFileIcon(file.name)}
              alt={`${file.name} icon`}
              className={styles.fileImagesclass}
            />
            <span
              className={styles.fileNameText}
              title={file.name} // tooltip for long names
            >
              {file.name}
            </span>
          </div>

          {/* Right: Delete */}
          <img
            src={CrossImg}
            alt="remove file"
            className={styles.crossImageClass}
            onClick={() => removeFile(file.name)}
          />
        </div>
      </Col>
    ));
  };

  return (
    <GlobalModal
      visible={uploadComplianceModal}
      width="935px"
      height="495px"
      onCancel={() => {
        setUploadComplianceModal(false);
        setViewDetailReconcileTransaction(true);
      }}
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
                  <img
                    src={UploadImg}
                    alt="upload placeholder"
                    className={styles.uploadImg}
                  />
                  <span className={styles.uploadtext}>Upload Deal Ticket</span>
                  <p className={styles.uploadSubText}>
                    Drag & drop files here to upload
                  </p>
                </Upload.Dragger>
              </Col>
            </Row>

            {/* Files Display */}
            <Row gutter={[16, 16]} className={styles.fileListSpacingDiv}>
              {renderFiles()}
            </Row>
          </div>

          {/* Footer Buttons */}
          <Row gutter={[16, 16]} className={styles.btnClassupload}>
            <Col>
              <CustomButton
                text="Close"
                className="big-light-button"
                onClick={() => {
                  setUploadComplianceModal(false);
                  setViewDetailReconcileTransaction(true);
                }}
              />
            </Col>
            <Col>
              <CustomButton
                text="Save"
                className="big-dark-button"
                onClick={() => handleSave()}
              />
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default UploadReconcileTicketModal;
