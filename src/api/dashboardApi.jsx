// src/api/dashboardApi.js

// Response code messages
const responseMessages = {
  PAD_Trade_TradeServiceManager_GetUserDashBoardStats_01: "Data Available",
  PAD_Trade_TradeServiceManager_GetUserDashBoardStats_02: "No data available",
  PAD_Trade_TradeServiceManager_GetUserDashBoardStats_03: "Exception",
};

// Utility to extract message by code
const getMessage = (code) =>
  responseMessages[code] || "Something went wrong. Please try again.";

// API function
export const GetUserDashBoardStats = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    showLoader(true);
    const res = await callApi({
      requestMethod: import.meta.env.VITE_DASHBOARD_DATA_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: {},
    });

    if (res.expired) {
      // Clear tokens and redirect
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("token_timeout");
      navigate("/login");
      showLoader(false);
      return null;
    }

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, userDashBoardStats } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetUserDashBoardStats_01"
      ) {
        return userDashBoardStats;
      }

      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
        description: "No data was returned from the server.",
      });
      return null;
    }

    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};
