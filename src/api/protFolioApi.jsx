// ... keep your responseMessages, handleExpiredSession, getMessage here ...

import { getMessage, handleExpiredSession } from "./utils";

/**
 * 🔹 Search Employee Pending Uploaded Portfolio
 *
 * Fetches the list of pending uploaded portfolios for a specific employee.
 * Integrates with centralized response handling (`getMessage`, `handleExpiredSession`) and
 * displays notifications only when relevant.
 *
 * @async
 * @function SearchEmployeePendingUploadedPortFolio
 *
 * @param {Object} params - Function parameters.
 * @param {Function} params.callApi - Utility function to perform API requests.
 * @param {Function} params.showNotification - Function to display UI notifications.
 * @param {Function} params.showLoader - Function to toggle loader visibility.
 * @param {Object} params.requestdata - Request body payload for API.
 * @param {Function} params.navigate - React Router navigation function (used for logout/session expiry).
 *
 * @returns {Promise<{portfolios: Array}|null>}
 * - `{ portfolios: Array }` → if data is successfully retrieved (may be empty array if no data).
 * - `null` → if session expired, execution failed, or an error occurred.
 *
 * @example
 * const result = await SearchEmployeePendingUploadedPortFolio({
 *   callApi,
 *   showNotification,
 *   showLoader,
 *   requestdata: { employeeId: 123 },
 *   navigate
 * });
 *
 * if (result) {
 *   console.log("Portfolios:", result.portfolios);
 * }
 */
export const SearchEmployeePendingUploadedPortFolio = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("requestdata", requestdata);
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_EMPLOYEE_PENDING_UPLOADED_PORTFOLIO_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry (triggers logout if expired)
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
      const { responseMessage, pendingPortfolios, assetType, totalRecords } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchEmployeePendingUploadedPortFolio_01"
      ) {
        return {
          pendingPortfolios: pendingPortfolios || [],
          assetType: assetType || {},
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No Data Available (return empty list instead of null)
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchEmployeePendingUploadedPortFolio_02"
      ) {
        return {
          pendingPortfolios: [],
          assetType: {},
          totalRecords: 0,
        };
      }

      // Case 3 → Other messages (e.g., Exception, custom server messages)
      // Only show notification if message is NOT an empty string
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No pending uploaded portfolios found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure (res.success === false)
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
    // 🔹 Always stop loader (whether success/fail/exception)
    showLoader(false);
  }
};

// ADDED (API_Changes/2026-09-15_get_all_view_details_portfolio_by_
// tradeapprovalid.md): brand new endpoint - powers the "Comments" button
// on Employee > View Portfolio > Pending Approvals (Non-Compliant rows),
// which previously did nothing since nothing existed to call. Mirrors
// GetAllTransactionViewDetails (myTransactionsApi.jsx) field-for-field -
// the response shape was deliberately built to match it
// (approvalComments plural, rejectionComment singular, each entry
// {userID, name, comments}) so the same read/render pattern applies here.
export const GetAllViewDetailsPortfolioByTradeApprovalID = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ALL_VIEW_DETAILS_PORTFOLIO_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, details, workFlowStatus } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetAllViewDetailsPortfolioByTradeApprovalID_01"
      ) {
        return {
          details: details || [],
          workFlowStatus: workFlowStatus || {},
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetAllViewDetailsPortfolioByTradeApprovalID_02"
      ) {
        return { details: [], workFlowStatus: {} };
      }

      const message = getMessage(responseMessage);
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No details available for this Trade Approval ID.",
        });
      }
      return { details: [], workFlowStatus: {} };
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
      description: "An unexpected error occurred.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

export const UploadPortFolioRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setUploadPortfolioModal,
  setIsSubmit,
  navigate,
}) => {
  try {
    console.log("UploadPortfolio requestdata", requestdata);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env.VITE_UPLOAD_PORTFOLIO_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate API execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while uploading the portfolio.",
      });
      return null;
    }

    // 🔹 Handle successful execution
    if (res.success) {
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Success
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_UploadPortFolioRequest_01"
      ) {
        console.log("Its coming here ");
        setUploadPortfolioModal(false);
        setIsSubmit(true);
        return { success: true, message: message || "Portfolio uploaded." };
      }

      // Case 2 → Failure with custom server message
      if (message) {
        showNotification({
          type: "error",
          title: "Upload Failed",
          description: message,
        });

        return { success: false, message };
      }

      // Default → No specific message
      showNotification({
        type: "warning",
        title: "Upload Status Unknown",
        description: "The server did not return a recognizable response.",
      });

      return { success: false, message: "" };
    }

    // 🔹 Handle failure (res.success === false)
    showNotification({
      type: "error",
      title: "Upload Failed",
      description: getMessage(res.message),
    });

    return { success: false, message: getMessage(res.message) };
  } catch (error) {
    // 🔹 Unexpected exception
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred while uploading portfolio.",
    });
    return null;
  } finally {
    // 🔹 Always stop loader
    showLoader(false);
  }
};

export const SearchEmployeeApprovedUploadedPortFolio = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("🔹 Approved Portfolio requestdata:", requestdata);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_EMPLOYEE_APPROVED_UPLOADED_PORTFOLIO_REQUEST_METHOD, // ✅ update env var
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
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
      console.log("🔹 Approved Portfolio response:", res);
      const {
        responseMessage,
        instruments,
        aggregateTotalQuantity,
        totalInstrumentCount,
      } = res.result;
      const message = getMessage(responseMessage);

      // ✅ Case 1 → Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchEmployeeApprovedUploadedPortFolio_01" // TODO: confirm exact code
      ) {
        console.log("🔹 Approved portfolios found:", aggregateTotalQuantity);

        return {
          aggregateTotalQuantity: aggregateTotalQuantity,
          instruments: instruments || [],
          totalRecords: totalInstrumentCount || 0,
        };
      }

      // ✅ Case 2 → No Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchEmployeeApprovedUploadedPortFolio_02" // TODO: confirm exact code
      ) {
        return {
          instruments: [],
          totalRecords: 0,
        };
      }

      // ✅ Case 3 → Other server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No approved uploaded portfolios found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure (res.success === false)
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Unexpected exception handler
    console.error(
      "❌ Error in SearchEmployeeApprovedUploadedPortFolio:",
      error
    );
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
