import {
  SearchApprovalRequestLineManager,
  SearchTadeApprovals,
} from "../../../api/myApprovalApi";

// these are status options for employee my approval page
export const emaStatusOptions = [
  "Pending",
  "Approved",
  "Declined",
  "Traded",
  "Not Traded",
  "Resubmitted",
];
// these are status options for employee my approval page
export const emtStatusOptions = ["Pending", "Compliant", "Non-Compliant"];
export const emtStatusOptionsForPendingApproval = ["Pending", "Non-Compliant"];

export const getTypeOptions = (addApprovalRequestData) => {
  if (!addApprovalRequestData || typeof addApprovalRequestData !== "object")
    return [];

  const assetKey = Object.keys(addApprovalRequestData)[0]; // e.g., "Equities"
  const assetData = addApprovalRequestData[assetKey];

  if (!Array.isArray(assetData?.items)) return [];

  return assetData.items.map((item) => ({
    label: item.type,
    value: item.tradeApprovalTypeID,
    assetTypeID: item.assetTypeID,
  }));
};

export const mapBuySellToIds = (selectedLabels = [], options = {}) => {
  console.log("mapBuySellToIds - selectedLabels:", selectedLabels);
  console.log("mapBuySellToIds - options:", options);

  const items = Array.isArray(options.items) ? options.items : [];

  if (selectedLabels.length === 0 || items.length === 0) return [];

  return selectedLabels
    .map((label) => {
      const match = items.find((item) => item.type === label);
      return match ? match.tradeApprovalTypeID : null;
    })
    .filter((id) => id !== null);
};

export const mapStatusToIds = (arr) => {
  if (!arr || arr.length === 0) return [];
  return arr
    .map((status) => {
      switch (status) {
        case "Pending":
          return 1;
        case "Resubmitted":
          return 2;
        case "Approved":
          return 3;
        case "Declined":
          return 4;
        case "Not Traded":
          return 6;
        case "Traded":
          return 5;
        default:
          return null; // ignore unknown statuses
      }
    })
    .filter(Boolean); // filters out nulls
};

// For Line Manager Statuses which is Compliant, Non-Compliant and Pending
export const mapStatusToIdsForLineManager = (arr) => {
  if (!arr || arr.length === 0) return [];
  return arr
    .map((status) => {
      switch (status) {
        case "Pending":
          return 1;
        case "Compliant":
          return 2;
        case "Non-Compliant":
          return 3;
        default:
          return null; // ignore unknown statuses
      }
    })
    .filter(Boolean); // filters out nulls
};

export const apiCallType = async ({
  selectedKey,
  newdata,
  addApprovalRequestData,
  state,
  callApi,
  showNotification,
  showLoader,
  navigate,
  setIsEmployeeMyApproval,
  setLineManagerApproval,
}) => {
  switch (selectedKey) {
    case "1": {
      const assetType = state.assetType || "Equities"; // fallback
      const TypeIds = mapBuySellToIds(
        newdata,
        addApprovalRequestData?.[assetType]
      );
      const statusIds = mapStatusToIds(state.status);
      const requestdata = {
        InstrumentName: state.instrumentName || state.mainInstrumentName,
        Date: state.startDate || "",
        Quantity: state.quantity || 0,
        StatusIds: statusIds || [],
        TypeIds: TypeIds || [],
        PageNumber: 0,
        Length: state.pageSize || 10,
      };
      showLoader(true);
      console.log("Checker APi Search");
      const data = await SearchTadeApprovals({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        navigate,
      });
      setIsEmployeeMyApproval(data);
      break;
    }

    case "2":
    case "3":

    case "6": {
      const assetType = state.assetType || "Equities"; // fallback
      const TypeIds = mapBuySellToIds(
        newdata,
        addApprovalRequestData?.[assetType]
      );
      const statusIds = mapStatusToIds(state.status);
      const requestdata = {
        InstrumentName: state.instrumentName || state.mainInstrumentName,
        Date: state.startDate || "",
        Quantity: state.quantity || 0,
        StatusIds: statusIds || [],
        TypeIds: TypeIds || [],
        PageNumber: 0,
        Length: state.pageSize || 10,
        RequesterName: state.requesterName,
      };
      showLoader(true);
      console.log("Checker APi Search");
      const data = await SearchApprovalRequestLineManager({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        navigate,
      });
      setLineManagerApproval(data);
      break;
    }
    default:
      break;
  }
};
export const apiCallStatus = async ({
  selectedKey,
  newdata,
  state,
  addApprovalRequestData,
  callApi,
  showNotification,
  showLoader,
  navigate,
  setIsEmployeeMyApproval,
  setLineManagerApproval,
}) => {
  switch (selectedKey) {
    case "1": {
      const TypeIds = mapBuySellToIds(
        state.type,
        addApprovalRequestData?.Equities
      );
      const statusIds = mapStatusToIds(newdata);
      const requestdata = {
        InstrumentName: state.instrumentName || state.mainInstrumentName,
        Date: state.startDate || "",
        Quantity: state.quantity || 0,
        StatusIds: statusIds || [],
        TypeIds: TypeIds || [],
        PageNumber: 0,
        Length: state.pageSize || 10,
      };
      showLoader(true);
      console.log("Checker APi Search");
      const data = await SearchTadeApprovals({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        navigate,
      });
      console.log(data, "Checker APi Search");
      setIsEmployeeMyApproval(data);
      break;
    }

    case "2":
    case "3":

    case "6": {
      const TypeIds = mapBuySellToIds(
        state.type,
        addApprovalRequestData?.Equities
      );
      const statusIds = mapStatusToIdsForLineManager(newdata);
      const requestdata = {
        InstrumentName: state.instrumentName || state.mainInstrumentName,
        Date: state.startDate || "",
        Quantity: state.quantity || 0,
        StatusIds: statusIds || [],
        TypeIds: TypeIds || [],
        PageNumber: 0,
        Length: state.pageSize || 10,
        RequesterName: state.requesterName,
      };
      showLoader(true);
      console.log("Checker APi Search");
      const data = await SearchApprovalRequestLineManager({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        navigate,
      });
      console.log(data, "Checker APi Search");
      setLineManagerApproval(data);
      break;
    }

    default:
      break;
  }
};
