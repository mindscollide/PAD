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
