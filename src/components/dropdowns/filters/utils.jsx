import { SearchTadeApprovals } from "../../../api/myApprovalApi";

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

export const getTypeOptions = (addApprovalRequestData) => {
  return (addApprovalRequestData?.Equities || []).map((item) => ({
    label: item.type,
    value: item.tradeApprovalTypeID,
    assetTypeID: item.assetTypeID,
  }));
};

export const mapBuySellToIds = (arr, options) => {
  console.log("mapBuySellToIds", arr);
  console.log("mapBuySellToIds", options);
  if (!arr || arr.length === 0 || !options) return [];
  return arr
    .map((label) => {
      const match = options.find((opt) => opt.type === label);
      return match ? match.tradeApprovalTypeID : null;
    })
    .filter(Boolean); // remove nulls
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
}) => {
  switch (selectedKey) {
    case "1": {
      const TypeIds = mapBuySellToIds(
        newdata,
        addApprovalRequestData?.Equities
      );
      const statusIds = mapStatusToIds(state.status);
      const requestdata = {
        InstrumentName: state.instrumentName || state.mainInstrumentName,
        StartDate: state.startDate || "",
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
        StartDate: state.startDate || "",
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
    default:
      break;
  }
};
