// src/api/dashboardApi.js

import { logout } from "./loginApi";

// Response code messages
const responseMessages = {
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_01: "Data Available",
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_02: "No data available",
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_03: "Exception",

  // Responses For Add Trade Approval Api
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_01:
    "Trade Approval Request Submitted",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_02:
    "Failed to save Trade Approval Request",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_03: "Exception",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_04:
    "No  User hierarchy Found",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_05: "Work Flow Update",
};
/**
 * 🔹 Handles logout if session is expired
 */
const handleExpiredSession = (res, navigate, showLoader) => {
  if (res?.expired) {
    console.log("heloo log", res);
    logout({ navigate, showLoader });
    return true;
  }
  return false;
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
    const res = await callApi({
      requestMethod: import.meta.env.VITE_SEARCH_APPROVAL_DATA_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;
    console.log("heloo log", res);

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

export const AddTradeApprovalRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setIsEquitiesModalVisible,
  setIsSubmit,
  navigate,
}) => {
  console.log("Check APi");

  try {
    // 🔹 API Call
    console.log("Check APi");

    const res = await callApi({
      requestMethod: import.meta.env.VITE_ADD_TRADE_APPROVAL_REQUEST_METHOD, // <-- Add Trade Approval method
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
    });

    //  Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;

    console.log("Add Trade Approval API Response", res);

    // when Api send isExecuted false
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return false;
    }

    // When Api Send Success Response
    if (res.success) {
      const { responseMessage } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_01"
      ) {
        // Success case
        setIsEquitiesModalVisible(false);
        setIsSubmit(true);
        showNotification({
          type: "success",
          title: "Success",
          description: getMessage(responseMessage),
        });
        return true; // indicate success
      }

      // When Any Other Response Message Occur
      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
      });
      return false;
    }

    // When Response will be Something Went Wrong
    showNotification({
      type: "error",
      title: "Request Failed",
      description: getMessage(res.message),
    });
    return false;
  } catch (error) {
    // ❌ Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    return false;
  } finally {
    showLoader(false);
  }
};
