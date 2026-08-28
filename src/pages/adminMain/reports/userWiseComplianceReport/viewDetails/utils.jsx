import { toYYMMDD, formatApiDateTime } from "../../../../../common/funtions/rejex";

/**
 * Utility: helpers for Admin > Reports > User-wise Compliance Report >
 * View Details, per API_Changes/2026-08-27_admin_user_wise_compliance_report_details.md.
 *
 * This file previously held an unrelated, unused copy of the HTA TAT view
 * details table config (never imported by ViewDetails.jsx, dead leftover
 * from an earlier scaffold) - replaced with the real helpers this screen
 * actually needs.
 */

/** "YYYY-MM-DD" from a bare "yyyyMMdd" date string (no time component to
 * localize - policy assignment dates are date-only). Avoids
 * formatApiDateTime here on purpose: faking a "000000" time and running it
 * through UTC->local conversion risks shifting the calendar day depending
 * on the viewer's timezone, for a value that was never meant to carry a
 * time at all. */
const formatDateOnly = (yyyyMMdd) => {
  if (!yyyyMMdd || typeof yyyyMMdd !== "string" || yyyyMMdd.length < 8)
    return "—";
  return `${yyyyMMdd.slice(0, 4)}-${yyyyMMdd.slice(4, 6)}-${yyyyMMdd.slice(6, 8)}`;
};

/** "YYYY-MM-DD | hh:mm am/pm", localized from a UTC yyyyMMdd + HHmmss
 * pair via formatApiDateTime (rejex.js) - the combined value must be
 * localized as one string, never date and time independently (a
 * near-midnight timestamp can shift calendar day on conversion). */
const formatDateTime = (datePart, timePart) => {
  if (!datePart) return "—";
  const combined = `${datePart} ${timePart || ""}`.trim();
  return formatApiDateTime(combined) || "—";
};

export const buildDetailsRequest = (employeeID, searchState = {}) => ({
  EmployeeID: employeeID,
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

export const buildPolicyHistoryRequest = (employeeID) => ({
  EmployeeID: employeeID,
});

/** `score` is `null` (no trade approvals/transactions in scope yet) or a
 * plain number - SRS/doc: render "N/A" for null, never "0%". */
export const formatScore = (score) =>
  score === null || score === undefined ? "N/A" : `${score}%`;

/**
 * Maps GetAdminUserWiseComplianceReportDetailsAPI's flat response into the
 * left (profile, not date-scoped) / right (stats, date-scoped) shape the
 * screen renders.
 */
export const mapDetailsResponse = (res = {}) => {
  if (!res) return null;

  const accountCreatedDisplay = formatDateTime(
    res.accountCreatedDate,
    res.accountCreatedTime
  );
  const lastLoginDisplay = formatDateTime(res.lastLoginDate, res.lastLoginTime);

  const totalTransactionsInitiated = res.totalTransactionsInitiated || 0;
  const totalTransactionsApproved = res.totalTransactionsApproved || 0;

  return {
    employeeID: res.employeeID,
    fullName: res.fullName || "—",
    status: res.status || "—",
    departmentName: res.departmentName || "—",
    email: res.email || "—",
    roles: Array.isArray(res.roles) ? res.roles : [],

    accountCreatedDisplay,
    activityDays: res.activityDays ?? "—",
    lastLoginDisplay,

    currentPolicyName: res.currentPolicy?.policyName || null,
    currentPolicyAssignedDate: res.currentPolicy?.assignedDate
      ? formatDateOnly(res.currentPolicy.assignedDate)
      : null,
    lastPolicyName: res.lastPolicy?.policyName || null,
    lastPolicyAssignedDate: res.lastPolicy?.assignedDate
      ? formatDateOnly(res.lastPolicy.assignedDate)
      : null,

    reportStartDate: formatDateOnly(res.reportStartDate),
    reportEndDate: formatDateOnly(res.reportEndDate),

    totalTradeApprovalsInitiated: res.totalTradeApprovalsInitiated || 0,
    totalTradeApprovalsApproved: res.totalTradeApprovalsApproved || 0,
    totalTradeApprovalsDeclined: res.totalTradeApprovalsDeclined || 0,
    approvalScore: res.approvalScore ?? null,

    totalTransactionsInitiated,
    totalTransactionsApproved,
    totalTransactionsDeclined: res.totalTransactionsDeclined || 0,
    complianceScore: res.complianceScore ?? null,

    // Doughnut chart (Total vs Compliant Transactions, per SRS) - no
    // separate field needed, built from the counts/score already above.
    // Non-compliant = whatever's left of the initiated total.
    transactionsDonut: {
      labels: ["Compliant", "Non-Compliant"],
      counts: [
        totalTransactionsApproved,
        Math.max(totalTransactionsInitiated - totalTransactionsApproved, 0),
      ],
      percentages:
        res.complianceScore === null || res.complianceScore === undefined
          ? [0, 0]
          : [res.complianceScore, 100 - res.complianceScore],
      totalCount: totalTransactionsInitiated,
    },

    // Top Policy Breaches bar chart - policyScenario is the only
    // human-readable label the source data has (no separate short "policy
    // name" field per the doc), used for both the axis label and hover.
    policyBreachBar: {
      labels: Array.isArray(res.policyBreachGraph)
        ? res.policyBreachGraph.map(
            (p) => p.policyCode || p.policyScenario || "—"
          )
        : [],
      counts: Array.isArray(res.policyBreachGraph)
        ? res.policyBreachGraph.map((p) => p.breachCount || 0)
        : [],
      scenarios: Array.isArray(res.policyBreachGraph)
        ? res.policyBreachGraph.map((p) => p.policyScenario || "")
        : [],
    },
  };
};

/**
 * Maps GetAdminUserWiseComplianceReportPolicyHistoryAPI's response for the
 * "View More" modal. previouslyAssignedPolicies is unpaginated - sorted
 * assignedDate descending here (FE-side, per the doc - no server sort
 * param), a stable default the modal's own column sorter can still
 * override.
 */
export const mapPolicyHistoryResponse = (res = {}) => {
  const currentPolicy = res?.currentPolicy
    ? {
        policyName: res.currentPolicy.policyName || "—",
        assignedDate: formatDateOnly(res.currentPolicy.assignedDate),
      }
    : null;

  const previous = Array.isArray(res?.previouslyAssignedPolicies)
    ? res.previouslyAssignedPolicies
    : [];

  const previouslyAssignedPolicies = previous
    .map((p, index) => ({
      key: `${p.assignedDate || ""}-${index}`,
      policyName: p.policyName || "—",
      assignedDate: formatDateOnly(p.assignedDate),
      // raw digits kept for correct chronological sort - the display
      // string above is dashed, not directly sortable as "latest first"
      // once localized further, so sort off this instead.
      assignedDateRaw: p.assignedDate || "",
    }))
    .sort((a, b) => b.assignedDateRaw.localeCompare(a.assignedDateRaw));

  return { currentPolicy, previouslyAssignedPolicies };
};
