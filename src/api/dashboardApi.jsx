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
  setAssetTypeListingData,
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
          await setEmployeeBasedBrokersData(brokers);
        }
        if (instrument) {
          await setAllInstrumentsData(instrument);
        }
        if (addApprovalRequest) {
          await setAssetTypeListingData(addApprovalRequest);
        }
        if (getPredefineReason) {
          await setGetAllPredefineReasonData(getPredefineReason);
        }
        if (webNotificationRequest) {
          await setWebNotificationData(webNotificationRequest);
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
export const GetAllBrokers = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env.VITE_ALL_BROKERS_DATA_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: {},
      navigate,
    });

    // Handle session expiration
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
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching all Employees data. Please try again .",
      });
      return [];
    }

    const { success, result } = res;
    const { responseMessage, brokers } = result;

    if (success) {
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetActiveBrokersByEmployeeAPI_01"
      ) {
        return brokers;
      } else if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetActiveBrokersByEmployeeAPI_02"
      ) {
        return [];
      }
      return [];
    }

    showNotification({
      type: "error",
      title: "Request Failed",
      description: getMessage(res.message),
    });
    return [];
  } catch (error) {
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching all Employees data.",
    });
    return [];
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
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching  all Instrument data. Please try again .",
      });
      return null;
    }

    const { success, result } = res;
    const { responseMessage, instruments } = result;

    if (success) {
      if (
        responseMessage === "PAD_Trade_TradeServiceManager_GetAllInstruments_01"
      ) {
        return instruments;
      } else if (
        responseMessage === "PAD_Trade_TradeServiceManager_GetAllInstruments_02"
      ) {
        return [];
      }
      return [];
    }

    showNotification({
      type: "error",
      title: "Request Failed",
      description: getMessage(res.message),
    });
    return [];
  } catch (error) {
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching  all Instrument data.",
    });
    return [];
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
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching all Trade approval. Please try again .",
      });
      return [];
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

      return [];
    }

    showErrorNotification(
      showNotification,
      "Fetch Failed",
      getMessage(res.message)
    );
    return [];
  } catch (error) {
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching all Trade approval.",
    });
    return [];
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
      showNotification({
        type: "error",
        title: "Error",
        description:
          "Something went wrong while fetching all predefine reasons. Please try again .",
      });
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
      } else if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetAllPredefinedReasons_02"
      ) {
        return [];
      }

      return [];
    }

    showErrorNotification(
      showNotification,
      "Fetch Failed",
      getMessage(res.message)
    );
    return [];
  } catch (error) {
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while fetching all predefine reasons.",
    });
    return [];
  }
};

/**
 * ✅ Fetches all employee-based broker data
 */
export const SaveUserBrokers = async ({
  callApi,
  showNotification,
  showLoader,
  requestData,
  setShowSaveBrokerModal,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SAVE_USER_BROKERS_REQUEST_API_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestData,
      navigate,
    });

    // Handle session expiration
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while Saving employee base brokers.",
      });
      return null;
    }

    const { success, result } = res;
    const { responseMessage } = result;
    const message = getMessage(responseMessage);
    if (success) {
      if (
        responseMessage === "PAD_Trade_TradeServiceManager_SaveUserBrokers_02"
      ) {
        setShowSaveBrokerModal(true);
        return true;
      }

      return false;
    }

    if (message) {
      showNotification({
        type: "warning",
        title: message,
        description: "No brokers saving employee.",
      });
    }
    return null;
  } catch (error) {
    showNotification({
      type: "error",
      title: "Error",
      description:
        "An unexpected error occurred while Saving employee base brokers.",
    });
    return null;
  }
};
