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
  showLoader,
  requestdata,
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
  } finally {
    showLoader(false);
  }
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
    console.log("Check APi");
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
      if (responseMessage === "PAD_Trade_GetComplianceOfficerMyActionsWorkflowDetail_01") {
        return {
          requests: requests || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Trade_GetComplianceOfficerMyActionsWorkflowDetail_02") {
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
    console.log("reasonsArray", res);

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
    console.log("reasonsArray", res);

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
    console.log("reasonsArray", res);

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
  showLoader,
  requestdata,
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

//Download My Trade Approval From the Employee report dashboard
export const DownloadMyTradeApprovalReportRequestAPI = async ({
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
