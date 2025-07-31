// src/api/dashboardApi.js
import Cookies from "js-cookie";

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
}) => {
  try {
    showLoader(true);

    const res = await callApi({
      requestMethod: import.meta.env.VITE_DASHBOARD_DATA_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: {},
    });

    if (!res?.result?.isExecuted) {
      showLoader(false);

      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    if (res.success && res.responseCode === 200) {
      const { responseMessage, userDashBoardStats } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetUserDashBoardStats_01"
      ) {
        showLoader(false);
        return userDashBoardStats;
      } else {
        showNotification({
          type: "warning",
          title: getMessage(responseMessage),
          description: "No data was returned from the server.",
        });
        showLoader(false);
        return null;
      }
    }

    if (res.expired) {
      showNotification({
        type: "error",
        title: "Session expired",
        description: "Please login again.",
      });
      showLoader(false);
    } else {
      showNotification({
        type: "error",
        title: "Fetch Failed",
        description: getMessage(res.message),
      });
      showLoader(false);
    }

    return null;
  } catch (error) {
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    showLoader(false);
    return null;
  }
};
