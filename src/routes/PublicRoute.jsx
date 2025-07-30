// src/routes/PublicRoute.jsx
import React, { useEffect } from "react";
import Cookies from "js-cookie";

const PublicRoute = ({ children }) => {
  useEffect(() => {
    // Clear all local storage and session storage
    localStorage.clear();
    sessionStorage.clear();

    // Remove all cookies
    const allCookies = document.cookie.split(";");
    for (const cookie of allCookies) {
      const name = cookie.split("=")[0].trim();
      Cookies.remove(name);
    }
  }, []);

  return children;
};

export default PublicRoute;
