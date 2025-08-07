// src/api/dashboardApi.js

import { logout } from "./loginApi";

// Response code messages
const responseMessages = {
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_01: "Data Available",
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_02: "No data available",
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_03: "Exception",
};

// Utility to extract message by code
const getMessage = (code) =>
  responseMessages[code] || "Something went wrong. Please try again.";

// API function
export const SearchTadeApprovals = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("handleOk", requestdata);

    const res = await callApi({
      requestMethod: import.meta.env.VITE_SEARCH_APPROVAL_DATA_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
    });
    console.log("Fetching approvals...", res);

    if (res.expired) {
      // Clear tokens and redirect
      logout(navigate, showLoader);
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
      const { responseMessage, myTradeApprovals } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchTradeApprovals_01"
      ) {
        return myTradeApprovals || [];
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
