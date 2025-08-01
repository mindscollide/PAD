// src/api/dashboardApi.js
import Cookies from "js-cookie";

// Response code messages
const responseMessages = {
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_01: "Data Available",
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_02: "No data available",
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_03: "Exception",
};

// Utility to extract message by code
const getMessage = (code) =>
  responseMessages[code] || "Something went wrong. Please try again.";

// API function
export const SearchTadeApprovals = async ({
  callApi,
  showNotification,
  showLoader,
  filters = {},
}) => {
  try {
    console.log("Fetching approvals...");

    const res = await callApi({
      requestMethod: import.meta.env.VITE_SEARCH_APPROVAL_DATA_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: {
        InstrumentName: filters.instrumentName || "",
        StartDate: filters.date || "",
        Quantity: filters.quantity || 0,
        StatusIds: filters.statusIds || [],
        TypeIds: filters.typeIds || [],
        PageNumber: filters.pageNumber || 1,
        Length: filters.length || 10,
      },
    });
    console.log("Fetching approvals...",res);

    if (!res?.result?.isExecuted) {
      showLoader(false);
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return [];
    }

    if (res.success && res.responseCode === 200) {
      const { responseMessage, myTradeApprovals } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchTradeApprovals_01"
      ) {
        showLoader(false);
        return myTradeApprovals || [];
      } else {
        showNotification({
          type: "warning",
          title: getMessage(responseMessage),
          description: "No data was returned from the server.",
        });
        showLoader;
        return [];
      }
    }

    if (res.expired) {
      showNotification({
        type: "error",
        title: "Session expired",
        description: "Please login again.",
      });
      showLoader(false);
    } else {
      showNotification({
        type: "error",
        title: "Fetch Failed",
        description: getMessage(res.message),
      });
    }
    showLoader(false);
    return [];
  } catch (error) {
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    showLoader(false);
    return [];
  }
};
