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
  // GetAllEmployeesWithAssignedManageUsersUserTabPolicies's PageNumber is
  // now a real 1-indexed page number (backend fix 2026-08-06).
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});
