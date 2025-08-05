// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("auth_token");
  console.log("sessionStorage PrivateRoute",token)
  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
