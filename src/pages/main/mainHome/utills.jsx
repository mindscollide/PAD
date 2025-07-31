export const roleKeyMap = {
  2: "employee",
  3: "lineManager",
  4: "complianceOfficer",
  5: "headofTradeApproval",
  6: "headofComplianceOfficer",
};
export const checkRoleMatch = (roles, targetRoleID) => {
  return roles.some(role => role.roleID === targetRoleID);
};