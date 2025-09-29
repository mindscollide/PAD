import React, { useState, useCallback, useMemo } from "react";
import { Upload, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

// Assets
import UploadImg from "../../../../../../../assets/img/Upload.png";
import PDF from "../../../../../../../assets/img/pdf.png";
import Excel from "../../../../../../../assets/img/xls.png";
import Zip from "../../../../../../../assets/img/Zip.png";
import Word from "../../../../../../../assets/img/word.png";
import PNGImg from "../../../../../../../assets/img/PNGImg.png";
import CrossImg from "../../../../../../../assets/img/CrossImg.png";
import NoDealTicket from "../../../../../../../assets/img/NoDealTicket.png";

// Components
import { GlobalModal } from "../../../../../../../components";
import CustomButton from "../../../../../../../components/buttons/button";
import { useNotification } from "../../../../../../../components/NotificationProvider/NotificationProvider";

// Contexts
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";
import { useApi } from "../../../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../../../context/LoaderContext";

// API
import {
  SaveDocumentsAPI,
  UploadDocumentsAPI,
} from "../../../../../../../api/fileApi";

// Styles
import styles from "./UploadReconcileTicketModal.module.css";

// =============================================================================
// 🎯 CONSTANTS & CONFIGURATION
// =============================================================================

/**
 * File type to icon mapping
 * @constant {Object}
 */
const FILE_ICONS = {
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

// =============================================================================
// 🎯 MAIN COMPONENT
// =============================================================================

/**
 * 📤 UploadReconcileTicketModal Component
 *
 * A modal component for uploading and managing deal tickets during reconciliation process.
 * Supports multiple file types with visual preview and two-step upload process.
 *
 * Features:
 * - Drag & drop file upload
 * - Visual file preview with type-specific icons
 * - Two-step process: Upload → Save metadata
 * - File validation and error handling
 * - Integration with reconciliation workflow
 *
 * @component
 * @example
 * <UploadReconcileTicketModal />
 *
 * @returns {React.ReactElement} Modal component for ticket upload
 */
const UploadReconcileTicketModal = () => {
  // ===========================================================================
  // 🎯 HOOKS & CONTEXTS
  // ===========================================================================

  // API & Navigation
  const { callApi } = useApi();
  const navigate = useNavigate();

  // UI Contexts
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    setUploadComplianceModal,
    setViewDetailReconcileTransaction,
    uploadComplianceModal,
  } = useGlobalModal();

  // Business Contexts
  const {
    reconcileTransactionViewDetailData,
    setReconcileTransactionViewDetailData,
    selectedReconcileTransactionData,
  } = useReconcileContext();

  // ===========================================================================
  // 🎯 STATE MANAGEMENT
  // ===========================================================================

  const [fileList, setFileList] = useState([]);

  // ===========================================================================
  // 🎯 USER DATA
  // ===========================================================================

  /**
   * Get current user data from session storage
   * @type {Object}
   */
  const userProfileData = useMemo(
    () => JSON.parse(sessionStorage.getItem("user_profile_data") || "{}"),
    []
  );

  const currentUserId = userProfileData?.userID;

  // ===========================================================================
  // 🎯 FILE MANAGEMENT FUNCTIONS
  // ===========================================================================

  /**
   * 📁 Handles file selection before upload
   * Adds files to the file list without automatic upload
   *
   * @param {File} file - The file to be added to upload queue
   * @returns {boolean} false to prevent automatic upload
   */
  const handleBeforeUpload = useCallback((file) => {
    setFileList((prev) => [...prev, file]);
    return false; // Prevent Ant Design's auto-upload
  }, []);

  /**
   * 🗑️ Removes a file from the upload list
   *
   * @param {string} fileName - Name of the file to remove
   */
  const removeFile = useCallback((fileName) => {
    setFileList((prev) => prev.filter((file) => file.name !== fileName));
  }, []);

  /**
   * 📝 Transforms uploaded file data to API-compatible format
   *
   * @param {Array} uploadedFiles - Array of uploaded file objects from API
   * @returns {Array} Formatted file objects for SaveDocumentsAPI
   */
  const transformUploadedFiles = useCallback(
    (uploadedFiles) => {
      return uploadedFiles.map((file) => ({
        PK_FileID: 0,
        DisplayFileName: file.displayFileName,
        DiskusFileName: Number(file.padFileName),
        DiskusFileNameString: file.padFileName,
        ShareAbleLink: file.shareAbleLink,
        FileSize: file.fileSize,
        FileSizeOnDisk: file.fileSizeOnDisk,
        FK_UserID: currentUserId || 0,
        UriPath: "",
        FK_GAID: 0,
        CreatedDate: "",
        ModifiedDate: "",
        ModifiedByUser: "",
        OpenedDateTime: "",
        OpenedByUser: "",
        Location: "",
        Type: "",
        Description: "",
        CreatedByUser: "",
      }));
    },
    [currentUserId]
  );

  /**
   * 🔍 Gets appropriate icon for file type
   *
   * @param {string} fileName - Name of the file
   * @returns {string} Path to the appropriate icon image
   */
  const getFileIcon = useCallback((fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return FILE_ICONS[extension] || UploadImg;
  }, []);

  // ===========================================================================
  // 🎯 UPLOAD & SAVE OPERATIONS
  // ===========================================================================

  /**
   * 💾 Main save handler - orchestrates the two-step upload process
   * 1. Upload files to storage
   * 2. Save file metadata to database
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleSave = async () => {
    // Validation
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
      // Step 1: Upload files to storage
      const { uploadedFiles, failedFiles } = await UploadDocumentsAPI({
        callApi,
        showNotification,
        showLoader,
        fileList,
        navigate,
      });

      // Handle partial upload failures
      if (failedFiles.length > 0) {
        showNotification({
          type: "error",
          title: "Upload Error",
          description: `${failedFiles.length} file(s) failed to upload.`,
        });
      }

      // Step 2: Only proceed if at least one file uploaded successfully
      if (uploadedFiles.length > 0) {
        const formattedFiles = transformUploadedFiles(uploadedFiles);

        const finalRequest = {
          Type: 0,
          WorkFlowID: selectedReconcileTransactionData.approvalID,
          Files: formattedFiles,
        };

        console.log("📂 Final Save Request:", finalRequest);

        // Save file metadata to database
        const saveResponse = await SaveDocumentsAPI({
          callApi,
          showNotification,
          showLoader,
          requestData: finalRequest,
          navigate,
        });

        showLoader(false);

        // Update UI state on success
        if (saveResponse) {
          if (!reconcileTransactionViewDetailData.ticketUploaded) {
            setReconcileTransactionViewDetailData((prev) => ({
              ...prev,
              ticketUploaded: true,
            }));
          }

          // Close modal and show detail view
          setUploadComplianceModal(false);
          setViewDetailReconcileTransaction(true);
        }
      } else {
        // No files uploaded successfully
        showLoader(false);
      }
    } catch (error) {
      console.error("Upload process error:", error);
      showNotification({
        type: "error",
        title: "Upload Failed",
        description: "Something went wrong while uploading files.",
      });
      showLoader(false);
    }
  };

  // ===========================================================================
  // 🎯 MEMOIZED CONFIGURATIONS
  // ===========================================================================

  /**
   * Upload component configuration
   * @type {Object}
   */
  const uploadProps = useMemo(
    () => ({
      beforeUpload: handleBeforeUpload,
      fileList: [], // Managed separately in state
      multiple: true,
      showUploadList: false, // Use custom file list
    }),
    [handleBeforeUpload]
  );

  // ===========================================================================
  // 🎯 RENDER FUNCTIONS
  // ===========================================================================

  /**
   * Renders the file list or empty state
   *
   * @returns {React.ReactElement} File list components
   */
  const renderFiles = () => {
    // Empty state
    if (fileList.length === 0) {
      return (
        <Col span={24} className={styles.noDealTicketClass}>
          <img src={NoDealTicket} alt="No files selected for upload" />
        </Col>
      );
    }

    // File list
    return fileList.map((file) => (
      <Col span={12} key={file.uid || file.name}>
        <div className={styles.fileListMainDiv}>
          {/* File Info */}
          <div className={styles.fileListSubDiv}>
            <img
              src={getFileIcon(file.name)}
              alt={`${file.name} file type`}
              className={styles.fileImagesclass}
            />
            <span
              className={styles.fileNameText}
              title={file.name} // Tooltip for overflow
            >
              {file.name}
            </span>
          </div>

          {/* Remove Button */}
          <img
            src={CrossImg}
            alt={`Remove ${file.name}`}
            className={styles.crossImageClass}
            onClick={() => removeFile(file.name)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter") removeFile(file.name);
            }}
          />
        </div>
      </Col>
    ));
  };

  // ===========================================================================
  // 🎯 MODAL CONFIGURATION
  // ===========================================================================

  /**
   * Handles modal close with proper state cleanup
   */
  const handleModalClose = () => {
    setUploadComplianceModal(false);
    setViewDetailReconcileTransaction(true);
  };

  // ===========================================================================
  // 🎯 COMPONENT RENDER
  // ===========================================================================

  return (
    <GlobalModal
      visible={uploadComplianceModal}
      width="935px"
      height="495px"
      onCancel={handleModalClose}
      modalBody={
        <div className={styles.mainContainer}>
          {/* Header */}
          <Row>
            <Col>
              <h1 className={styles.uploadTicketHeading}>Upload Deal Ticket</h1>
            </Col>
          </Row>

          {/* Upload Area */}
          <div className={styles.fileScrollerDiv}>
            <Row>
              <Col span={24}>
                <Upload.Dragger {...uploadProps} data-testid="upload-dragger">
                  <img
                    src={UploadImg}
                    alt="Drag and drop files here"
                    className={styles.uploadImg}
                  />
                  <span className={styles.uploadtext}>Upload Deal Ticket</span>
                  <p className={styles.uploadSubText}>
                    Drag & drop files here to upload
                  </p>
                </Upload.Dragger>
              </Col>
            </Row>

            {/* File List */}
            <Row
              gutter={[16, 16]}
              className={styles.fileListSpacingDiv}
              data-testid="file-list"
            >
              {renderFiles()}
            </Row>
          </div>

          {/* Action Buttons */}
          <Row gutter={[16, 16]} className={styles.btnClassupload}>
            <Col>
              <CustomButton
                text="Close"
                className="big-light-button"
                onClick={handleModalClose}
                data-testid="close-button"
              />
            </Col>
            <Col>
              <CustomButton
                text="Save"
                className="big-dark-button"
                onClick={handleSave}
                disabled={fileList.length === 0}
                data-testid="save-button"
              />
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default UploadReconcileTicketModal;
