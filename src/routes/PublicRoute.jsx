// src/routes/PublicRoute.jsx
import React, { useEffect } from "react";

const PublicRoute = ({ children }) => {
  console.log("sessionStorage PublicRoute")
  useEffect(() => {
    // Clear all local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  return children;
};

export default PublicRoute;
