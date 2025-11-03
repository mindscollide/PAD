// src/routes/RoleBasedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const RoleBasedRoute = ({ allowedRoles = [], children, isAdmin }) => {
  const roles = JSON.parse(sessionStorage.getItem("user_assigned_roles")) || [];
  const userRoleIDs = roles.map((role) => role.roleID) || [];
  const currentRoleIsAdmin = JSON.parse(
    sessionStorage.getItem("current_role_is_admin")
  );
  // Wait until roles are loaded (to avoid false redirect)
  if (!roles || roles.length === 0) {
    return <Navigate to="/PAD" replace />;
  }

  const hasAccess =
    currentRoleIsAdmin === isAdmin &&
    (allowedRoles.length === 0 ||
      userRoleIDs.some((roleID) => allowedRoles.includes(roleID)));

  return hasAccess ? children : <Navigate to="/PAD" replace />;
};

export default RoleBasedRoute;
