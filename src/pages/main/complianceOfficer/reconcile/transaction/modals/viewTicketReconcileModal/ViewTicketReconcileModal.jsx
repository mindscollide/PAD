import React, { useState } from "react";
import { Col, Row } from "antd";
import styles from "./ViewTicketReconcileModal.module.css";
import { GlobalModal } from "../../../../../../../components";
import CustomButton from "../../../../../../../components/buttons/button";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";

// Icons & Assets
import PDFVector from "../../../../../../../assets/img/PDFVector.png";
import Download from "../../../../../../../assets/img/Download.png";
import DownloadWhite from "../../../../../../../assets/img/DownloadWhite.png";
import PDFVectorWhite from "../../../../../../../assets/img/PDFVectorWhite.png";
import Excel from "../../../../../../../assets/img/xls.png";

const ViewTicketReconcileModal = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // ✅ Access Global Modal State
  const {
    isViewTicketTransactionModal,
    setIsViewTicketTransactionModal,
    setViewDetailReconcileTransaction,
    uploadattAchmentsFiles,
  } = useGlobalModal();

  /**
   * 📌 Handle file selection
   * Updates selectedIndex to preview in iframe
   */
  const handleSelectFile = (index) => {
    setSelectedIndex(index);
  };

  /**
   * 📌 Handle file download
   * Builds download URL based on DiskusFileName or ShareAbleLink
   */
  const handleDownloadFile = (file) => {
    // Example: adjust API endpoint for your backend
    const fileUrl = `${import.meta.env.VITE_FILE_DOWNLOAD_BASE_URL}/${
      file.shareAbleLink
    }`;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = file.displayFileName || "downloaded_file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Get the currently selected file (for preview)
  const selectedFile =
    selectedIndex !== null ? uploadattAchmentsFiles[selectedIndex] : null;

  return (
    <GlobalModal
      visible={isViewTicketTransactionModal}
      width="900px"
      centered
      modalHeader={<></>}
      onCancel={() => setIsViewTicketTransactionModal(false)}
      modalBody={
        <div className={styles.mainDivComment}>
          {/* 🔹 Header */}
          <Row>
            <Col span={24}>
              <label className={styles.ViewCommentHeading}>View Tickets</label>
            </Col>
          </Row>

          {/* 🔹 File Preview + Attachments List */}
          <Row gutter={[0, 0]}>
            {/* Left side: File preview */}
            <Col span={14}>
              <div className={styles.documentContainer}>
                {selectedFile ? (
                  <iframe
                    src={`${import.meta.env.VITE_FILE_PREVIEW_BASE_URL}/${
                      selectedFile.shareAbleLink
                    }`}
                    width="99%"
                    height="500px"
                    title="File Preview"
                  />
                ) : (
                  <div className={styles.noPreview}>
                    Select a file to preview
                  </div>
                )}
              </div>
            </Col>

            {/* Right side: Attachments list */}
            <Col span={10}>
              <div className={styles.attachemntContainer}>
                {uploadattAchmentsFiles?.map((file, index) => {
                  const isSelected = selectedIndex === index;
                  const isPdf = file.displayFileName
                    ?.toLowerCase()
                    .endsWith(".pdf");
                  const icon = isPdf ? PDFVector : Excel;
                  const iconWhite = isPdf ? PDFVectorWhite : Excel;

                  return (
                    <div
                      key={index}
                      className={`${styles.dropdownExport} ${
                        isSelected ? styles.selected : ""
                      }`}
                      onClick={() => handleSelectFile(index)}
                    >
                      <div className={styles.dropdownItem}>
                        <span className={styles.fileInfo}>
                          <img
                            src={isSelected ? iconWhite : icon}
                            alt="File type"
                            draggable={false}
                            width="26"
                            height="33"
                          />
                          <span>{file.displayFileName}</span>
                        </span>
                        <img
                          src={isSelected ? DownloadWhite : Download}
                          alt="Download"
                          draggable={false}
                          width="26"
                          height="26"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent selecting item
                            handleDownloadFile(file);
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Col>
          </Row>

          {/* 🔹 Footer Buttons */}
          <Row style={{ marginTop: "20px" }}>
            <Col span={24}>
              <div className={styles.CommentsButtonClass}>
                <CustomButton
                  text="Back"
                  className="big-light-button"
                  onClick={() => {
                    setIsViewTicketTransactionModal(false);
                    setViewDetailReconcileTransaction(true);
                  }}
                />
                <CustomButton
                  text="Close"
                  className="big-light-button"
                  onClick={() => {
                    setIsViewTicketTransactionModal(false);
                    setViewDetailReconcileTransaction(false);
                  }}
                />
              </div>
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default ViewTicketReconcileModal;
