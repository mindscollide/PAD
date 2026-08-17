// Mirrors headOfComplianceOffice/reports/transactionsSummary/viewDetails/viewComment/utils.jsx -
// same report, same comment field shape (a single string, sometimes with
// multiple comments joined by commas/newlines), just CO's side of it.
export const parseComments = (value) => {
  if (!value) return [];

  // already array
  if (Array.isArray(value)) return value.filter(Boolean);

  // convert to string
  let text = String(value);

  // handle:
  // comma separated
  // line break separated
  // mixed
  return text
    .split(/,|\n|\r\n/) // <-- magic (comma OR new line)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};
