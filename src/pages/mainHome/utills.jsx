export const roleKeyMap = {
  1: "admin",
  2: "employee",
  3: "lineManager",
  4: "complianceOfficer",
  5: "headofTradeApproval",
  6: "headofComplianceOfficer",
};
export const checkRoleMatch = (roles, targetRoleID) => {
  return roles.some(role => role.roleID === targetRoleID);
};


/**
 * Get the first valid matched role ID, ignoring role ID = 1.
 * @param {Array} roles - Array of user role objects (e.g. [{ roleID: 1 }, { roleID: 3 }])
 * @param {Function} checkRoleMatch - Function to check role matching logic
 * @returns {number | undefined} The first matched role ID, or undefined if none
 */
export const getFirstMatchedRole = (roles = [], checkRoleMatch) => {
  if (!Array.isArray(roles) || roles.length === 0 || typeof checkRoleMatch !== "function") {
    return undefined;
  }

  // Extract role IDs
  const userRoleIDs = roles.map((r) => r.roleID);

  // Remove role 1
  const filteredRoles = userRoleIDs.filter((id) => id !== 1);

  // Return the first matched role
  return filteredRoles.find((roleId) => checkRoleMatch(roles, roleId));
};