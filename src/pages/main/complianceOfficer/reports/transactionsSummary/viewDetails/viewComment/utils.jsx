// Mirrors headOfComplianceOffice/reports/transactionsSummary/viewDetails/viewComment/utils.jsx -
// same report, just CO's side of it.
//
// CHANGED (API_Changes/2026-08-27_hoc_transaction_summary_comments.md):
// accetanceComments/rejectionComments moved from a single raw string (with
// a leaking "CO<UserID>" code, and only ever one comment even when several
// were left) to an array of resolved {userID, name, comments} objects.
// Formats those into "Name: comment text" display lines here so
// ViewCommentModal (which just renders each list item as-is) needs no
// changes. The old string-splitting path stays for defensive/legacy input.
export const parseComments = (value) => {
  if (!value) return [];

  // already an array - new shape is [{userID, name, comments}, ...],
  // format each into one display line; a stray plain-string array item
  // (old shape, shouldn't happen once deployed) passes through as-is.
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
