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
export const SearchBrokersAdminRequest = async ({
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
      requestMethod: import.meta.env.VITE_GET_ADMIN_BROKERS_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_ADMIN,
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
          "Something went wrong while fetching employee transactions.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, brokers, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (responseMessage === "PAD_Admin_GetBrokers_01") {
        return {
          brokers: brokers || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Admin_GetBrokers_02") {
        return {
          brokers: [],
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

//AddBrokersRequest when user Add data in broker
export const AddBrokersRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setAddNewBrokerModal,
  setAddBrokerConfirmationModal,
  navigate,
}) => {
  try {
    // 🔹 API Call
    console.log("Check APi");

    const res = await callApi({
      requestMethod: import.meta.env.VITE_ADD_ADMIN_BROKERS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
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

      if (responseMessage === "PAD_Admin_AddBroker_02") {
        setAddNewBrokerModal(false);
        setAddBrokerConfirmationModal(true);

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

//Edit Broker Request Data when User Edit Any Broker
export const EditBrokersRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setEditBrokerModal,
  navigate,
}) => {
  try {
    // 🔹 API Call
    console.log("Check APi");

    const res = await callApi({
      requestMethod: import.meta.env.VITE_EDIT_ADMIN_BROKERS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
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

      if (responseMessage === "PAD_Admin_UpdateBroker_02") {
        setEditBrokerModal(false);

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

//Update Broker Request Data when User Toggle Any Broker
export const updateBrokersStatusRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    // 🔹 API Call
    console.log("Check APi");

    const res = await callApi({
      requestMethod: import.meta.env.VITE_UPDATE_BROKER_STATUS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
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

      if (responseMessage === "PAD_Admin_UpdateBrokerStatus_02") {
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

export const downloadBrokerReportRequest = async ({
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
      requestMethod: import.meta.env.VITE_ADMIN_BROKER_REPORT_REQUEST_METHOD,
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

        link.setAttribute("download", "Broker-Report.xlsx");
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

export const SearchGetInstrumentsWithClosingPeriod = async ({
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
        .VITE_ADMIN_GET_INSTRUMENTS_CLOSING_PERIOD_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_ADMIN,
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
          "Something went wrong while fetching employee transactions.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, instruments, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (responseMessage === "PAD_Admin_GetInstrumentsWithClosingPeriod_01") {
        return {
          instruments: instruments || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Admin_GetInstrumentsWithClosingPeriod_02") {
        return {
          instruments: [],
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

//Update Instrument Status   when User Toggle Any Instrument
export const UpdateInstrumentStatus = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    // 🔹 API Call
    console.log("Check APi");

    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_ADMIN_UPDATE_INSTRUMENT_STATUS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
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

      if (responseMessage === "PAD_Admin_UpdateInstrumentStatus_02") {
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

// check for group title uniq or not
export const CheckGroupTitleExists = async ({
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
        .VITE_ADMIN_CHECK_GROUP_TITLE_EXISTS_REQUEST_METHOD, // 🔑 must be defined in .env
      endpoint: import.meta.env.VITE_API_ADMIN,
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
          "Something went wrong while fetching employee transactions.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);
    console.log("isUnique",responseMessage)

      // Case 1 → Data available
      if (responseMessage === "PAD_Admin_CheckGroupTitleExists_01") {
        return false;
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Admin_CheckGroupTitleExists_02") {
        return true;
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
