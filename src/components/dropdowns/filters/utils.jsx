// -----------------------------------------------------------------------------
// 📌 Imports
// -----------------------------------------------------------------------------
import {
  SearchApprovalRequestLineManager,
  SearchEmployeeHistoryDetailRequest,
  SearchTadeApprovals,
} from "../../../api/myApprovalApi";
import { SearchEmployeeTransactionsDetails } from "../../../api/myTransactionsApi";
import { toYYMMDD } from "../../../common/funtions/rejex";

// -----------------------------------------------------------------------------
// 📌 Constants
// -----------------------------------------------------------------------------

const DEBUG = false; // toggle debug logs

/**
 * Status options for Employee My Approval (Trade Approvals).
 */
export const emaStatusOptions = [
  "Pending",
  "Approved",
  "Declined",
  "Traded",
  "Not Traded",
  "Resubmitted",
];

/**
 * Status options for Employee My Approval (Line Manager Approvals).
 */
export const emtStatusOptions = ["Pending", "Compliant", "Non-Compliant"];
export const escalated = ["Pending"];
export const adminBrokersStatus = ["Active", "In Active"];

/**
 * Status options for pending approvals (Line Manager).
 */
export const emtStatusOptionsForPendingApproval = ["Pending", "Non-Compliant"];

export const emaStatusOptionsofReportsMyTradeApprovals = [
  "Pending",
  "Approved",
  "Declined",
  "Transaction Conducted",
  "Not Traded",
  "Resubmitted for Approval",
];

export const emaStatusOptionsofReportsMyHistory = [
  "Pending",
  "Approved",
  "Declined",
  "Transaction Conducted",
  "Not Traded",
  "Resubmitted for Approval",
  "Compliant",
  "Non-Compliant",
];
// -----------------------------------------------------------------------------
// 📌 Utility: Extract Type Options from AddApprovalRequestData
// -----------------------------------------------------------------------------

/**
 * Extracts "Type" options from assetTypeListingData for dropdowns.
 *
 * @param {Object} assetTypeListingData - Data containing asset type information.
 * @returns {Array<{label: string, value: number, assetTypeID: number}>}
 */
export const getTypeOptions = (assetTypeListingData) => {
  if (!assetTypeListingData || typeof assetTypeListingData !== "object")
    return [];

  const assetKey = Object.keys(assetTypeListingData)[0]; // e.g., "Equities"
  const assetData = assetTypeListingData[assetKey];

  if (!Array.isArray(assetData?.items)) return [];

  return assetData.items.map((item) => ({
    label: item.type,
    value: item.tradeApprovalTypeID,
    assetTypeID: item.assetTypeID,
  }));
};

// -----------------------------------------------------------------------------
// 📌 Utility: Map Buy/Sell Labels to TradeApprovalTypeIDs
// -----------------------------------------------------------------------------

/**
 * Maps selected type labels to their corresponding tradeApprovalTypeIDs.
 *
 * @param {string[]} selectedLabels - Labels selected by the user.
 * @param {Object} options - Asset options containing items.
 * @returns {number[]} Array of tradeApprovalTypeIDs.
 */
export const mapBuySellToIds = (selectedLabels = [], options = {}) => {
  console.log("mapBuySellToIds", selectedLabels);
  console.log("mapBuySellToIds", options);
  const items = Array.isArray(options.items) ? options.items : [];
  if (!selectedLabels.length || !items.length) return [];
  console.log("mapBuySellToIds", items);
  return selectedLabels
    .map((label) => {
      const match = items.find((item) => item.type === label);
      return match ? match.tradeApprovalTypeID : null;
    })
    .filter(Boolean);
};

// -----------------------------------------------------------------------------
// 📌 Utility: Map Status Labels to IDs
// -----------------------------------------------------------------------------

/**
 * Maps Employee My Approval statuses to their corresponding IDs.
 *
 * @param {string[]} arr - Status strings.
 * @returns {number[]} Status IDs.
 */
export const mapStatusToIds = (arr, type = 1) => {
  if (!arr?.length) return [];

  const statusMapWorkflow = {
    Pending: 1,
    Resubmitted: 2,
    Approved: 3,
    Declined: 4,
    Traded: 5,
    "Not Traded": 6,
    Compliant: 8,
    "Non-Compliant": 9,
  };

  const statusMapBundel = {
    Pending: 1,
    Approved: 2,
    Declined: 3,
    Upcoming: 4,
  };

  const statusMapWorkflowAdmin = {
    Active: 1,
    "In Active": 2,
  };
  const statusMap =
    type === 1
      ? statusMapBundel
      : type === 3
      ? statusMapWorkflowAdmin
      : statusMapWorkflow;

  return arr
    .map((status) => statusMap[status] ?? null)
    .filter((id) => id !== null);
};

// -----------------------------------------------------------------------------
// 📌 Utility: Build Common Request Data
// -----------------------------------------------------------------------------

/**
 * Builds a request object for trade or line manager approvals.
 *
 * @param {Object} params - Input parameters.
 * @param {Object} params.state - UI state (filters, pagination, etc.).
 * @param {number[]} params.statusIds - Status IDs.
 * @param {number[]} params.typeIds - Type IDs.
 * @param {boolean} [params.includeRequester=false] - Include RequesterName if true.
 * @returns {Object} API request payload.
 */
export const buildApprovalRequestData = ({
  state,
  statusIds = [],
  typeIds = [],
  includeRequester = false,
}) => {
  const {
    instrumentName = "",
    mainInstrumentName = "",
    startDate,
    quantity = 0,
    requesterName = "",
  } = state;

  return {
    InstrumentName: instrumentName || mainInstrumentName || "",
    Date: toYYMMDD(startDate) || "",
    Quantity: quantity,
    StatusIds: statusIds,
    TypeIds: typeIds,
    PageNumber: 0,
    Length: 10,
    ...(includeRequester && { RequesterName: requesterName }),
  };
};

/**
 * Builds a request object for Employee Transaction details.
 *
 * @param {Object} params - Input parameters.
 * @param {Object} params.state - UI state (filters, pagination, etc.).
 * @param {number[]} params.statusIds - Status IDs.
 * @param {number[]} params.typeIds - Type IDs.
 * @returns {Object} API request payload.
 */
const buildTransactionRequestData = ({ state, statusIds, typeIds }) => {
  const startDate = state.startDate ? toYYMMDD(state.startDate) : "";
  const endDate = state.endDate ? toYYMMDD(state.endDate) : "";

  return {
    InstrumentName: state.instrumentName || state.mainInstrumentName || "",
    Quantity: state.quantity || 0,
    StartDate: startDate,
    EndDate: endDate,
    BrokerIDs: state.brokerIds || [], // ✅ added dynamic support
    StatusIds: statusIds || [],
    TypeIds: typeIds || [],
    PageNumber: 0,
    Length: state.pageSize || 10,
  };
};

/**
 * Builds a request object for Employee History details.
 *
 * @param {Object} params - Input parameters.
 * @param {Object} params.state - UI state (filters, pagination, etc.).
 * @param {number[]} params.statusIds - Status IDs.
 * @param {number[]} params.typeIds - Type IDs.
 * @returns {Object} API request payload.
 */
const buildMyHistoryRequestData = ({ state, statusIds, typeIds }) => {
  const startDate = state.startDate ? toYYMMDD(state.startDate) : "";
  const endDate = state.endDate ? toYYMMDD(state.endDate) : "";

  return {
    RequestID: state.requestID || "",
    InstrumentName: state.instrumentName || state.mainInstrumentName || "",
    Quantity: state.quantity || 0,
    StartDate: startDate,
    EndDate: endDate,
    Nature: state.nature || "", // ✅ added dynamic support
    StatusIDs: statusIds || [],
    TradeApprovalTypeIDs: typeIds || [],
    PageNumber: 0,
    Length: state.pageSize || 10,
  };
};

/**
 * Executes an API call based on selected tab (key) and status filter.
 *
 * @param {Object} params - Parameters.
 * @param {string} params.selectedKey - Selected tab key ("1", "2", "3", "6").
 * @param {string[]} params.newdata - Selected status values.
 * @param {Object} params.state - Current state (filters, pagination, etc.).
 * @param {Object} params.assetTypeListingData - Asset type data.
 * @param {Function} params.callApi - API caller.
 * @param {Function} params.showNotification - Notification handler.
 * @param {Function} params.showLoader - Loader toggle function.
 * @param {Function} params.navigate - Navigation function.
 * @param {Function} params.setIsEmployeeMyApproval - Setter for Employee approvals.
 * @param {Function} params.setLineManagerApproval - Setter for Line Manager approvals.
 * @param {Function} params.setEmployeeTransactionsData - Setter for Employee transactions.
 */
export const apiCallStatus = async ({
  selectedKey,
  newdata,
  state,
  assetTypeListingData,
  callApi,
  showNotification,
  showLoader,
  navigate,
  setIsEmployeeMyApproval,
  setEmployeeTransactionsData,
  setLineManagerApproval,
}) => {
  const typeIds = mapBuySellToIds(state.type, assetTypeListingData?.Equities);

  let statusIds, requestdata, data;

  switch (selectedKey) {
    case "2":
      {
        // Employee Transactions
        // ✅ Only allow specific statuses for case "2"
        const allowedStatusesForTransactions = [
          "Pending",
          "Compliant",
          "Non-Compliant",
        ];
        const filteredStatuses = newdata.filter((s) =>
          allowedStatusesForTransactions.includes(s)
        );
        statusIds = mapStatusToIds(filteredStatuses);

        requestdata = buildTransactionRequestData({
          state,
          statusIds,
          typeIds,
        });
        showLoader(true);
        data = await SearchEmployeeTransactionsDetails({
          callApi,
          showNotification,
          showLoader,
          requestdata,
          navigate,
        });
        setEmployeeTransactionsData(data);
      }
      break;

    case "3":
      break;

    default:
      break;
  }

  if (DEBUG) console.log({ selectedKey, requestdata, data });
};
