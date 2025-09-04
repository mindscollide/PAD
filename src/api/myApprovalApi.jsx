// src/api/dashboardApi.js
import { getMessage, handleExpiredSession } from "./utils";

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

/* ** 
LINE MANAGER API'S START FROM HERE
** */

//SEARCH LINE MANAGER FOR APPROVALS REQUEST API START HERE

export const SearchApprovalRequestLineManager = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_SEARCH_LINE_MANAGER_APPROVAL_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
    });

    if (handleExpiredSession(res, navigate, showLoader)) {
      return {
        lineApprovals: [],
        totalRecords: 0,
      };
    }

    if (!res?.result?.isExecuted) {
      return {
        lineApprovals: [],
        totalRecords: 0,
      };
    }

    if (res.success) {
      const { responseMessage, lineManagerApprovals, totalRecords } =
        res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchLineManagerApprovalsRequest_01"
      ) {
        return {
          lineApprovals: lineManagerApprovals || [],
          totalRecords: totalRecords ?? 0,
        };
      }
    }

    return {
      lineApprovals: [],
      totalRecords: 0,
    };
  } catch (error) {
    console.error("Error Occurred:", error);
    return {
      lineApprovals: [],
      totalRecords: 0,
    };
  } finally {
    showLoader(false);
  }
};

//UPDATE APPROVALS REQUEST STATUS API START HERE

/* ** 
LINE MANAGER API'S END FROM HERE
** */
