// =========================
// TYPE COLOR CONFIGURATION
// =========================
export const typeColorMap = {
  shares: {
    bgColor: "#C5FFC7",
    textCountColor: "#00640A",
    textLableColor: "var(--Blue-V1, #30426A)",
    textAlign: "left",
  },
  approved: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  declined: {
    bgColor: "#FFDBDB",
    textLableColor: "#A50000",
    textCountColor: "#A50000",
    textAlign: "center",
  },
  pending: {
    bgColor: "#D9D9D9",
    textLableColor: "#424242",
    textCountColor: "#424242",
    textAlign: "center",
  },
  compliant: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  noncomplaint: {
    bgColor: "#FFDBDB",
    textLableColor: "#A50000",
    textCountColor: "#A50000",
    textAlign: "center",
  },
  non_compliant: {
    bgColor: "#FFDBDB",
    textLableColor: "#A50000",
    textCountColor: "#A50000",
    textAlign: "center",
  },
  approval: {
    bgColor: "#FFF1E7",
    textLableColor: "#F67F29",
    textCountColor: "#F67F29",
    textAlign: "center",
  },
  verifications: {
    bgColor: "#FFF1E7",
    textLableColor: "#30426A", // Using var(--Blue-V1)
    textCountColor: "#30426A",
    textAlign: "center",
  },
  pending_approval_requests: {
    bgColor: "#FFF1E7",
    textLableColor: "#F67F29",
    textCountColor: "#F67F29",
    textAlign: "center",
  },
  total_pending_approvals: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  urgent_action: {
    bgColor: "#FFDBDB",
    textLableColor: "#A50000",
    textCountColor: "#A50000",
    textAlign: "center",
  },
  approval_require_urgent_action: {
    bgColor: "#FFDBDB",
    textLableColor: "#A50000",
    textCountColor: "#A50000",
    textAlign: "center",
  },
  pending_verification_requests: {
    bgColor: "#EDF3FF",
    textLableColor: "#30426A", // Using var(--Blue-V1)
    textCountColor: "#30426A",
    textAlign: "center",
  },
  pending_verification_request: {
    bgColor: "#EDF3FF",
    textLableColor: "#30426A", // Using var(--Blue-V1)
    textCountColor: "#30426A",
    textAlign: "center",
  },

  escalated_approval_request: {
    bgColor: "#FFF1E7",
    textLableColor: "#F67F29", // Using var(--Blue-V1)
    textCountColor: "#F67F29",
    textAlign: "center",
  },
  // admin
  unrestricted: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  restricted: {
    bgColor: "#FFDBDB",
    textLableColor: "#A50000",
    textCountColor: "#A50000",
    textAlign: "center",
  },

  active_instruments: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  inactive_instruments: {
    bgColor: "#FFDBDB",
    textLableColor: "#A50000",
    textCountColor: "#A50000",
    textAlign: "center",
  },
  active_brokers: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  inactive_brokers: {
    bgColor: "#FFDBDB",
    textLableColor: "#A50000",
    textCountColor: "#A50000",
    textAlign: "center",
  },

  groups: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  total_users: {
    bgColor: "#EDF3FF",
    textLableColor: "#30426A",
    textCountColor: "#30426A",
    textAlign: "center",
  },
  approval_requests: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  total_transactions: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  total_volume: {
    bgColor: "#FFDBDB",
    textLableColor: "#A50000",
    textCountColor: "#A50000",
    textAlign: "center",
  },
  pending_approvals: {
    bgColor: "#FFF1E7",
    textLableColor: "#F67F29", // Using var(--Blue-V1)
    textCountColor: "#F67F29",
    textAlign: "center",
  },
  user_approval_requests: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  transactions: {
    bgColor: "#C5FFC7",
    textLableColor: "#00640A",
    textCountColor: "#00640A",
    textAlign: "center",
  },
  employees: {
    bgColor: "#EDF3FF",
    textLableColor: "#30426A",
    textCountColor: "#30426A",
    textAlign: "center",
  },
  pending_verifications: {
    bgColor: "#EDF3FF",
    textLableColor: "#30426A",
    textCountColor: "#30426A",
    textAlign: "center",
  },
  portfolios_evaluated_by_you: {
    bgColor: "#EDF3FF",
    textLableColor: "#30426A",
    textCountColor: "#30426A",
    textAlign: "center",
  },
};

// ============================
// ROUTE MAPS FOR EACH USER ROLE
// ============================
export const adminRouteMap = {
  brokers: { path: "admin-brokers", key: "19" },
  policies: { path: "admin-users", key: "21" },
  grouppolicies: { path: "admin-group-policies", key: "20" },
  instruments: { path: "admin-instruments", key: "18" },
  reports: { path: "admin-reports", key: "23" },
};

export const employeRouteMap = {
  approvals: { path: "approvals", key: "1" },
  transactions: { path: "transactions", key: "2" },
  history: { path: "history", key: "3" },
  portfolio: { path: "portfolios", key: "4" },
  reports: { path: "reports", key: "5" },
};

export const lineManagerRouteMap = {
  approvals: { path: "lm-approval-requests", key: "6" },
  actions: { path: "lm-my-actions", key: "7" },
  reports: { path: "lm-reports", key: "8" },
};

export const complianceOfficerRouteMap = {
  reconcile: { path: "co-reconcile-transactions", key: "9" },
  action: { path: "co-my-actions", key: "10" },
  reports: { path: "co-reports", key: "11" },
};

export const headOfTradeRouteMap = {
  escalated: { path: "hta-escalated-requests", key: "12" },
  action: { path: "hta-my-actions", key: "13" },
  reports: { path: "hta-reports", key: "14" },
};

export const headOfComplianceOfficerRouteMap = {
  verification: { path: "hca-escalated-transactions-verifications", key: "15" },
  action: { path: "hca-my-actions", key: "16" },
  reports: { path: "hca-reports", key: "17" },
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
    case "Admin":
      pathInfo = adminRouteMap[route];
      break;
    case "employee":
      pathInfo = employeRouteMap[route];
      break;
    case "LM":
      pathInfo = lineManagerRouteMap[route];
      break;
    case "CO":
      pathInfo = complianceOfficerRouteMap[route];
      break;
    case "HTA":
      pathInfo = headOfTradeRouteMap[route];
      break;
    case "HCA":
      pathInfo = headOfComplianceOfficerRouteMap[route];
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
