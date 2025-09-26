import { getMessage, handleExpiredSession } from "./utils";

// 🔹 SearchComplianceOfficerReconcileTransactionRequest
export const SearchComplianceOfficerReconcileTransactionRequest = async ({
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
        .VITE_SEARCH_COMPLIANCE_OFFICER_RECONCILE_TRANSACTIONS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
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
      const { responseMessage, complianceOfficerApprovals, totalRecords } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcileTransactionRequest_01"
      ) {
        return {
          transactions: complianceOfficerApprovals || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcileTransactionRequest_02"
      ) {
        return {
          transactions: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Other messages (warnings, exceptions)
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reconcile transactions found.",
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

// 🔹 SearchComplianceOfficerReconcilePortfolioRequest
export const SearchComplianceOfficerReconcilePortfolioRequest = async ({
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
        .VITE_SEARCH_COMPLIANCE_OFFICER_RECONCILE_PORTFOLIO_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
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
      const {
        responseMessage,
        complianceOfficerApprovalsPortfolio,
        totalRecords,
      } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcilePortfolioRequest_01"
      ) {
        return {
          portfolios: complianceOfficerApprovalsPortfolio || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcilePortfolioRequest_02"
      ) {
        return {
          portfolios: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Other messages (warnings, exceptions)
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reconcile portfolios found.",
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

//Get All View Details By rECONCILE pORTFOLIO tRANSACTION Trade Approval ID
export const GetAllReconcilePortfolioTransactionRequest = async ({
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
        .VITE_GET_COMPLIANCE_OFFICER_RECONCILE_PORTFOLIO_REQUEST_METHOD,
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
      const {
        responseMessage,
        details,
        assetTypes,
        requesterName,
        hierarchyDetails,
      } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetComplianceOfficerViewDetailsByTradeApprovalID_01"
      ) {
        console.log("Check APi");
        return {
          details: details || [],
          requesterName: requesterName || "",
          assetTypes: assetTypes || [],
          hierarchyDetails: hierarchyDetails || [],
        };
      }

      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
        description: "No details available for this Trade Approval ID.",
      });
      return {
        details: [],
        requesterName: "",
        assetTypes: [],
        hierarchyDetails: [],
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

//UPDATE Compliance REQUEST STATUS API START HERE
export const UpdatedComplianceOfficerTransactionRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setNoteGlobalModal,
  setCompliantApproveModal,
  setNonCompliantDeclineModal,
  submitText,
  setValue,
  navigate,
}) => {
  try {
    // 🔹 Call the API
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_UPDATE_COMPLIANCE_OFFICER_TRANSACTION_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
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
        "PAD_Trade_TradeServiceManager_UpdateTransactionRequestStatus_01"
      ) {
        setNoteGlobalModal({ visible: false, action: null });
        if (submitText === "Compliant") {
          setCompliantApproveModal(true);
          setValue("");
        } else {
          setNonCompliantDeclineModal(true);
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
