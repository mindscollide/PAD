import { getMessage, handleExpiredSession } from "./utils";

// 🔹 SearchComplianceOfficerReconcileTransactionRequest
export const GetUserWebNotificationRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_USER_WEB_NOTIFICATION_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_SETTINGS,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate API execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    // 🔹 Handle successful execution
    if (res.success) {
      const { responseMessage, notifications, totalCount, unReadCount } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data Available
      if (
        responseMessage ===
        "Settings_SettingsServiceManager_GetUserWebNotifications_01"
      ) {
        return {
          notifications: notifications || [],
          totalCount: totalCount || 0,
          unReadCount: unReadCount || 0,
        };
      }

      // Case 2 → No Data Available
      if (
        responseMessage ===
        "Settings_SettingsServiceManager_GetUserWebNotifications_02"
      ) {
        return {
          notifications: [],
          totalCount: 0,
          unReadCount: 0,
        };
      }

      // Case 3 → Other messages (warnings, exceptions)
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No data available.",
        });
      }

      return {
        notifications: [],
        totalCount: 0,
        unReadCount: 0,
      };
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Unexpected exception handler
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    return null;
  } finally {
    // 🔹 Always stop loader
    showLoader(false);
  }
};
