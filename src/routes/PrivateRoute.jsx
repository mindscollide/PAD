// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoute = ({ children }) => {
  const token = Cookies.get("auth_token");
  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
