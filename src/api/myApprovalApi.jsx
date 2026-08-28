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
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

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
      navigate,
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
      navigate,
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
      const {
        responseMessage,
        assetTypes,
        details,
        hierarchyDetails,
        workFlowStatus,
        isEscalated,
      } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetAllViewDetailsByTradeApprovalID_01"
      ) {
        console.log("Check APi");
        return {
          assetTypes: assetTypes || [],
          details: details || [],
          hierarchyDetails: hierarchyDetails || [],
          workFlowStatus: workFlowStatus || {},
          // Was being destructured straight off res.result and dropped -
          // the backend already sends this (TradeServiceManager.cs:1148),
          // but it never survived this wrapper, so ViewDetailModal's
          // `viewDetailsModalData?.isEscalated` read was always undefined
          // regardless of what the API actually returned.
          isEscalated: Boolean(isEscalated),
        };
      }

      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
        description: "No details available for this Trade Approval ID.",
      });
      return {
        assetTypes: [],
        details: [],
        hierarchyDetails: [],
        workFlowStatus: {},
      };
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

//GETEMPLOYEEHISTORYWORKFLOWDETAILS FOR HISTORY PAGE IN EMPLOYEE
export const SearchEmployeeHistoryDetailRequest = async ({
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
        .VITE_EMPLOYEE_HISTORY_WORK_DETAILS_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching Group Policies List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, workFlows, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_EmployeeHistoryWorkFlowDetails_01"
      ) {
        return {
          workFlows: workFlows || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_EmployeeHistoryWorkFlowDetails_02"
      ) {
        return {
          workFlows: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No Group Policies found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching Policies..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//Download Excel Report from my History page
export const DownloadMyHistoryReportRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setOpen,
  navigate,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_EMPLOYEE_HISTORY_SUMMARY_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Export Failed",
        description: "Something went wrong while exporting your history.",
      });
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "MyHistory-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        // was calling setOpen(false) without setOpen ever being a
        // parameter of this function - a ReferenceError that got silently
        // caught by the catch block below, making an actually-successful
        // download report itself as a failure.
        if (setOpen) setOpen(false);
        return true;
      } catch {
        showNotification({
          type: "error",
          title: "Export Failed",
          description: "Unable to prepare the exported file for download.",
        });
        return false;
      }
    }

    // The export SP was rewritten to rethrow a real error on failure (e.g.
    // no matching records) instead of silently returning a near-empty file
    // (2026-08-07_employee_history_export_layout_rebuild.md) - surface it
    // rather than doing nothing visible, same as every other export.
    showNotification({
      type: "error",
      title: "Export Failed",
      description: getMessage(res.message) || "No records found to export.",
    });
    return false;
  } catch {
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred while exporting your history.",
    });
    return false;
  } finally {
    showLoader(false);
  }
};

// Report For Get Employee Transaction Request Report API
export const GetEmployeeTransactionReportRequestApi = async ({
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
        .VITE_GET_EMPLOYEE_TRANSACTION_REPORT_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching Group Policies List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, transactions, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeTransactionReqeustReports_01"
      ) {
        return {
          transactions: transactions || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeTransactionReqeustReports_02"
      ) {
        return {
          transactions: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No Group Policies found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching Policies..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// Report For Get Employee Trade Approval Standing Request Report API
export const GetEmployeeTradeApprovalReportRequestApi = async ({
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
        .VITE_GET_EMPLOYEE_TRADE_APPROVAL_STANDING_REPORT_REQEUST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching Group Policies List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, summary } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeTradeApprovalStandingSummary_01"
      ) {
        return {
          summary: summary || [],
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeTransactionReqeustReports_02"
      ) {
        return {
          summary: [],
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No Group Policies found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching Policies..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// Report For Get Employee Compliance Standing Request Report API
export const GetEmployeeComplianceStandingReportRequestApi = async ({
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
        .VITE_EMPLOYEE_COMPLIANCE_STANDING_REPORTS_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching Group Policies List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, summary } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeTransactionSummary_01"
      ) {
        return {
          summary: summary || [],
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeTransactionSummary_02"
      ) {
        return {
          summary: [],
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No Group Policies found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching Policies..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
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
      navigate,
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
  }
  // No blanket showLoader(false) here — the caller (fetchApiCall in
  // approvalRequest.jsx) already owns loader show/hide via its own
  // showLoaderFlag, specifically so MQTT-triggered background refreshes
  // (LINE_MANAGER_NEW_TRADE_APPROVAL_REQUEST etc., showLoaderFlag=false)
  // can run silently. An unconditional hide here ignored that flag and
  // killed the loader mid-flight for whatever unrelated action was
  // actually showing it (e.g. the Approve/Decline submit flow).
};

//UPDATE APPROVALS REQUEST STATUS API START HERE
export const UpdateApprovalRequestStatusLineManager = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setNoteGlobalModal,
  setDeclinedGlobalModal,
  setApprovedGlobalModal,
  setHeadApprovalNoteModal,
  setHeadDeclineNoteModal,
  submitText,
  setValue,
  navigate,
}) => {
  try {
    // 🔹 Call the API
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_UPDATE_APPROVAL_REQUEST_STATUS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    //  Check if session has expired
    if (handleExpiredSession(res, navigate, showLoader)) return false;

    // If execution failed
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return false;
    }

    // If API response is successful
    if (res.success) {
      const { responseMessage } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_UpdateApprovalRequestStatus_01"
      ) {
        setNoteGlobalModal({ visible: false, action: null });
        if (submitText === "Approve") {
          setApprovedGlobalModal(true);
          setValue("");
        } else if (submitText === "Decline") {
          setDeclinedGlobalModal(true);
          setValue("");
        } else if (submitText === "HTA-Approve") {
          setHeadApprovalNoteModal(true);
          setValue("");
        } else if (submitText === "HTA-Decline") {
          setHeadDeclineNoteModal(true);
          setValue("");
        }
        return true;
      }

      //  Other known warnings
      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
      });
      return false;
    }

    //  Fallback error for unknown failures
    showNotification({
      type: "error",
      title: "Request Failed",
      description: getMessage(res.message),
    });
    return false;
  } catch (error) {
    // ❌ Unexpected exception
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    return false;
  } finally {
    // 🔽 Always hide loader after API completes
    showLoader(false);
  }
};

//HET APPROVALS REQUEST VIEW DATA LINE MANAGER API START HERE
export const GetAllLineManagerViewDetailRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("Check APi", requestdata);
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_LINE_MANAGER_VIEW_DETAIL_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
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
      const {
        responseMessage,
        assetTypes,
        details,
        hierarchyDetails,
        requesterName,
        workFlowStatus,
        myActionStatusID,
        myActionStatus,
        isEscalated,
      } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetLineManagerViewDetailsByTradeApprovalID_01"
      ) {
        console.log("Check APi");
        return {
          assetTypes: assetTypes || [],
          details: details || [],
          hierarchyDetails: hierarchyDetails || [],
          requesterName: requesterName || "",
          workFlowStatus: workFlowStatus || {},
          myActionStatusID: myActionStatusID ?? null,
          myActionStatus: myActionStatus || "",
          isEscalated: isEscalated || false,
        };
      }

      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
        description: "No details available for this Trade Approval ID.",
      });
      return {
        assetTypes: [],
        details: [],
        hierarchyDetails: [],
        requesterName: "",
        workFlowStatus: {},
        myActionStatusID: null,
        myActionStatus: "",
        isEscalated: false,
      };
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

// Conduct Transaction API While Click on View Approved Modal hit conduct Transaction button
export const ConductTransactionUpdateApi = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setIsConductedTransaction,
  setIsSubmit,
  navigate,
}) => {
  console.log("Check APi");

  try {
    // 🔹 API Call
    console.log("Check APi");

    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_CONDUCT_TRANSACTION_API_REQUEST_METHOD, // <-- Add Trade Approval method
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
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
        "PAD_Trade_TradeServiceManager_CondcutTransactionRequest_01"
      ) {
        setIsConductedTransaction(false);
        setIsSubmit(true);

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

// Resubmit Approval Request Api after Selecting Predefine Reason
export const ResubmitApprovalRequestApi = async ({
  callApi,
  showNotification,
  showLoader,
  requestData,
  setIsResubmitted,
  setCommentValue,
  setResubmitIntimation,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env.VITE_RESUBMIT_APPROVAL_REQUEST_METHOD, // <-- Add Trade Approval method
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestData,
      navigate,
    });

    //  Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;

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
        "PAD_Trade_TradeServiceManager_ResubmitApprovalRequest_01"
      ) {
        setIsResubmitted(false);
        setCommentValue("");
        setResubmitIntimation(true);
        return true;
      } else {
        showNotification({
          type: "warning",
          title: getMessage(responseMessage),
        });
        return false;
      }
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

//GetLineManagerActionsWorkflowDetail FOR MyAction PAGE IN LINEMANAGER
export const SearchLMMyActionWorkFlowRequest = async ({
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
        .VITE_LM_MYACTION_WORKFLOWS_DETAILS_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching Group Policies List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, requests, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (responseMessage === "PAD_Trade_LineManagerActionsWorkflowDetail_01") {
        return {
          requests: requests || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Trade_LineManagerActionsWorkflowDetail_02") {
        return {
          requests: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No Group Policies found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching Policies..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//Download Excel Report from my History page
export const DownloadMyActionsReportRequest = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_LINE_MANAGER_MYACTION_SUMMARY_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "MyAction-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

//GetComplianceOfficerMyActionsWorkflowDetail FOR MyAction PAGE IN Compliance Officer
export const GetComplianceOfficerMyActionsWorkflowDetail = async ({
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
        .VITE_GET_COMPLIANCE_OFFICER_MY_ACTIONS_WORKFLOW_DETAIL_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching My Actions List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, requests, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_GetComplianceOfficerMyActionsWorkflowDetail_01"
      ) {
        return {
          requests: requests || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_GetComplianceOfficerMyActionsWorkflowDetail_02"
      ) {
        return {
          requests: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No My Actions found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching My Actions..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

/* ** 
LINE MANAGER API'S END FROM HERE
** */

// ================================================= //
// *Rports* //
// ================================================= //

// Employee dashbord api of reports
// GetEmployeeReportsDashboardStatsAPI
export const GetEmployeeReportsDashboardStatsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_EMPLOYEE_REPORTS_DASHBOARD_STATS_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching employee Dashboard reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const {
        myComplianceStanding,
        myTradeApprovals,
        myTradeApprovalsStanding,
        myTransactions,
      } = res.result.employeeReportsDashboardStats;
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeReportsDashboardStats_01"
      ) {
        return {
          myComplianceStanding,
          myTradeApprovals,
          myTradeApprovalsStanding,
          myTransactions,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeReportsDashboardStats_02"
      ) {
        return [];
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Employee Reports Dashboard Stats API .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// Line Manager dashbord api of reports
// GetLineManagerReportDashBoard
export const GetLineManagerReportDashBoard = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_LINEMANAGERRE_PORT_DASHBOARD_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching lieManager Dashboard reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      console.log("lineManagerReportsDashboardData", res);
      const { tradeApprovalsRequests, pendingApprovals } = res.result;
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);
      console.log("lineManagerReportsDashboardData", res);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_LineManagerTradeApprovalCounts_01"
      ) {
        return {
          tradeApprovalsRequests: tradeApprovalsRequests.tile,
          pendingApprovals: pendingApprovals.tile,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_LineManagerTradeApprovalCounts_02"
      ) {
        return [];
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Employee Reports Dashboard Stats API .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// Compliance oficer dashbord api of reports
// GetComplianceOfficerReportsDashboardStatsAPI
export const GetComplianceOfficerReportsDashboardStatsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_COMPLIANCE_OFFICER_DASHBOARD_STATS_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Compliance Officer Dashboard reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const {
        dateWiseTransactions,
        transactionsSummary,
        overdueVerifications,
        portfolioHistory,
      } = res.result.complianceOfficerDashboardStats;
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetComplianceOfficerDashboardStats_01"
      ) {
        return {
          dateWiseTransactions,
          transactionsSummary,
          overdueVerifications,
          portfolioHistory,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetComplianceOfficerDashboardStats_02"
      ) {
        return [];
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Compliance officer Reports Dashboard Stats API .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

export const SearchMyTradeApprovalsReportsApi = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("🔍 Request Data (Transactions):", requestdata);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EMPLOYEE_TRADE_APPROVAL_REPORTS_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching employee trade approvals reports api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, myTradeApprovals, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeTradeApprovalReports_01"
      ) {
        return {
          myTradeApprovals: myTradeApprovals || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetEmployeeTradeApprovalReports_02"
      ) {
        return {
          myTradeApprovals: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reports  found for this employee.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching My Trade Approvals Reports.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//Download Excel Report from MY Compliance STanding Report from Employee
export const DownloadMyComplianceStandingRequestAPI = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_EMPLOYEE_COMPLIANCE_STANDING_REPORT_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "My-Compliance-Standing-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

//Download Excel Report from MY Trade Approval Standing Report from Employee
export const DownloadMyTradeApprovalStandingRequestAPI = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_EMPLOYEE_MY_TRADE_APPROVAL_STANDING_REPORT_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "My-TradeApproval-Standing-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

//Download My Transaction From the Employee report dashboard
export const DownloadMyTransactionReportRequestAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setOpen,
  navigate,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_MY_TRANSACTION_REPORT_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Export Failed",
        description: "Something went wrong while exporting your transactions.",
      });
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "My-Transaction-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        // was calling setOpen(false) without setOpen ever being a
        // parameter of this function - a ReferenceError silently caught by
        // the catch block below, making an actually-successful download
        // report itself as a failure (same bug fixed in
        // DownloadMyHistoryReportRequest).
        if (setOpen) setOpen(false);
        return true;
      } catch {
        showNotification({
          type: "error",
          title: "Export Failed",
          description: "Unable to prepare the exported file for download.",
        });
        return false;
      }
    }

    showNotification({
      type: "error",
      title: "Export Failed",
      description: getMessage(res.message) || "No records found to export.",
    });
    return false;
  } catch {
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while exporting your transactions.",
    });
    return false;
  } finally {
    showLoader(false);
  }
};

//Download My Trade Approval From the Employee report dashboard
export const DownloadMyTradeApprovalReportRequestAPI = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_TRADE_APPROVAL_REPORT_API_REQEUST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "My-Trade-Approval-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

//For Line Manager Trade Approval Request API for Reports
export const SearchLineManagerTradeApprovalRequestApi = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("🔍 Request Data (Transactions):", requestdata);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_TRADE_APPROVAL_REQUESTS_FOR_LINEMANAGER_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching employee trade approvals reports api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_TradeApprovalRequestsReport_01"
      ) {
        return {
          records: records || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_TradeApprovalRequestsReport_02"
      ) {
        return {
          records: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reports  found for this employee.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching My Trade Approvals Reports.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//Download My Trade Approval From the Line Manager report dashboard
export const DownloadLineManagerMyTradeApprovalReportRequestAPI = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_MY_TRADE_APPROVAL_LINEMANAGER_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "LM-Trade-Approval-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

// SearchComplianceOfficerDateWiseTransactionRequest
export const SearchComplianceOfficerDateWiseTransactionRequest = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
  requestdata,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_COMPLIANCE_OFFICER_DATE_WISE_TRANSACTION_REQUEST_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Compliance Officer date wise transaction reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res?.success) {
      const { totalRecords, complianceOfficerApprovals, responseMessage } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerDateWiseTransactionRequest_01"
      ) {
        return {
          totalRecords: totalRecords,
          complianceOfficerApprovals: complianceOfficerApprovals,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerDateWiseTransactionRequest_02"
      ) {
        return {
          totalRecords: 0,
          complianceOfficerApprovals: [],
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Compliance officer date wise transaction reports  API .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

export const DownloadComplianceOfficerDateWiseTransactionReportRequestAPI =
  async ({ callApi, showLoader, requestdata, navigate, setOpen }) => {
    try {
      showLoader(true);

      // 🔹 API Call
      const res = await callApi({
        requestMethod: import.meta.env
          .VITE_EXPORT_COMPLIANCE_OFFICER_DATEWISE_TRANSACTION_API_REQUEST_METHOD,
        endpoint: import.meta.env.VITE_API_REPORT,
        requestData: requestdata,
        navigate,
        responseType: "arraybuffer", // ⚡ Required for file download
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      // 🔹 Check Session Expiry
      if (handleExpiredSession(res, navigate, showLoader)) return false;
      // 🔹 When API send isExecuted false
      if (!res?.result?.isExecuted) {
        return false;
      }

      // 🔹 When API Send Success Response
      if (res.success) {
        try {
          // Create a blob and trigger download
          const blob = new Blob([res.result?.fileData || res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;

          link.setAttribute(
            "download",
            "ComplianceOfficer-DateWise-Transaction-Report.xlsx"
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setOpen(false);
          return true;
        } catch (downloadError) {
          return false;
        }
      }

      return false;
    } catch (error) {
      return false;
    } finally {
      showLoader(false);
    }
  };

// LM Pending request rport
export const SearchLineManagerPendingApprovalsRequest = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_LINE_MANAGER_PENDING_APPROVALS_REQUEST_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) {
      return {
        pendingApprovals: [],
        totalRecords: 0,
      };
    }

    if (!res?.result?.isExecuted) {
      return {
        pendingApprovals: [],
        totalRecords: 0,
      };
    }

    if (res.success) {
      const { responseMessage, pendingApprovals, totalRecords } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchLineManagerPendingApprovalsRequest_01"
      ) {
        return {
          pendingApprovals: pendingApprovals || [],
          totalRecords: totalRecords ?? 0,
        };
      }
    }

    return {
      pendingApprovals: [],
      totalRecords: 0,
    };
  } catch (error) {
    console.error("Error Occurred:", error);
    return {
      pendingApprovals: [],
      totalRecords: 0,
    };
  } finally {
    showLoader(false);
  }
};

// Export LineManager Pending Trade Approvals Excel
export const ExportLineManagerPendingTradeApprovalsExcel = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_LINE_MANAGER_PENDING_TRADE_APPROVALS_EXCEL_REQUEST_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "Pending-Request-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

// GetComplianceOfficerViewTransactionSummaryAPI
export const GetComplianceOfficerViewTransactionSummaryAPI = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
  requestdata,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_COMPLIANCE_OFFICER_VIEW_TRANSACTION_SUMMARY_REPORT_REQUEST_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Compliance Officer View Transaction Summary reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res?.success) {
      const { totalRecords, records, responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetComplianceOfficerViewTransactionSummaryAPI_01"
      ) {
        return {
          totalRecords: totalRecords,
          record: records,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetComplianceOfficerViewTransactionSummaryAPI_02"
      ) {
        return {
          totalRecords: 0,
          record: [],
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Compliance Officer View Transaction Summary reports Api .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// GetHOCViewTransactionSummaryAPI — HOC's own View Details of Transaction Summary Report.
// System-wide (no CO-hierarchy scoping), unlike GetComplianceOfficerViewTransactionSummaryAPI
// above which is deliberately scoped to the calling CO's own subordinates and cannot be
// reused for HOC. Same request shape as the CO version.
export const GetHOCTransactionSummaryViewDetailsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
  requestdata,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_HOC_VIEW_TRANSACTION_SUMMARY_REPORT_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching HOC View Transaction Summary reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res?.success) {
      const { totalRecords, records, responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHOCViewTransactionSummaryAPI_01"
      ) {
        return {
          totalRecords: totalRecords,
          record: records,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHOCViewTransactionSummaryAPI_02"
      ) {
        return {
          totalRecords: 0,
          record: [],
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while requesting HOC View Transaction Summary reports Api.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// SearchComplianceOfficerTransactionSummaryReportRequest
export const SearchComplianceOfficerTransactionSummaryReportRequest = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
  requestdata,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_COMPLIANCE_OFFICER_TRANSACTION_SUMMARY_REPORT_REQUEST_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Compliance Officer Search HOCTransactionSummaryReportRequest Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res?.success) {
      const { totalRecords, transactions, responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerTransactionSummaryReportRequest_01"
      ) {
        return {
          totalRecords: totalRecords,
          transactions: transactions,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerTransactionSummaryReportRequest_02"
      ) {
        return {
          totalRecords: 0,
          transactions: [],
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Compliance Officer View Transaction Summary reports Api .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// GetHOCReportsDashboardStatsAPI
export const GetHOCReportsDashboardStatsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_HOC_REPORTS_DASHBOARD_STATS_API_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Head of Compliance Officer Dashboard reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const {
        transactionSummary,
        dateWiseTransactionCount,
        overDueVerificationsCount,
        uploadedPortfolioCount,
      } = res.result.hocReportsDashboardStats;
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHOCReportsDashboardStatsAPI_01"
      ) {
        return {
          transactionSummary,
          dateWiseTransactionCount,
          overDueVerificationsCount,
          uploadedPortfolioCount,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHOCReportsDashboardStatsAPI_02"
      ) {
        return [];
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Head of Compliance officer Reports Dashboard Stats API .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// ADDED (2026-08-10): GetAdminReportsDashboardStatsAPI - backs the Admin Reports
// Dashboard (pages/adminMain/reports/index.jsx), which already existed and was
// calling GetHOCReportsDashboardStatsAPI as a placeholder before this endpoint
// existed. This endpoint lives in the ADMIN service (not Trade) - the backend
// already had a scaffolded (but mock/stubbed) implementation there with its own
// property names (userActivityReport, userWiseComplianceReport, policyBreaches,
// tradeApprovalRequest, dateWiseTransactionReport, transactionSummaryReport,
// tATRequestApprovals, tradeUploadedViaPortfolio) - this function maps those onto
// the flat key names the already-built page reads via useMemo
// (adminReportsDashboardData?.<key>?.data). "tATRequestApprovals" is read
// defensively under both possible camelCase spellings (tatRequestApprovals /
// taTRequestApprovals) since .NET's default JSON camelCase conversion of a
// property starting with a 3-letter acronym ("TAT") wasn't independently
// confirmed - whichever the backend actually emits, this still picks it up.
export const GetAdminReportsDashboardStatsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_REPORTS_DASHBOARD_STATS_API_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_ADMIN,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin Reports Dashboard Stats Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const stats = res.result.adminReportsDashboardStats || {};
      const {
        userActivityReport,
        userWiseComplianceReport,
        policyBreaches,
        tradeApprovalRequest,
        dateWiseTransactionReport,
        transactionSummaryReport,
        tradeUploadedViaPortfolio,
      } = stats;
      const tatRequestApprovals =
        stats.tatRequestApprovals || stats.taTRequestApprovals;
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (responseMessage === "PAD_Admin_GetAdminReportsDashboardStatsAPI_01") {
        return {
          userActivityCount: userActivityReport,
          userWiseComplianceCount: userWiseComplianceReport,
          policyBreachesCount: policyBreaches,
          tradeApprovalRequestCount: tradeApprovalRequest,
          userDateTransactionCount: dateWiseTransactionReport,
          userWiseTransactionCount: transactionSummaryReport,
          tatRequestApprovalCount: tatRequestApprovals,
          complianceStandingTransactionCount: tradeUploadedViaPortfolio,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Admin_GetAdminReportsDashboardStatsAPI_02") {
        return [];
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while requesting Admin Reports Dashboard Stats API.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// =====================================================================
// Admin Reports - all 8 report APIs (2026-08-11), per
// API_Changes/2026-08-11_admin_reports_all_apis.md. All live in the
// Admin service (VITE_API_ADMIN), not Trade. Export endpoints for all
// 8 reports are explicitly out of scope per that doc.
// =====================================================================

// GetAdminUserWiseComplianceReportAPI - list only (View Details screen
// was not built on the backend - see doc).
export const GetAdminUserWiseComplianceReportAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_USER_WISE_COMPLIANCE_REPORT_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin User-wise Compliance Report.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      if (
        responseMessage === "PAD_Admin_GetAdminUserWiseComplianceReportAPI_01"
      ) {
        return { records: records || [], totalRecords: totalRecords || 0 };
      }

      if (
        responseMessage === "PAD_Admin_GetAdminUserWiseComplianceReportAPI_02"
      ) {
        return { records: [], totalRecords: 0 };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Admin User-wise Compliance Report.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// ADDED (API_Changes/2026-08-27_admin_user_wise_compliance_report_details.md):
// User-wise Compliance Report "View Details" screen - profile panel (left,
// not date-scoped) + stats/graph panel (right, date-scoped). Request:
// {EmployeeID, StartDate, EndDate} - dates optional, BE defaults to the
// last 6 months. Response is the flat object itself, not nested under a
// "records"-style key - returned as-is (mapping into UI shape happens in
// viewDetails/utils.jsx).
export const GetAdminUserWiseComplianceReportDetailsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_USER_WISE_COMPLIANCE_REPORT_DETAILS_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching this employee's compliance details.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, ...details } = res.result;

      if (
        responseMessage ===
        "PAD_Admin_GetAdminUserWiseComplianceReportDetailsAPI_01"
      ) {
        return details;
      }

      if (
        responseMessage ===
        "PAD_Admin_GetAdminUserWiseComplianceReportDetailsAPI_02"
      ) {
        showNotification({
          type: "warning",
          title: getMessage(responseMessage),
          description: "No details found for this employee.",
        });
        return null;
      }

      const message = getMessage(responseMessage);
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }
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
      description:
        "An unexpected error occurred while fetching this employee's compliance details.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// ADDED (API_Changes/2026-08-27_admin_user_wise_compliance_report_details.md):
// User-wise Compliance Report View Details' "View More" modal - full,
// unpaginated policy assignment history. Request: {EmployeeID}. Response:
// {currentPolicy, previouslyAssignedPolicies[]} - sort previouslyAssignedPolicies
// client-side (no server-side sort param, per the doc).
export const GetAdminUserWiseComplianceReportPolicyHistoryAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_USER_WISE_COMPLIANCE_REPORT_POLICY_HISTORY_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching this employee's policy history.",
      });
      return null;
    }

    if (res.success) {
      const {
        responseMessage,
        currentPolicy,
        previouslyAssignedPolicies,
      } = res.result;

      if (
        responseMessage ===
        "PAD_Admin_GetAdminUserWiseComplianceReportPolicyHistoryAPI_01"
      ) {
        return {
          currentPolicy: currentPolicy || null,
          previouslyAssignedPolicies: previouslyAssignedPolicies || [],
        };
      }

      const message = getMessage(responseMessage);
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }
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
      description:
        "An unexpected error occurred while fetching this employee's policy history.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// GetAdminPolicyBreachesAPI - list
export const GetAdminPolicyBreachesAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env.VITE_GET_ADMIN_POLICY_BREACHES_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin Policy Breaches Report.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      if (responseMessage === "PAD_Admin_GetAdminPolicyBreachesAPI_01") {
        return { records: records || [], totalRecords: totalRecords || 0 };
      }

      if (responseMessage === "PAD_Admin_GetAdminPolicyBreachesAPI_02") {
        return { records: [], totalRecords: 0 };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Admin Policy Breaches Report.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// GetAdminPolicyBreachDetailsAPI - "Policies Breached" drill-down modal,
// opened by clicking a row's Policy Count. No pagination - a single row's
// full breach list.
export const GetAdminPolicyBreachDetailsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_POLICY_BREACH_DETAILS_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Policy Breach Details.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records } = res.result;
      const message = getMessage(responseMessage);

      if (responseMessage === "PAD_Admin_GetAdminPolicyBreachDetailsAPI_01") {
        return { records: records || [] };
      }

      if (responseMessage === "PAD_Admin_GetAdminPolicyBreachDetailsAPI_02") {
        return { records: [] };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Policy Breach Details.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// ADDED (API_Changes/2026-08-27_admin_policy_breaches_export.md): main
// list "Export" button. Request shape mirrors buildApiRequest
// (policyBreaches/utils.jsx) minus PageNumber/Length - exports the full
// filtered list, not a page.
export const ExportAdminPolicyBreaches = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_ADMIN_POLICY_BREACHES_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (handleExpiredSession(res, navigate, showLoader)) return false;
    if (!res?.result?.isExecuted) {
      return false;
    }

    if (res.success) {
      try {
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "Admin-Policy-Breaches-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen?.(false);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

// ADDED (API_Changes/2026-08-27_admin_policy_breaches_export.md):
// "Policies Breached" drill-down modal's Download button - exports one
// specific breach event, identified the same way
// GetAdminPolicyBreachDetailsAPI already is (WorkFlowUserPolicy has no
// workflow ID, so EmployeeID+InstrumentName+Type+Quantity+RequestedDateTime
// is the natural key).
export const ExportAdminPolicyBreachDetails = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    showLoader(true);

    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_ADMIN_POLICY_BREACH_DETAILS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (handleExpiredSession(res, navigate, showLoader)) return false;
    if (!res?.result?.isExecuted) {
      return false;
    }

    if (res.success) {
      try {
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "Admin-Policy-Breach-Details.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

// GetAdminTradeApprovalRequestSummaryAPI - per-employee summary list
export const GetAdminTradeApprovalRequestSummaryAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_TRADE_APPROVAL_REQUEST_SUMMARY_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin Trade Approval Request Summary Report.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      if (
        responseMessage ===
        "PAD_Admin_GetAdminTradeApprovalRequestSummaryAPI_01"
      ) {
        return { records: records || [], totalRecords: totalRecords || 0 };
      }

      if (
        responseMessage ===
        "PAD_Admin_GetAdminTradeApprovalRequestSummaryAPI_02"
      ) {
        return { records: [], totalRecords: 0 };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Admin Trade Approval Request Summary Report.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// ADDED (API_Changes/2026-08-28_admin_trade_approval_request_report_export.md):
// Admin > Reports > Trade Approval Request Report list-level "Export
// Excel" - was wrongly wired to ExportHTATradeApprovalRequestsExcelReport
// (a different report entirely, see tradeApprovalRequest/index.jsx), same
// bug shape as the other Admin report exports fixed today. Request shape
// per the doc: {EmployeeName, DepartmentName, StartDate, EndDate} -
// StartDate/EndDate empty defaults to the same "last 6 months" the live
// list uses, no pagination (exports the full filtered list).
export const ExportAdminTradeApprovalRequestSummary = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_ADMIN_TRADE_APPROVAL_REQUEST_SUMMARY_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (handleExpiredSession(res, navigate, showLoader)) return false;
    if (!res?.result?.isExecuted) {
      return false;
    }

    if (res.success) {
      try {
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute(
          "download",
          "Admin-Trade-Approval-Request-Report.xlsx"
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen?.(false);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

// GetAdminDateWiseTransactionReportAPI - system-wide, no CO/hierarchy
// scoping. New Admin-service wrapper that reuses HOC's underlying SP.
export const GetAdminDateWiseTransactionReportAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_DATE_WISE_TRANSACTION_REPORT_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin Date-wise Transaction Report.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      if (
        responseMessage === "PAD_Admin_GetAdminDateWiseTransactionReportAPI_01"
      ) {
        return { records: records || [], totalRecords: totalRecords || 0 };
      }

      if (
        responseMessage === "PAD_Admin_GetAdminDateWiseTransactionReportAPI_02"
      ) {
        return { records: [], totalRecords: 0 };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Admin Date-wise Transaction Report.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// GetAdminTransactionSummaryReportAPI - list (one row per calendar date)
export const GetAdminTransactionSummaryReportAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_TRANSACTION_SUMMARY_REPORT_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin Transactions Summary Report.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      if (
        responseMessage === "PAD_Admin_GetAdminTransactionSummaryReportAPI_01"
      ) {
        return { records: records || [], totalRecords: totalRecords || 0 };
      }

      if (
        responseMessage === "PAD_Admin_GetAdminTransactionSummaryReportAPI_02"
      ) {
        return { records: [], totalRecords: 0 };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Admin Transactions Summary Report.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// GetAdminTransactionSummaryViewDetailsAPI - per-date drill-down. Per SRS,
// Admin's View Details has 2 extra columns vs CO/HOC (Action By, Action
// Date) - actionByJson is a JSON string, needs a second parse on the FE.
export const GetAdminTransactionSummaryViewDetailsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_TRANSACTION_SUMMARY_VIEW_DETAILS_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin Transactions Summary View Details.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      if (
        responseMessage ===
        "PAD_Admin_GetAdminTransactionSummaryViewDetailsAPI_01"
      ) {
        return { records: records || [], totalRecords: totalRecords || 0 };
      }

      if (
        responseMessage ===
        "PAD_Admin_GetAdminTransactionSummaryViewDetailsAPI_02"
      ) {
        return { records: [], totalRecords: 0 };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Admin Transactions Summary View Details.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// GetAdminTATRequestApprovalsAPI - per-employee summary list
export const GetAdminTATRequestApprovalsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_TAT_REQUEST_APPROVALS_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin TAT Request Approvals Report.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      if (responseMessage === "PAD_Admin_GetAdminTATRequestApprovalsAPI_01") {
        return { records: records || [], totalRecords: totalRecords || 0 };
      }

      if (responseMessage === "PAD_Admin_GetAdminTATRequestApprovalsAPI_02") {
        return { records: [], totalRecords: 0 };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Admin TAT Request Approvals Report.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// GetAdminTATRequestApprovalDetailsAPI - per-employee View Details (one
// row per request). actionBy reflects whichever actor's bundle was the
// last one modified on that workflow.
export const GetAdminTATRequestApprovalDetailsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_TAT_REQUEST_APPROVAL_DETAILS_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin TAT Request Approval Details.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      if (
        responseMessage === "PAD_Admin_GetAdminTATRequestApprovalDetailsAPI_01"
      ) {
        return { records: records || [], totalRecords: totalRecords || 0 };
      }

      if (
        responseMessage === "PAD_Admin_GetAdminTATRequestApprovalDetailsAPI_02"
      ) {
        return { records: [], totalRecords: 0 };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Admin TAT Request Approval Details.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// GetAdminTradesUploadedViaPortfolioAPI - list. Status filters on the raw
// WorkFlowStatusID (1=Pending, 8=Compliant, 9=Non-Compliant for Portfolio
// uploads).
export const GetAdminTradesUploadedViaPortfolioAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ADMIN_TRADES_UPLOADED_VIA_PORTFOLIO_API_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Admin Trades Uploaded via Portfolio Report.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      if (
        responseMessage === "PAD_Admin_GetAdminTradesUploadedViaPortfolioAPI_01"
      ) {
        return { records: records || [], totalRecords: totalRecords || 0 };
      }

      if (
        responseMessage === "PAD_Admin_GetAdminTradesUploadedViaPortfolioAPI_02"
      ) {
        return { records: [], totalRecords: 0 };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

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
      description:
        "An unexpected error occurred while fetching Admin Trades Uploaded via Portfolio Report.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// HTA dashbord api of reports
// GetHTAReportsDashboardStatsAPI
export const GetHTAReportsDashboardStatsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_HTA_REPORTS_DASHBOARD_STATS_API_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      navigate,
    });
    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching HTA Dashboard reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const {
        policyBreaches,
        tradeApprovalRequest,
        tatRequestApprovals,
        pendingRequest,
      } = res.result.htaReportsDashboardStats;
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHTAReportsDashboardStats_01"
      ) {
        return {
          policyBreaches,
          tradeApprovalRequest,
          tatRequestApprovals,
          pendingRequest,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHTAReportsDashboardStats_02"
      ) {
        return [];
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request HTA Reports Dashboard Stats API .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// SearchHOCOverdueVerificationsRequest For Compliance Officer Overdue Verification Page
export const SearchHOCOverdueVerificationsRequestApi = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
  requestdata,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_REPORT_OVERDUE_VERIFICATION_LISTING_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Compliance Officer date wise transaction reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res?.success) {
      const { totalRecords, overdueVerifications, responseMessage } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHOCOverdueVerifications_01"
      ) {
        return {
          overdueVerifications: overdueVerifications,
          totalRecords: totalRecords,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHOCOverdueVerifications_02"
      ) {
        return {
          overdueVerifications: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Compliance officer date wise transaction reports  API .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// Export Report For Compliance Officer Overdue Verification
export const ExportOverdueVerificationCOExcel = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_REPORT_OF_CO_OVERDUE_VERIFICATION_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "Overdue-verification-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

// SearchHOCUploadedPortFolio
export const SearchHOCUploadedPortFolio = async ({
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
        .VITE_SEARCH_HOC_UPLOADED_PORTFOLIO_API_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });
    console.log("SearchHOCUploadedPortFolio", res);

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching hoc uploaded portfolio reports api.",
      });
      return null;
    }
    console.log("SearchHOCUploadedPortFolio", res);

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, pendingPortfolios, totalRecords } = res.result;
      const message = getMessage(responseMessage);
      console.log("handleExpiredSession", res);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHOCUploadedPortFolio_01"
      ) {
        return {
          pendingPortfolios: pendingPortfolios || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHOCUploadedPortFolio_02"
      ) {
        return {
          pendingPortfolios: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description:
            "No reports  found while fetching hoc uploaded portfolio reports api.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching hoc uploaded portfolio reports api.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// SearchHOCDateWiseTransactionRequest
export const SearchHOCDateWiseTransactionRequest = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
  requestdata,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_HOC_DATE_WISE_TRANSACTION_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching HOC date wise transaction reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res?.success) {
      const { totalRecords, complianceOfficerApprovals, responseMessage } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHOCDateWiseTransactionRequest_01"
      ) {
        return {
          totalRecords: totalRecords,
          complianceOfficerApprovals: complianceOfficerApprovals,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHOCDateWiseTransactionRequest_02"
      ) {
        return {
          totalRecords: 0,
          complianceOfficerApprovals: [],
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request HOC date wise transaction reports  API .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// ExportHOCDateWiseTransactionReportExcel
export const ExportHOCDateWiseTransactionReportExcel = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_HOC_DATE_WISE_TRANSACTION_REPORT_EXCEL_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute(
          "download",
          "ComplianceOfficer-DateWise-Transaction-Report.xlsx"
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

//For HTA Trade Approval Request API for Reports
export const GetHTATradeApprovalRequestsReport = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("🔍 Request Data (Transactions):", requestdata);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_HTA_TRADE_APPROVAL_REQUESTS_REPORT_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching HTA trade approvals reports api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHTATradeApprovalRequestsReport_01"
      ) {
        return {
          records: records || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHTATradeApprovalRequestsReport_02"
      ) {
        return {
          records: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reports  found for this employee.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching HTA Trade Approvals Reports.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

export const GetHOCMyActionsWorkflowDetail = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env.VITE_MYACTION_HOC_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching My Actions List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, requests, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_TradeServiceManager_GetHOCMyActionsWorkflowDetail_01"
      ) {
        return {
          requests: requests || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_TradeServiceManager_GetHOCMyActionsWorkflowDetail_02"
      ) {
        return {
          requests: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No My Actions found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching My Actions..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//Compliance Officer Portfolio History Report API
export const GetComplianceOfficerPortfolioHistoryRequestApi = async ({
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
        .VITE_COMPLIANCE_OFFICER_PORTFOLIO_HISTORY_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching My Actions List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const {
        responseMessage,
        complianceOfficerPortfolioHistory,
        totalRecords,
      } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerPortfolioHistoryRequest_01"
      ) {
        return {
          complianceOfficerPortfolioHistory:
            complianceOfficerPortfolioHistory || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerPortfolioHistoryRequest_02"
      ) {
        return {
          complianceOfficerPortfolioHistory: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No My Actions found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching My Actions..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//Compliance Officer Portfolio History Export Report API
export const ExportPortfolioHistoryCOExcel = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_COMPLIANCE_REPORT_PORTFOLIO_HISTORY_API_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "PortfolioHistory_Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

//Head Of Compliance Officer Transaction Summary Report
export const GetHOCViewTransactionSummaryAPI = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
  requestdata,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_TRANSACTION_SUMMARY_REPORT_HOC_API_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Compliance Officer View Transaction Summary reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res?.success) {
      const { totalRecords, transactions, responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerTransactionSummaryReportRequest_01"
      ) {
        return {
          totalRecords: totalRecords,
          transactions: transactions,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerTransactionSummaryReportRequest_02"
      ) {
        return {
          totalRecords: 0,
          transactions: [],
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Compliance Officer View Transaction Summary reports Api .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//Download Export HTA Trade Approval Requests Excel Report
export const ExportHTATradeApprovalRequestsExcelReport = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_HTA_TRADE_APPROVAL_REQUESTS_EXCEL_REPORT_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "HTA-Trade-Approval-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

// HTA Pending Requests screen export — ServiceManager.ExportHTAPendingTradeApprovalsExcel
// (alias of ExportHtaPendingTradeApprovalExcelReport, same implementation).
// See API_Changes/2026-08-05_hta_pending_requests_screen_api_reference.md.
export const ExportHTAPendingTradeApprovalsExcel = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_HTA_PENDING_TRADE_APPROVALS_EXCEL_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "HTA-Pending-Request-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

//For HTA Search Policy Breached Work Flows Request API for Reports
export const SearchPolicyBreachedWorkFlowsRequest = async ({
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
        .VITE_SEARCH_POLICY_BREACHED_WORKFLOWS_REQUEST_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching HTA Policy breaches reports api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, records, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchPolicyBreachedWorkFlowsRequest_01"
      ) {
        return {
          records: records || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchPolicyBreachedWorkFlowsRequest_02"
      ) {
        return {
          records: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reports  found for this employee.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching HTA Policy breaches Reports.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// ADDED (2026-08-18): "Policies Breached" drill-down modal for HTA's
// Policy Breaches report - opened by clicking a row's Policy Count.
// Same shape as GetAdminPolicyBreachDetailsAPI, but hits PAD_Trade (not
// Admin), matching this screen's list call
// (SearchPolicyBreachedWorkFlowsRequest above).
// See API_Changes/2026-08-18_hta_policy_breach_details_and_export_apis.md.
export const GetHTAPolicyBreachDetailsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_HTA_POLICY_BREACH_DETAILS_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Policy Breach Details.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, records } = res.result;
      const message = getMessage(responseMessage);

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHTAPolicyBreachDetailsAPI_01"
      ) {
        return { records: records || [] };
      }

      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return { records: [] };
    }

    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch {
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching Policy Breach Details.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

// ADDED (2026-08-18): modal's own Download button for the "Policies
// Breached" drill-down - same request fields as GetHTAPolicyBreachDetailsAPI
// above, hits the Excel export controller (VITE_API_REPORT) instead of the
// JSON RPC endpoint, same file-download mechanics already used by every
// other Export*Excel* wrapper in this file.
export const ExportHTAPolicyBreachDetailsExcelReport = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    showLoader(true);

    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_HTA_POLICY_BREACH_DETAILS_EXCEL_REPORT_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (handleExpiredSession(res, navigate, showLoader)) return false;
    if (!res?.result?.isExecuted) {
      return false;
    }

    if (res.success) {
      try {
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "HTA-Policy-Breach-Details.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

// ADDED (2026-08-18): HTA Policy Breaches list-level "Export Excel"
// toolbar button - was wrongly wired to ExportHTATradeApprovalRequestsExcelReport
// (a different report entirely) with no real endpoint of its own; BE has
// since shipped this dedicated one (title block, Searching Criteria,
// full unpaginated data set - same convention as every other list
// export). Distinct from ExportHTAPolicyBreachDetailsExcelReport above,
// which exports one specific row's Policy ID/Scenario/Consequences
// breakdown. Request shape: {InstrumentName, EmployeeName,
// DepartmentName, FromDate, ToDate, Quantity} - no TypeIds/pagination,
// this exports the full filtered list.
export const ExportHTAPolicyBreachesExcelReport = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_HTA_POLICY_BREACHES_EXCEL_REPORT_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (handleExpiredSession(res, navigate, showLoader)) return false;
    if (!res?.result?.isExecuted) {
      return false;
    }

    if (res.success) {
      try {
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "HTA-Policy-Breaches-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

// ADDED (2026-08-19): TAT Request Approvals >> View Details' own "Export
// Excel" - the dropdown item existed in the markup but had no onClick at
// all, so it did nothing. Distinct from the TAT summary list's own
// export (index.jsx, which has a different, separate bug - wired to
// ExportHTATradeApprovalRequestsExcelReport, the wrong report entirely -
// out of scope here, flagging only). Same request shape as this screen's
// own buildApiRequest (utils.jsx), minus PageNumber/Length since exports
// return every matching row, never a page.
export const ExportHTATurnAroundTimeRequestDetailsExcel = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_HTA_TAT_REQUEST_DETAILS_EXCEL_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (handleExpiredSession(res, navigate, showLoader)) return false;
    if (!res?.result?.isExecuted) {
      return false;
    }

    if (res.success) {
      try {
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "HTA-TAT-Request-Details.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

// ADDED (API_Changes/2026-08-27_admin_user_wise_compliance_report_export.md):
// Admin > Reports > User-wise Compliance Report list-level "Export Excel" -
// was wrongly wired to ExportHTATradeApprovalRequestsExcelReport (a
// different report entirely, see userWiseComplianceReport/index.jsx), same
// bug shape as the HTA Policy Breaches export above before it got its own
// endpoint. Request shape per the doc: {EmployeeName, DepartmentName} -
// optional LIKE searches only, no date range (this report has none), no
// pagination (exports the full filtered list).
export const ExportAdminUserWiseComplianceReport = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_ADMIN_USER_WISE_COMPLIANCE_REPORT_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (handleExpiredSession(res, navigate, showLoader)) return false;
    if (!res?.result?.isExecuted) {
      return false;
    }

    if (res.success) {
      try {
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "Admin-User-Wise-Compliance-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

//For HTA view Policy Breached by id Flows Request API for Reports
export const GetPoliciesByIDsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
  requestdata,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_POLICIES_BY_IDS_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching HTA View Policy Breach By ID reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res?.success) {
      const { totalRecords, policies, responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (responseMessage === "PAD_Trade_GetPoliciesByIDs_01") {
        return {
          totalRecords: totalRecords,
          policies: policies,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Trade_GetPoliciesByIDs_02") {
        return {
          totalRecords: 0,
          policies: [],
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request HTA View Policy Breach By ID reports Api .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//For HTA Search Turn Around Time Request  API for Reports
export const SearchHTATurnAroundTimeRequest = async ({
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
        .VITE_SEARCH_HTA_TURN_AROUND_TIME_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching HTA TAT  reports api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, employees, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHTATurnAroundTimeRequest_01"
      ) {
        return {
          employees: employees || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHTATurnAroundTimeRequest_02"
      ) {
        return {
          employees: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reports  found for this employee.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching HTA TAT  Reports.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// ExportHOCUploadedPortfolioReportExcel
export const ExportHOCUploadedPortfolioReportExcel = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORTHOC_UPLOADEDPORTFOLIO_REPORT_EXCEL_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "Trade-Upload-Via-Portfolio-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

// SearchComplianceOfficerOverdueVerificationsRequest For Compliance Officer Overdue Verification Page
export const SearchOverdueVerificationsCORequestApi = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
  requestdata,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_COMPLIANCE_OFFICER_OVERDUE_VERIFICATION_REQEUST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching Compliance Officer date wise transaction reports Api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res?.success) {
      const { totalRecords, overdueVerifications, responseMessage } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerOverdueVerifications_01"
      ) {
        return {
          overdueVerifications: overdueVerifications,
          totalRecords: totalRecords,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerOverdueVerifications_02"
      ) {
        return {
          overdueVerifications: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: message,
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while request Compliance officer date wise transaction reports  API .",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// ExportHOCUploadedPortfolioReportExcel
export const ExportHOCOverdueVerificationsExcelReport = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_HCO_OVER_DUE_VERIFICATIONS_EXCEL_REPORT,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute(
          "download",
          "HOC-OverdueVerifications-Excel-Report.xlsx"
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

//For HTA Search Pending Trade Approvals Request API for Reports
export const SearchPendingTradeApprovalsHTAReportRequest = async ({
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
        .VITE_GET_PENDING_TRADE_APPROVALS_FOR_HTA_REPORT_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching HTA Policy breaches reports api.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, pendingTradeApprovals, totalRecords } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetPendingTradeApprovalsForHta_01"
      ) {
        return {
          pendingTradeApprovals: pendingTradeApprovals || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetPendingTradeApprovalsForHta_02"
      ) {
        return {
          pendingTradeApprovals: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reports  found for this employee.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching HTA Policy breaches Reports.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//For HTA Get HTA MyActions Workflow Detail
export const GetHTAMyActionsWorkflowDetailApiRequest = async ({
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
        .VITE_MY_ACTION_WORKFLOW_DETAIL_HTA_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching Group Policies List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, requests, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (responseMessage === "PAD_Trade_GetHTAMyActionsWorkflowDetail_01") {
        return {
          requests: requests || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Trade_GetHTAMyActionsWorkflowDetail_02") {
        return {
          requests: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No Group Policies found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching Policies..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//For HTA Get HTA MyActions Workflow Detail
export const SearchHTATurnAroundTimeDetailsRequestApi = async ({
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
        .VITE_HTA_SEARCH_TURN_AROUND_TIME_DETAIL_API_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching Group Policies List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, workFlows, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHTATurnAroundTimeDetailsRequest_01"
      ) {
        return {
          workFlows: workFlows || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHTATurnAroundTimeDetailsRequest_02"
      ) {
        return {
          workFlows: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Custom server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No Group Policies found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Exception handling
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred  while fetching Policies..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// ExportHOCTransactionSummaryReportExcel
export const ExportHOCTransactionSummaryReportExcelApi = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_HOC_Export_Transaction_Summary_Report_Excel_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute(
          "download",
          "HOC-Transactions-Summary-Excel-Report.xlsx"
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch (downloadError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  } finally {
    showLoader(false);
  }
};

// HOC Transaction Summary "View Details" per-date drill-down export —
// ServiceManager.GetHCAViewTransactionSummaryExportAPI (brand new endpoint,
// see API_Changes/2026-08-06_hca_view_transaction_summary_export_new_api.md).
// Distinct from ExportHOCTransactionSummaryReportExcelApi above, which
// exports the aggregated summary list, not one date's transaction detail.
export const GetHCAViewTransactionSummaryExportAPI = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_HCA_VIEW_TRANSACTION_SUMMARY_EXPORT_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute(
          "download",
          "HOC-Transaction-Summary-View-Details-Report.xlsx"
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

// CO's own Transaction Summary report export —
// ServiceManager.ExportComplianceOfficerTransactionSummaryReportExcel (was
// throwing on every call, fixed 2026-08-06 — see
// API_Changes/2026-08-06_co_transaction_summary_exports.md). Distinct from
// the shared DownloadComplianceOfficerDateWiseTransactionReportRequestAPI
// above, which is a different report ("Date-Wise Transactions") used by
// several other pages — this one is CO Transaction Summary-specific.
export const ExportComplianceOfficerTransactionSummaryReportExcel = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_COMPLIANCE_OFFICER_TRANSACTION_SUMMARY_REPORT_EXCEL_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "CO-Transaction-Summary-Report.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};

// CO Transaction Summary "View Details" per-date drill-down export —
// ServiceManager.ExportComplianceOfficerViewTransactionSummaryReportExcel
// (brand new endpoint, CO-scoped mirror of GetHCAViewTransactionSummaryExportAPI
// above — same request/response shape, scoped server-side to the calling
// CO's own hierarchy). See
// API_Changes/2026-08-06_co_transaction_summary_exports.md.
export const ExportComplianceOfficerViewTransactionSummaryReportExcel = async ({
  callApi,
  showLoader,
  requestdata,
  navigate,
  setOpen,
}) => {
  try {
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_EXPORT_COMPLIANCE_OFFICER_VIEW_TRANSACTION_SUMMARY_REPORT_EXCEL_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_REPORT,
      requestData: requestdata,
      navigate,
      responseType: "arraybuffer", // ⚡ Required for file download
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // 🔹 Check Session Expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;
    // 🔹 When API send isExecuted false
    if (!res?.result?.isExecuted) {
      return false;
    }

    // 🔹 When API Send Success Response
    if (res.success) {
      try {
        // Create a blob and trigger download
        const blob = new Blob([res.result?.fileData || res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute(
          "download",
          "CO-Transaction-Summary-View-Details-Report.xlsx"
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setOpen(false);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    showLoader(false);
  }
};
