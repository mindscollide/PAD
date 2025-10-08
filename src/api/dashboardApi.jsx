import { GetUserWebNotificationRequest } from "./notification";
import { getMessage, handleExpiredSession } from "./utils";

/**
 * 🔹 Unified error display
 */
const showErrorNotification = (
  showNotification,
  title = "Error",
  description = "An unexpected error occurred."
) => {
  showNotification({
    type: "error",
    title,
    description,
  });
};

/**
 * 🔹 Unified warning display
 */
const showWarningNotification = (showNotification, responseMessage) => {
  showNotification({
    type: "warning",
    title: getMessage(responseMessage),
    description: "No data was returned from the server.",
  });
};

/**
 * ✅ Fetches dashboard stats and brokers if successful
 */
export const GetUserDashBoardStats = async ({
  callApi,
  setEmployeeBasedBrokersData,
  setAllInstrumentsData,
  setAddApprovalRequestData,
  setGetAllPredefineReasonData,
  setWebNotificationData,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env.VITE_DASHBOARD_DATA_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: {},
      navigate,
    });

    // 🔸 Handle expired session
    if (handleExpiredSession(res, navigate, showLoader)) return null;
    // 🔸 Handle failed execution
    if (!res?.result?.isExecuted) {
      showErrorNotification(showNotification);
      return null;
    }

    const { success, result } = res;
    const { responseMessage, userDashBoardStats } = result;

    if (success) {
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetUserDashBoardStats_01"
      ) {
        const brokers = await GetAllEmployeeBrokers({
          callApi,
          showNotification,
          showLoader,
          navigate,
        });
        const instrument = await GetAllInstruments({
          callApi,
          showNotification,
          showLoader,
          navigate,
        });
        const addApprovalRequest = await GetAllTradeApproval({
          callApi,
          showNotification,
          showLoader,
          navigate,
        });

        const getPredefineReason = await GetAllPredefineReassonApi({
          callApi,
          showNotification,
          showLoader,
          navigate,
        });

        //For Web Notification Api response
        const requestdata = { sRow: 0, eRow: 10 }; // Initial fetch data from API
        const webNotificationRequest = await GetUserWebNotificationRequest({
          callApi,
          showNotification,
          showLoader,
          requestdata,
          navigate,
        });

        if (brokers) {
          setEmployeeBasedBrokersData(brokers);
        }
        if (instrument) {
          setAllInstrumentsData(instrument);
        }
        if (addApprovalRequest) {
          setAddApprovalRequestData(addApprovalRequest);
        }
        if (getPredefineReason) {
          setGetAllPredefineReasonData(getPredefineReason);
        }
        if (webNotificationRequest) {
          setWebNotificationData(webNotificationRequest);
        }

        return userDashBoardStats;
      }

      // 🔸 Handle known response but no data
      showWarningNotification(showNotification, responseMessage);
      return null;
    }

    // 🔸 Fallback error
    showErrorNotification(
      showNotification,
      "Fetch Failed",
      getMessage(res.message)
    );
    return null;
  } catch (error) {
    showErrorNotification(showNotification);
    return null;
  } finally {
    showLoader(false);
  }
};

/**
 * ✅ Fetches all employee-based broker data
 */
export const GetAllEmployeeBrokers = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_ALL_EMPLOYEE_BASED_BROKERS_DATA_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: {},
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showErrorNotification(showNotification);
      return null;
    }

    const { success, result } = res;
    const { responseMessage, employeeBrokers } = result;

    if (success) {
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetAllEmployeeBrokers_01"
      ) {
        return employeeBrokers;
      }

      showWarningNotification(showNotification, responseMessage);
      return null;
    }

    showErrorNotification(
      showNotification,
      "Fetch Failed",
      getMessage(res.message)
    );
    return null;
  } catch (error) {
    showErrorNotification(showNotification);
    return null;
  }
};

/**
 * ✅ Fetches all Instruments data
 */
export const GetAllInstruments = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env.VITE_ALL_INSTRUMENTS_DATA_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: {},
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showErrorNotification(showNotification);
      return null;
    }

    const { success, result } = res;
    const { responseMessage, instruments } = result;

    if (success) {
      if (
        responseMessage === "PAD_Trade_TradeServiceManager_GetAllInstruments_01"
      ) {
        return instruments;
      }

      showWarningNotification(showNotification, responseMessage);
      return null;
    }

    showErrorNotification(
      showNotification,
      "Fetch Failed",
      getMessage(res.message)
    );
    return null;
  } catch (error) {
    showErrorNotification(showNotification);
    return null;
  }
};

/**
 * ✅ Fetches Get All Trade Approval data
 */

export const GetAllTradeApproval = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ALL_TRADE_APPROVAL_TYPES_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: {},
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showErrorNotification(showNotification);
      return null;
    }

    const { success, result } = res;
    const { responseMessage, tradeApprovalTypeGrouped } = result;

    if (success) {
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetAllTradeApprovalTypes_01"
      ) {
        return tradeApprovalTypeGrouped;
      }

      showWarningNotification(showNotification, responseMessage);
      return null;
    }

    showErrorNotification(
      showNotification,
      "Fetch Failed",
      getMessage(res.message)
    );
    return null;
  } catch (error) {
    showErrorNotification(showNotification);
    return null;
  }
};

/**
 * ✅ Fetches Get All Predefine Reason data
 */

export const GetAllPredefineReassonApi = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_ALL_PREDEFINE_REASON_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: {},
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showErrorNotification(showNotification);
      return null;
    }

    const { success, result } = res;
    const { responseMessage, reasons } = result;

    if (success) {
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetAllPredefinedReasons_01"
      ) {
        return reasons;
      }

      showWarningNotification(showNotification, responseMessage);
      return null;
    }

    showErrorNotification(
      showNotification,
      "Fetch Failed",
      getMessage(res.message)
    );
    return null;
  } catch (error) {
    showErrorNotification(showNotification);
    return null;
  }
};
