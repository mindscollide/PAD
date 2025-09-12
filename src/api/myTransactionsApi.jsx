// ... keep your responseMessages, handleExpiredSession, getMessage here ...

import { getMessage, handleExpiredSession } from "./utils";

/**
 * 🔹 Search Employee Transactions Details
 *
 * Fetches detailed transactions for a specific employee.
 * Uses centralized session handling (`handleExpiredSession`) and
 * notification handling (`getMessage`) for consistent user feedback.
 *
 * @async
 * @function SearchEmployeeTransactionsDetails
 *
 * @param {Object} params - Function parameters.
 * @param {Function} params.callApi - Utility function to perform API requests.
 * @param {Function} params.showNotification - Function to display UI notifications.
 * @param {Function} params.showLoader - Function to toggle loader visibility.
 * @param {Object} params.requestdata - Request body payload for API.
 * @param {Function} params.navigate - React Router navigation function (used for logout/session expiry).
 *
 * @returns {Promise<{transactions: Array, totalRecords: number}|null>}
 * - `{ transactions: Array, totalRecords: number }` → if data retrieved successfully.
 * - `null` → if session expired, execution failed, or an error occurred.
 *
 * @example
 * const result = await SearchEmployeeTransactionsDetails({
 *   callApi,
 *   showNotification,
 *   showLoader,
 *   requestdata: { employeeId: 123, pageNumber: 1, length: 10 },
 *   navigate
 * });
 *
 * if (result) {
 *   console.log("Transactions:", result.transactions);
 * }
 */
export const SearchEmployeeTransactionsDetails = async ({
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
        .VITE_SEARCH_EMPLOYEE_TRANSACTIONS_DETAILS_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching employee transactions.",
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
        "PAD_Trade_TradeServiceManager_SearchEmployeeTransactions_01"
      ) {
        return {
          transactions: transactions || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchEmployeeTransactions_02"
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
          description: "No transactions found for this employee.",
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
      description: "An unexpected error occurred while fetching transactions.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};
