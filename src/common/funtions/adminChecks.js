export const hasOnlyAdminRole = (roles = []) => {
  if (!Array.isArray(roles) || roles.length === 0) return false;

  // Check if it has exactly one role and that role is "Admin"
  return (
    roles.length === 1 &&
    roles[0]?.roleName?.toLowerCase() === "admin"
  );
};