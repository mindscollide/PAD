// Shared with headOfComplianceOffice/reports/overDueVerificationsReports/
// viewOverdueVerificationReportsComment/ViewOverdueVerificationReportsComment.jsx
// - turns out that ALSO reads approvalComment/rejectionComment off
// GetAllComplianceOfficerReconcileTransactionAndPortfolioRequest's response
// (isEscalatedHeadOfComplianceViewDetailData, same context field
// escalatedVerification's own view uses), so it's covered by the CHANGED
// note below too, not a separate unaffected endpoint as first assumed.
//
// CHANGED: two sibling BE fixes, same shape, same array-of-objects format -
// API_Changes/2026-08-27_hoc_transaction_summary_comments.md (this page's
// own accetanceComments/rejectionComments) and
// API_Changes/2026-08-27_escalated_view_details_comments.md
// (approvalComment/rejectionComment, read by the Overdue Verifications
// caller above). Both moved from a single raw string (with a leaking
// "CO<UserID>" code, and only ever one comment even when several were
// left) to an array of resolved {userID, name, comments} objects. Formats
// those into "Name: comment text" display lines here so ViewCommentModal
// (which just renders each list item as-is) needs no changes.
export const parseComments = (value) => {
  if (!value) return [];

  // already an array - new shape is [{userID, name, comments}, ...],
  // format each into one display line; a stray plain-string array item
  // (either endpoint's old shape before deploy) passes through as-is.
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item) =>
        typeof item === "object"
          ? `${item.comments ?? ""} - ${
              item.name ? `${item.name} ` : ""
            }`.trim()
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
