/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */

export const buildManageUserUseraTabApiRequest = (searchState = {}) => ({
  EmployeeID: searchState.employeeID ? Number(searchState.employeeID) : 0,
  EmployeeName: searchState.employeeName || "",
  EmailAddress: searchState.emailAddress || "",
  // FIXED: AdminMnageUsersTabFilter.jsx's search popover already has a
  // "Department Name" field and writes it into usersTabSearch on Search
  // click - it just never made it into this request builder, so it was
  // silently dropped before reaching the API regardless of what the user
  // typed. GetAllEmployeesWithAssignedManageUsersUserTabPolicies's request
  // model (DepartmentName) and its SP's `LIKE '%...%'` filter already
  // support this - confirmed backend-side, no BE change needed.
  DepartmentName: searchState.departmentName || "",
  // GetAllEmployeesWithAssignedManageUsersUserTabPolicies's PageNumber is
  // now a real 1-indexed page number (backend fix 2026-08-06).
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});
