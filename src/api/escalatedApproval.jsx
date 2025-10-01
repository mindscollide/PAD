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
 * @function SearchEscalatedApprovalsRequestMethod
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
 * const result = await SearchEscalatedApprovalsRequestMethod({
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
export const SearchEscalatedApprovalsRequestMethod = async ({
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
        .VITE_SEARCH_HTA_ESCALATED_APPROVALS_REQUEST_METHOD,
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
      console.log("requestdata", res);
      const { responseMessage, htaEscalatedApprovals, totalRecords } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHTAEscalatedApprovalsRequest_01"
      ) {
        console.log("requestdata", htaEscalatedApprovals);

        return {
          htaEscalatedApprovals: htaEscalatedApprovals || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No Data Available (return empty list instead of null)
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHTAEscalatedApprovalsRequest_02"
      ) {
        return {
          htaEscalatedApprovals: [],
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

//GET ESCALATED APPROVALS REQUEST VIEW DATA HEAD OF APPROVAL (HTA) API START HERE
export const GetHeadOfApprovalViewDetailRequest = async ({
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
        .VITE_GET_HTA_VIEW_DETAIL_ESCALATED_APPROVAL_REQUEST_METHOD,
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
        details,
        requesterName,
        workFlowStatus,
        assetTypes,
        hierarchyDetails,
        escalations,
      } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetHTAViewDetailsByTradeApprovalID_01"
      ) {
        console.log("Check APi");
        return {
          details: details || [],
          requesterName: requesterName || "",
          workFlowStatus: workFlowStatus || {},
          assetTypes: assetTypes || [],
          hierarchyDetails: hierarchyDetails || [],
          escalations: escalations || [],
        };
      }

      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
        description: "No data available.",
      });
      return {
        details: [],
        requesterName: "",
        workFlowStatus: {},
        assetTypes: [],
        hierarchyDetails: [],
        escalations: [],
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
