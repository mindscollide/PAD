/**
 * 📄 ViewTicketReconcileModal.jsx
 *
 * A modal component to preview and download ticket attachments (PDF/Excel).
 * Integrates with global contexts for modal handling, API calls, notifications, and loaders.
 *
 * Features:
 *  - Fetches attachment blob (Base64) via API if not already available
 *  - Converts Base64 → Blob URL for inline preview
 *  - Displays file list with type-specific icons
 *  - Supports file download via shareable link
 *  - Provides navigation between ticket view and reconcile detail
 */

import React, { useState, useMemo, useEffect } from "react";
import { Col, Row, Tooltip } from "antd";
import styles from "./ViewTicketReconcileModal.module.css";

// 🔹 Components & Contexts
import { GlobalModal } from "../../../../../../../components";
import CustomButton from "../../../../../../../components/buttons/button";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { useApi } from "../../../../../../../context/ApiContext";
import { useNotification } from "../../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";

// 🔹 Assets (icons)
import PDFVector from "../../../../../../../assets/img/PDFVector.png";
import Download from "../../../../../../../assets/img/Download.png";
import DownloadWhite from "../../../../../../../assets/img/DownloadWhite.png";
import PDFVectorWhite from "../../../../../../../assets/img/PDFVectorWhite.png";
import Excel from "../../../../../../../assets/img/xls.png";

// 🔹 API
import { GetAnnotationOfFilesAttachementAPI } from "../../../../../../../api/fileApi";

const ViewTicketReconcileModal = () => {
  // 📌 Context hooks
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const navigate = useNavigate();
  // 📌 Global modal state (from context)
  const {
    isViewTicketTransactionModal,
    setIsViewTicketTransactionModal,
    setViewDetailReconcileTransaction,
    uploadattAchmentsFiles,
    setUploadattAchmentsFiles,
  } = useGlobalModal();
  // 📌 Local state
  const [selectedIndex, setSelectedIndex] = useState(null); // currently selected file index
  const [loadingIndex, setLoadingIndex] = useState(null); // index of file being loaded
  
  // ✅ Auto-select 0th index when files are available
  useEffect(() => {
    if (uploadattAchmentsFiles?.length > 0 && selectedIndex === null) {
      setSelectedIndex(0);
    }
  }, [uploadattAchmentsFiles, selectedIndex]);

  /**
   * 🔹 Memoized selected file
   * Avoids recalculating the selected file on each render unless dependencies change
   */
  const selectedFile = useMemo(() => {
    return selectedIndex !== null
      ? uploadattAchmentsFiles[selectedIndex]
      : null;
  }, [selectedIndex, uploadattAchmentsFiles]);

  /**
   * 🔹 Selects a file and fetches its blob if not already present
   * @param {number} index - Index of the file in the attachments list
   */
  const handleSelectFile = async (index) => {
    const file = uploadattAchmentsFiles[index];

    // If file blob not already fetched, request it from API
    if (!file.attachmentBlob) {
      setLoadingIndex(index);
      try {
        const blob = await GetAnnotationOfFilesAttachementAPI({
          callApi,
          showNotification,
          showLoader,
          requestData: { FileID: file.pK_FileID },
          navigate,
        });

        if (blob) {
          // Update attachment list with blob
          const updatedFiles = [...uploadattAchmentsFiles];
          updatedFiles[index] = { ...file, attachmentBlob: blob };
          setUploadattAchmentsFiles(updatedFiles);
        }
      } catch (err) {
        console.error("❌ Failed to fetch attachment blob", err);
        showNotification({
          type: "error",
          title: "Attachment Error",
          description: "Unable to load file preview.",
        });
      } finally {
        setLoadingIndex(null);
      }
    }

    setSelectedIndex(index);
  };

  /**
   * 🔹 Downloads the selected file via its shareable link
   * @param {Object} file - File object containing shareAbleLink and displayFileName
   */
  const handleDownloadFile = (file) => {
    const fileUrl = `${import.meta.env.VITE_FILE_DOWNLOAD_BASE_URL}/${
      file.shareAbleLink
    }`;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = file.displayFileName || "downloaded_file";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  /**
   * 🔹 Returns appropriate icons for file type & selection state
   * @param {Object} file - File object
   * @param {boolean} isSelected - Whether the file is currently selected
   * @returns {Object} { typeIcon, downloadIcon }
   */
  const getFileIcons = (file, isSelected) => {
    const isPdf = file.displayFileName?.toLowerCase().endsWith(".pdf");
    return {
      typeIcon: isSelected
        ? isPdf
          ? PDFVectorWhite
          : Excel
        : isPdf
        ? PDFVector
        : Excel,
      downloadIcon: isSelected ? DownloadWhite : Download,
    };
  };

  /**
   * 🔹 Converts a Base64 string into a Blob URL for preview
   * @param {string} base64 - Base64 encoded string
   * @param {string} [mimeType="application/pdf"] - File MIME type (defaults to PDF)
   * @returns {string|null} Object URL for Blob
   */
  const base64ToBlobUrl = (base64, mimeType = "application/pdf") => {
    try {
      const byteChars = atob(base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("❌ Failed to convert base64 to Blob URL", err);
      return null;
    }
  };

  return (
    <GlobalModal
      visible={isViewTicketTransactionModal}
      width="900px"
      centered
      modalHeader={null}
      onCancel={() => setIsViewTicketTransactionModal(false)}
      modalBody={
        <div className={styles.mainDivComment}>
          {/* Header */}
          <Row>
            <Col span={24}>
              <label className={styles.ViewCommentHeading}>View Tickets</label>
            </Col>
          </Row>

          <Row gutter={[0, 0]}>
            {/* 🔹 Left: File Preview */}
            <Col span={14}>
              <div className={styles.documentContainer}>
                {selectedFile ? (
                  <iframe
                    src={
                      selectedFile.attachmentBlob
                        ? `${base64ToBlobUrl(
                            selectedFile.attachmentBlob
                          )}#toolbar=0&navpanes=0&scrollbar=0`
                        : ""
                    }
                    width="99%"
                    height="500px"
                    title={`Preview of ${selectedFile.displayFileName}`}
                  />
                ) : (
                  <div className={styles.noPreview}>
                    Select a file to preview
                  </div>
                )}
              </div>
            </Col>

            {/* 🔹 Right: File Attachments List */}
            <Col span={10}>
              <div className={styles.attachemntContainer}>
                {uploadattAchmentsFiles?.length ? (
                  uploadattAchmentsFiles.map((file, index) => {
                    const isSelected = selectedIndex === index;
                    const { typeIcon, downloadIcon } = getFileIcons(
                      file,
                      isSelected
                    );

                    return (
                      <div
                        key={file.pK_FileID || index}
                        className={`${styles.dropdownExport} ${
                          isSelected ? styles.selected : ""
                        }`}
                        onClick={() => handleSelectFile(index)}
                      >
                        <div className={styles.dropdownItem}>
                          {/* File Info */}
                          <span className={styles.fileInfo}>
                            <img
                              src={typeIcon}
                              alt={file.displayFileName}
                              draggable={false}
                              width="26"
                              height="33"
                            />
                            <span>
                              {loadingIndex === index ? (
                                "Loading..."
                              ) : (
                                <Tooltip title={file.displayFileName}>
                                  {file.displayFileName.length > 15
                                    ? file.displayFileName.slice(0, 15) + "..."
                                    : file.displayFileName}
                                </Tooltip>
                              )}
                            </span>
                          </span>

                          {/* Download Button */}
                          <img
                            src={downloadIcon}
                            alt="Download file"
                            draggable={false}
                            width="26"
                            height="26"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent triggering select
                              handleDownloadFile(file);
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noPreview}>
                    No attachments available
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Footer Buttons */}
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
