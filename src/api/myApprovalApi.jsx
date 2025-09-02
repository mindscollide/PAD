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
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_06:
    "Resubmission Successfull",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_07:
    "Resubmission Failed",

  // Responses For GetAllViewDetailsByTradeApprovalID Api
  PAD_Trade_TradeServiceManager_GetAllViewDetailsByTradeApprovalID_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_GetAllViewDetailsByTradeApprovalID_02:
    "No data available",
  PAD_Trade_TradeServiceManager_GetAllViewDetailsByTradeApprovalID_03:
    "Exception",
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
      // showNotification({
      //   type: "error",
      //   title: "Error",
      //   description: "Something went wrong. Please try again.",
      // });
      return null;
    }

    if (res.success) {
      const { responseMessage, myTradeApprovals, totalRecords } = res?.result;
      console.log("heloo log", res);

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchTradeApprovals_01"
      ) {
        return {
          approvals: myTradeApprovals || [],
          totalRecords: totalRecords ?? 0,
        };
      }
      // showNotification({
      //   type: "warning",
      //   title: getMessage(responseMessage),
      //   description: "No data was returned from the server.",
      // });
      return null;
    }
    // showNotification({
    //   type: "error",
    //   title: "Fetch Failed",
    //   description: getMessage(res.message),
    // });
    return null;
  } catch (error) {
    // showNotification({
    //   type: "error",
    //   title: "Error",
    //   description: "An unexpected error occurred.",
    // });
    return null;
  } finally {
    showLoader(false);
  }
};

//AddTradeApprovalRequest and This Api is also use for Resubmit Scenario in which we have predefine reasons
export const AddTradeApprovalRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setIsEquitiesModalVisible,
  setIsSubmit,
  setIsResubmitted,
  setResubmitIntimation,
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
        setIsEquitiesModalVisible(false);
        setIsSubmit(true);

        return true;
      } else if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_06"
      ) {
        setIsResubmitted(false);
        setResubmitIntimation(true);

        return true;
      } else {
        showNotification({
          type: "warning",
          title: getMessage(responseMessage),
        });
        return false;
      }

      // ✅ Common success notification (sirf success wale cases me chalega)
      // showNotification({
      //   type: "success",
      //   title: "Success",
      //   description: getMessage(responseMessage),
      // });

      return true;
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

//Get All View Details By Trade Approval ID
export const GetAllViewDetailsByTradeApprovalID = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("Check APi");
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ALL_VIEW_DETAIL_TRADEAPPROVAL_ID_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
    });
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      console.log("Check APi");
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, details, hierarchyList, hierarchyDetails } =
        res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetAllViewDetailsByTradeApprovalID_01"
      ) {
        console.log("Check APi");
        return {
          details: details || [],
          hierarchyList: hierarchyList || [],
          hierarchyDetails: hierarchyDetails || {},
        };
      }

      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
        description: "No details available for this Trade Approval ID.",
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
