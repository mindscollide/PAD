// Mirrors complianceOfficer/headOfComplianceOffice's own version of this
// report's viewComment/utils.jsx - same shape now that
// API_Changes/2026-08-28_admin_transaction_summary_view_details_fix.md
// brought Admin's approvalComment/rejectionComment in line: an array of
// resolved {userID, name, comments} objects instead of a single raw
// string with a leaking "CO<UserID>" code. Formats those into
// "Name: comment text" display lines here so ViewCommentModal (which just
// renders each list item as-is) needs no changes.
export const parseComments = (value) => {
  if (!value) return [];

  // already an array - shape is [{userID, name, comments}, ...], format
  // each into one display line; a stray plain-string array item (old
  // shape, shouldn't happen once deployed) passes through as-is.
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item) =>
        typeof item === "object"
          ? `${item.name ? `${item.name}: ` : ""}${item.comments ?? ""}`.trim()
          : item
      );
  }

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
