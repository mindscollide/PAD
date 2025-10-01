import { getMessage, handleExpiredSession } from "./utils";

// 🔹 UploadDocumentsRequest
export const UploadDocumentsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  fileList, // Array of files
  navigate,
}) => {
  const uploadedFiles = [];
  const failedFiles = [];

  try {
    for (const file of fileList) {
      try {
        console.log("fileList", file);
        // 🔹 API Call for each file
        const res = await callApi({
          requestMethod: import.meta.env.VITE_UPLOAD_DOCUMENT_REQUEST_METHOD,
          endpoint: import.meta.env.VITE_API_SETTINGS, // Your Settings endpoint
          requestData: file, // Send file directly
          navigate,
          isFileUpload: true, // Optional flag if your callApi needs it
        });

        // 🔹 Handle session expiry
        if (handleExpiredSession(res, navigate, showLoader)) {
          failedFiles.push(file.name);
          continue;
        }

        // 🔹 Validate API execution
        if (!res?.result?.isExecuted) {
          failedFiles.push(file.name);
          showNotification({
            type: "error",
            title: "Upload Failed",
            description: `File "${file.name}" could not be uploaded.`,
          });
          continue;
        }

        // 🔹 Handle success
        if (res.success) {
          const {
            responseMessage,
            displayFileName,
            fileSize,
            fileSizeOnDisk,
            padFileName,
            shareAbleLink,
          } = res.result;

          if (
            responseMessage ===
            "Settings_SettingsServiceManager_UploadDocuments_01"
          ) {
            uploadedFiles.push({
              displayFileName,
              fileSize,
              fileSizeOnDisk,
              padFileName,
              shareAbleLink,
            });
            continue;
          }
        }

        // 🔹 Fallback: Unexpected failure
        failedFiles.push(file.name);
        showNotification({
          type: "error",
          title: "Upload Failed",
          description: `File "${file.name}" could not be uploaded.`,
        });
      } catch (err) {
        failedFiles.push(file.name);
        showNotification({
          type: "error",
          title: "Upload Failed",
          description: `Unexpected error uploading "${file.name}".`,
        });
      }
    }

    return {
      uploadedFiles,
      failedFiles,
    };
  } catch (err) {
    console.error("UploadDocumentsRequest error:", err);
    return {
      uploadedFiles,
      failedFiles,
    };
  }
};

export const SaveDocumentsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestData, // 👈 you will build this before calling
  navigate,
}) => {
  try {
    console.log("📂 Request Data (Save Documents):", requestData);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env.VITE_SAVE_FILES_REQUEST_METHOD, // must exist in .env
      endpoint: import.meta.env.VITE_API_SETTINGS, // change if your endpoint is different
      requestData,
      navigate,
      isFileUpload: false, // 👈 if your callApi supports multipart/form-data
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Upload Failed",
        description: "Something went wrong while saving documents.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, savedFiles } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Successfully uploaded
      if (responseMessage === "Settings_SettingsServiceManager_SaveFiles_01") {
        return true;
      }

      // Case 2 → No files saved
      if (responseMessage === "Settings_SettingsServiceManager_SaveFiles_02") {
        return false;
      }

      // Case 3 → Custom messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No files were saved.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Upload Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    console.error("SaveDocumentsRequest error:", error);
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred while saving documents.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

export const GetWorkFlowFilesAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestData, // { WorkFlowID: 97 }
  navigate,
}) => {
  try {
    console.log("📂 Request Data (Get WorkFlowFiles):", requestData);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env.VITE_GET_WORKFLOW_FILES_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_SETTINGS,
      requestData,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Get Files Failed",
        description: "Something went wrong while fetching workflow files.",
      });
      return null;
    }

    // 🔹 Extract response
    const { responseMessage, files } = res.result;
    const message = getMessage(responseMessage);

    // Case 1 → Successfully fetched files
    if (
      responseMessage === "Settings_SettingsServiceManager_GetWorkFlowFiles_01"
    ) {
      return files || [];
    }

    // Case 2 → No files exist
    if (
      responseMessage === "Settings_SettingsServiceManager_GetWorkFlowFiles_02"
    ) {
      return [];
    }
    if (message) {
      // Case 3 → Unknown but valid
      showNotification({
        type: "warning",
        title: "No Files Found",
        description: "No workflow files available.",
      });
    }

    return [];
  } catch (error) {
    console.error("GetWorkFlowFilesAPI error:", error);
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching workflow files.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

export const GetAnnotationOfFilesAttachementAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestData, // { FileID: 2 }
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ANNOTATION_OF_FILES_ATTACHEMENT_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_SETTINGS,
      requestData,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Get Attachment Failed",
        description: "Something went wrong while fetching file attachment.",
      });
      return null;
    }

    // 🔹 Extract response
    const { responseMessage, attachmentBlob } = res.result;
    const message = getMessage(responseMessage);

    // Case 1 → Successfully fetched
    if (
      responseMessage ===
      "Settings_SettingsServiceManager_GetAnnotationOfFilesAttachement_01"
    ) {
      return attachmentBlob || null;
    }

    // Case 2 → No attachment exists
    if (
      responseMessage ===
      "Settings_SettingsServiceManager_GetAnnotationOfFilesAttachement_02"
    ) {
      return null;
    }

    // Case 3 → Unknown but valid
    if (message) {
      showNotification({
        type: "warning",
        title: "No Attachment Found",
        description: "No attachment available for this file.",
      });
    }

    return null;
  } catch (error) {
    console.error("GetAnnotationOfFilesAttachementAPI error:", error);
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching file attachment.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};
