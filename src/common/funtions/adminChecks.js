export const hasOnlyAdminRole = (roles) => {
  return (
    Array.isArray(roles) && roles.length === 1 && roles[0].roleName === "Admin"
  );
};

export const hasAdminRole = (roles) => {
  return Array.isArray(roles) && roles.some((r) => r.roleName === "Admin");
};
