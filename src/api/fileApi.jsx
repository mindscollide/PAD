import { handleExpiredSession } from "./utils";

// 🔹 UploadDocumentsRequest
export const UploadDocumentsRequest = async ({
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
        // 🔹 API Call for each file
        const res = await callApi({
          requestMethod: import.meta.env.VITE_UPLOAD_DOCUMENT_REQUEST_METHOD,
          endpoint: import.meta.env.VITE_API_SETTINGS, // Your Settings endpoint
          requestData: file, // Send file directly
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
            padFileName,
            shareAbleLink,
          } = res.result;

          if (
            responseMessage ===
            "Settings_SettingsServiceManager_UploadDocuments_01"
          ) {
            uploadedFiles.push({
              fileName: displayFileName,
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
  } finally {
    // 🔹 Always stop loader at the end
    showLoader(false);
  }
};
