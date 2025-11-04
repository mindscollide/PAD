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
export const UpdateBrokersStatusRequest = async ({
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

export const DownloadBrokerReportRequest = async ({
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
        description: "Something went wrong while checking group title.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);
      console.log("isUnique", responseMessage);

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
      description: "An unexpected error occurred while checking group title.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// Search get all Policies For Group Policy Panel
export const SearchPoliciesForGroupPolicyPanel = async ({
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
        .VITE_ADMIN_SEARCH_GROUP_POLICIES_REQUEST_METHOD, // 🔑 must be defined in .env
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
        description: "Something went wrong while fetching Policies.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, policyCategories, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "Admin_AdminServiceManager_GetPoliciesForGroupPolicyPanel_01"
      ) {
        return {
          policyCategories: policyCategories || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "Admin_AdminServiceManager_GetPoliciesForGroupPolicyPanel_02"
      ) {
        return {
          policyCategories: [],
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

// Search get all Employees With Assigned Policies
export const SearchAllEmployeesWithAssignedPolicies = async ({
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
        .VITE_ADMIN_SEARCH_GET_ALL_EMPLOYESS_WITH_ASSIGNED_POLICIES_REQUEST_METHOD, // 🔑 must be defined in .env
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
          "Something went wrong while fetching employee with assign Policy.",
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
        "Admin_AdminServiceManager_GetAllEmployeesWithAssignedPolicies_01"
      ) {
        return {
          employees: employees || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "Admin_AdminServiceManager_GetAllEmployeesWithAssignedPolicies_02"
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
          description: "No employee List Found.",
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
        "An unexpected error occurred while fetching employee with assign Policy",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// Add GroupP olicy
export const AddGroupPolicy = async ({
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
        .VITE_ADMIN_ADD_GROUP_POLICIES_REQUEST_METHOD, // 🔑 must be defined in .env
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
        description: "Something went wrong while while creating Group Policy.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage === "PAD_GroupPolicyServiceManager_AddGroupPolicy_01"
      ) {
        return false;
      }

      // Case 2 → No data
      if (
        responseMessage === "PAD_GroupPolicyServiceManager_AddGroupPolicy_02"
      ) {
        return true;
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
      description: "An unexpected error occurred while creating Group Policy.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// Search get all Policies For Group Policy Panel
export const SearchGroupPoliciesList = async ({
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
        .VITE_ADMIN_SEARCH_GROUP_POLICIES_LIST_REQUEST_METHOD, // 🔑 must be defined in .env
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
        description: "Something went wrong while fetching Group Policies List.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, groupPolicies, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (responseMessage === "PAD_Admin_GetGroupPoliciesList_01") {
        return {
          groupPolicies: groupPolicies || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Admin_GetGroupPoliciesList_02") {
        return {
          groupPolicies: [],
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

// get all details of policies detils
export const ViewGroupPolicyDetails = async ({
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
        .VITE_ADMIN_VIEW_GROUP_POLICIES_DETAILS_REQUEST_METHOD, // 🔑 must be defined in .env
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
        description: "Something went wrong while fetching view Group Policies.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, groupPolicy, assignedUsers, policies } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage === "Admin_AdminServiceManager_GetGroupPolicyDetails_01"
      ) {
        let responceData = {
          groupPolicy: groupPolicy || [],
          assignedUsers: assignedUsers || [],
          policies: policies || [],
        };

        console.log("groupPolicies", responceData);
        return responceData;
      }

      // Case 2 → No data
      if (
        responseMessage === "Admin_AdminServiceManager_GetGroupPolicyDetails_02"
      ) {
        return [];
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
      description:
        "An unexpected error occurred  while fetching view Group and Policies..",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//UpdateGroupPolicy
export const UpdateGroupPolicy = async ({
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
        .VITE_ADMIN_UPDATE_GROUP_POLICY_REQUEST_METHOD, // 🔑 must be defined in .env
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
        description: "Something went wrong while while updating Group Policy.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage === "PAD_GroupPolicyServiceManager_UpdateGroupPolicy_01"
      ) {
        return false;
      }

      // Case 2 → No data
      if (
        responseMessage === "PAD_GroupPolicyServiceManager_UpdateGroupPolicy_02"
      ) {
        return true;
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
      description: "An unexpected error occurred while updating Group Policy.",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

// Search get all Policies For Group Policy Panel for view only
export const SearchPoliciesByGroupPolicyID = async ({
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
        .VITE_ADMIN_VIEW_SEARCH_GROUP_POLICY_BY_ID_REQUEST_METHOD, // 🔑 must be defined in .env
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
        description: "Something went wrong while fetching Policies.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, categories } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "Admin_AdminServiceManager_SearchPoliciesByGroupPolicyID_01"
      ) {
        return {
          policyCategories: categories || [],
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "Admin_AdminServiceManager_SearchPoliciesByGroupPolicyID_02"
      ) {
        return {
          policyCategories: [],
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

// Search get all Employees With Assigned Policies by id
export const SearchUsersByGroupPolicyID = async ({
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
        .VITE_ADMIN_SEARCH_GET_ALL_EMPLOYESS_WITH_ASSIGNED_POLICIES_BY_ID_REQUEST_METHOD, // 🔑 must be defined in .env
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
          "Something went wrong while fetching employee with assign Policy.",
      });
      return null;
    }

    // 🔹 Handle success
    if (res.success) {
      const { responseMessage, users, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (
        responseMessage ===
        "Admin_AdminServiceManager_SearchUsersByGroupPolicyID_01"
      ) {
        return {
          employees: users || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (
        responseMessage ===
        "Admin_AdminServiceManager_SearchUsersByGroupPolicyID_02"
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
          description: "No employee List Found.",
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
        "An unexpected error occurred while fetching employee with assign Policy",
    });
    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//AddInstrumentClosingPeriodRequest when user add instruemnt in closing period on upcoming in edit Modal
export const AddInstrumentClosingPeriodRequest = async ({
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
        .VITE_ADD_INSTRUMENT_CLOSING_PERIOD_REQEUST_METHOD, // <-- Add Trade Approval method
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

      if (responseMessage === "PAD_Admin_AddInstrumentClosingPeriod_02") {
        return true;
      } else {
        showNotification({
          type: "warning",
          title: getMessage(responseMessage),
        });
        return false;
      }
    }

    return false;
  } catch (error) {
    // ❌ Exception handling

    return false;
  } finally {
    showLoader(false);
  }
};

//GetUpcomingClosingPeriodsByInstrumentID when user click on edit modal
export const GetUpcomingClosingPeriodInstrumentRequest = async ({
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
        .VITE_GET_UPCOMING_CLOSING_PERIODS_BY_INSTRUMENT_REQUEST_METHOD, // 🔑 must be defined in .env
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
      const { responseMessage, closingPeriods, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (responseMessage === "PAD_Admin_GetUpcomingClosingPeriods_01") {
        return {
          closingPeriods: closingPeriods || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Admin_GetUpcomingClosingPeriods_02") {
        return {
          closingPeriods: closingPeriods || [],
          totalRecords: totalRecords || 0,
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

    return null;
  } catch (error) {
    // 🔹 Exception handling

    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//GetPreviousClosingPeriodsByInstrumentID when user click on edit modal
export const GetPreviousClosingPeriodInstrumentRequest = async ({
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
        .VITE_GET_PREVIOUS_CLOSING_PERIODS_BY_INSTRUMENT_REQUEST_METHOD, // 🔑 must be defined in .env
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
      const { responseMessage, closingPeriods, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data available
      if (responseMessage === "PAD_Admin_GetPreviousClosingPeriods_01") {
        return {
          closingPeriods: closingPeriods || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Admin_GetPreviousClosingPeriods_02") {
        return {
          closingPeriods: closingPeriods || [],
          totalRecords: totalRecords || 0,
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

    return null;
  } catch (error) {
    // 🔹 Exception handling

    return null;
  } finally {
    // 🔹 Always hide loader
    showLoader(false);
  }
};

//DeleteInstrumentClosingPeriod when user click on DELETE
export const DeleteUpcomingInstrumentCosingPeriodRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setDeleteConfirmationEditModal,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_DELETE_INSTRUMENT_CLOSING_PERIOD_REQUEST_METHOD, // <-- Delete Upcoming Closing Period
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

      if (responseMessage === "PAD_Admin_DeleteInstrumentClosingPeriod_02") {
        setDeleteConfirmationEditModal(false);
        return true;
      } else {
        showNotification({
          type: "warning",
          title: getMessage(responseMessage),
        });
        return false;
      }
    }

    return false;
  } catch (error) {
    // ❌ Exception handling

    return false;
  } finally {
    showLoader(false);
  }
};

// GetPendingUserRegistrationRequests
export const SearchPendingUserRegistrationRequests = async ({
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
        .VITE_GET_PENDING_USER_REGISTRATION_REQUESTS_REQUEST_METHOD, // ✅ update env var
      endpoint: import.meta.env.VITE_API_ADMIN,
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
      const { responseMessage, pendingRequests, totalRecords } = res.result;
      const message = getMessage(responseMessage);

      // ✅ Case 1 → Data Available
      if (
        responseMessage ===
        "Admin_AdminServiceManager_GetPendingUserRegistrationRequests_01" // TODO: confirm exact code
      ) {
        return {
          pendingRequests: pendingRequests || [],
          totalRecords: totalRecords || 0,
        };
      }

      // ✅ Case 2 → No Data Available
      if (
        responseMessage ===
        "Admin_AdminServiceManager_GetPendingUserRegistrationRequests_02" // TODO: confirm exact code
      ) {
        return {
          pendingRequests: [],
          totalRecords: 0,
        };
      }

      // ✅ Case 3 → Other server messages
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No Data found.",
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
    console.error("❌ Error in GetPendingUserRegistrationRequests:", error);
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

// 🔹 Process User Registration Request
export const ProcessUserRegistrationRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("Approved:", requestdata);

    // Start Loader
    showLoader(true);

    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_PROCESS_USER_REGISTRATION_REQUEST_METHOD, // e.g. "ServiceManager.ProcessUserRegistrationRequest"
      endpoint: import.meta.env.VITE_API_ADMIN, // e.g. http://192.168.18.241:14003/Admin
      requestData: requestdata,
      navigate,
    });

    console.log("📥 ProcessUserRegistrationRequest Response:", res);

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return false;

    // 🔹 Validate response
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Failed",
        description: "Unable to process user registration request.",
      });
      return false;
    }

    // 🔹 Success Case
    if (
      res.result.responseMessage ===
      "Admin_AdminServiceManager_UserRegistration_ProcessRequest_02"
    ) {
      return true;
    }

    // 🔹 Other Message Case
    showNotification({
      type: "warning",
      title: "Notice",
      description:
        "The request was processed but returned an unexpected message.",
    });
    return false;
  } catch (error) {
    console.error("❌ Error in ProcessUserRegistrationRequest:", error);
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred while processing the request.",
    });
    return false;
  } finally {
    showLoader(false);
  }
};
