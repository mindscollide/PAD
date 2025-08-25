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

export const typeOptions = ["Buy", "Sell"];

export const mapBuySellToIds = (arr) => {
  if (!arr || arr.length === 0) return [];
  return arr
    .map((item) => {
      if (item === "Buy") return 1;
      if (item === "Sell") return 2;
      return; // in case something unexpected comes
    })
    .filter(Boolean); // removes nulls
};

export const mapStatusToIds = (arr) => {
  if (!arr || arr.length === 0) return [];
  return arr
    .map((status) => {
      switch (status) {
        case "Pending":
          return 1;
        case "Approved":
          return 2;
        case "Not Traded":
          return 3;
        case "Resubmitted":
          return 4;
        case "Declined":
          return 5;
        case "Traded":
          return 6;
        default:
          return null; // ignore unknown statuses
      }
    })
    .filter(Boolean); // filters out nulls
};

export const apiCallType = async ({
  selectedKey,
  newdata,
  state,
  callApi,
  showNotification,
  showLoader,
  navigate,
  setIsEmployeeMyApproval,
}) => {
  switch (selectedKey) {
    case "1": {
      const TypeIds = mapBuySellToIds(newdata);
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
  callApi,
  showNotification,
  showLoader,
  navigate,
  setIsEmployeeMyApproval,
}) => {
  switch (selectedKey) {
    case "1": {
      const TypeIds = mapBuySellToIds(state.type);
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
      setIsEmployeeMyApproval(data);
      break;
    }

    case "2":
    case "3":
    default:
      break;
  }
};
