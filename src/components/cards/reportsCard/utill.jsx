
// ============================
// ROUTE MAPS FOR EACH USER ROLE
// ============================

export const employeRouteMap = {
  approvals: { path: "approvals", key: "1" },
  transactions: { path: "transactions", key: "2" },
  history: { path: "history", key: "3" },
  portfolio: { path: "portfolios", key: "4" },
  reports: { path: "reports", key: "5" },
};

export const lineManagerRouteMap = {
  approvals: { path: "approvals", key: "1" },
  transactions: { path: "transactions", key: "2" },
  history: { path: "history", key: "3" },
  portfolio: { path: "portfolios", key: "4" },
  reports: { path: "reports", key: "5" },
};

export const complianceOfficerRouteMap = {
  approvals: { path: "approvals", key: "1" },
  transactions: { path: "transactions", key: "2" },
  history: { path: "history", key: "3" },
  portfolio: { path: "portfolios", key: "4" },
  reports: { path: "reports", key: "5" },
};

export const headOfTradeRouteMap = {
  approvals: { path: "approvals", key: "1" },
  transactions: { path: "transactions", key: "2" },
  history: { path: "history", key: "3" },
  portfolio: { path: "portfolios", key: "4" },
  reports: { path: "reports", key: "5" },
};

export const headOfComplianceRouteMap = {
  approvals: { path: "approvals", key: "1" },
  transactions: { path: "transactions", key: "2" },
  history: { path: "history", key: "3" },
  portfolio: { path: "portfolios", key: "4" },
  reports: { path: "reports", key: "5" },
};

// ===================================
// NAVIGATION FUNCTION BASED ON ROLE
// ===================================

/**
 * Navigates the user to the corresponding route based on their role and desired route key.
 *
 * @param {string} userRole - The current user's role (e.g., "employee", "lineManager").
 * @param {string} route - The logical route name (e.g., "approvals", "portfolio").
 * @param {Function} setSelectedKey - Callback to update selected key in menu/sidebar.
 * @param {Function} navigate - React Router's navigate function for redirection.
 */
export const navigateToPage = (userRole, route, setSelectedKey, navigate) => {
  let pathInfo = null;

  console.log("onClickMore", userRole, route);

  // Determine the path map based on role
  switch (userRole) {
    case "employee":
      pathInfo = employeRouteMap[route];
      break;
    case "lineManager":
      pathInfo = lineManagerRouteMap[route];
      break;
    case "complianceOfficer":
      pathInfo = complianceOfficerRouteMap[route];
      break;
    case "headOfTrade":
      pathInfo = headOfTradeRouteMap[route];
      break;
    case "headOfCompliance":
      pathInfo = headOfComplianceRouteMap[route];
      break;
    default:
      console.warn("Unknown userRole:", userRole);
  }

  // Navigate if valid path exists
  if (pathInfo) {
    console.log("Navigating to:", pathInfo);
    setSelectedKey(pathInfo.key);
    navigate(pathInfo.path);
  } else {
    console.warn(
      "Navigation path not found for userRole:",
      userRole,
      "and title:",
      route
    );
  }
};
