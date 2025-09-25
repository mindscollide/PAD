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
