// src/routes/PrivateRoute.jsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = sessionStorage.getItem("auth_token");

  useEffect(() => {
    if (!token) {
      // Clear any residual session data
      sessionStorage.clear();
    }
  }, [token]);

  if (!token) {
    // Store the attempted path for future redirect after login if needed
    sessionStorage.setItem("redirectPath", location.pathname);
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
