// src/routes/RoleBasedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const userRoleIDs = roles?.map((role) => role.roleID) || [];
  const roles=JSON.parse(sessionStorage.getItem("user_assigned_roles"));

  // Wait until roles are loaded (to avoid false redirect)
  if (roles === undefined || roles.length === 0) {
    // You can return a loader here if needed
    return null;
  }

  const hasAccess =
    allowedRoles.length === 0 ||
    userRoleIDs.some((roleID) => allowedRoles.includes(roleID));

  return hasAccess ? children : <Navigate to="/PAD" replace />;
};

export default RoleBasedRoute;
