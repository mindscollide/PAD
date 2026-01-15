import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * -----------------------------------------------------
 *  Dashboard Context
 * -----------------------------------------------------
 * This context manages all global dashboard-related states:
 *
 *  - Dashboard sections (Portfolio, My Approvals, etc.)
 *  - Employee-based broker list
 *  - Instruments list
 *  - Asset type listing
 *  - Predefined reasons
 *  - Role handling (Admin / Non-Admin)
 *  - Urgent alert flag
 *  - Resetting dashboard to initial state
 *
 * Everything inside this provider becomes available
 * throughout the entire application wherever needed.
 */

// -----------------------------------------------------
// 1. Create Context
// -----------------------------------------------------
export const DashboardContext = createContext();

/**
 * -----------------------------------------------------
 * 2. DashboardProvider Component
 * -----------------------------------------------------
 * Wraps the App and provides global data.
 */
export const DashboardProvider = ({ children }) => {
  /**
   * --------------------------------------------
   * Dashboard Section Data (Sidebar Tiles)
   * --------------------------------------------
   */
  const [dashboardData, setDashboardData] = useState({
    title: "",
    subTitle: "",
    employee: {
      Portfolio: { title: "Portfolio", data: [] },
      MyApprovals: { title: "My Approvals", data: [] },
      MyTransactions: { title: "My Transactions", data: [] },
      MyHistory: { title: "My History", data: [] },
      Reports: { title: "Reports", data: [] },
    },
    LineManager: {},
    ComplianceOfficer: {},
    HeadofTradeApproval: {},
    HeadofComplianceOfficer: {},
  });

  /**
   * ------------------------------------------------------
   * Employee-Specific Brokers (Allowed Broker List)
   * ------------------------------------------------------
   * Used mainly in Trade Approvals & Portfolio modules.
   */
  const [employeeBasedBrokersData, setEmployeeBasedBrokersData] = useState([]);
  const [allBrokersData, setAllBrokersData] = useState([]);

  /**
   * ------------------------------------------------------
   * Employee-Specific Brokers (Allowed Broker List)
   * ------------------------------------------------------
   * Used mainly in Trade Approvals & Portfolio modules.
   */
  const [manageBrokersModalOpen, setManageBrokersModalOpen] = useState(false);

  /**
   * ------------------------------------------------------
   * Instruments List (All Tradable Instruments)
   * ------------------------------------------------------
   */
  const [allInstrumentsData, setAllInstrumentsData] = useState([]);

  /**
   * ------------------------------------------------------
   * Asset Types for Add-Approval Request
   * ------------------------------------------------------
   */
  const [assetTypeListingData, setAssetTypeListingData] = useState([]);

  /**
   * ------------------------------------------------------
   * Predefined Reason List (Used in Re-Submit Flow)
   * ------------------------------------------------------
   */
  const [getAllPredefineReasonData, setGetAllPredefineReasonData] = useState(
    []
  );

  /**
   * ------------------------------------------------------
   * Role Handling (Admin or Non-Admin)
   * ------------------------------------------------------
   */
  const [currentRoleIsAdmin, setCurrentRoleIsAdmin] = useState(false);
  const [roleChanegFlag, setRoleChanegFlag] = useState(false);

  // Reference to store role between refreshes or navigations
  const currentRoleIsAdminRef = useRef(currentRoleIsAdmin);

  /**
   * ------------------------------------------------------
   * Persist Admin Role using Session Storage
   * ------------------------------------------------------
   */
  useEffect(() => {
    const storedAdminStatus = sessionStorage.getItem("current_role_is_admin");
    if (storedAdminStatus !== null) {
      setCurrentRoleIsAdmin(JSON.parse(storedAdminStatus));
    }
  }, []);

  useEffect(() => {
    currentRoleIsAdminRef.current = currentRoleIsAdmin;
  }, [currentRoleIsAdmin]);

  /**
   * ------------------------------------------------------
   * Urgent Alerts for Line Manager
   * (Triggers Accordion Panels)
   * ------------------------------------------------------
   */
  const [urgentAlert, setUrgentAlert] = useState(false);

  /**
   * ------------------------------------------------------
   * Reset Entire Dashboard Context to Initial State
   * ------------------------------------------------------
   */
  const resetDashboardContextState = () => {
    setDashboardData({
      title: "",
      subTitle: "",
      employee: {
        Portfolio: { title: "Portfolio", data: [] },
        MyApprovals: { title: "My Approvals", data: [] },
        MyTransactions: { title: "My Transactions", data: [] },
        MyHistory: { title: "My History", data: [] },
        Reports: { title: "Reports", data: [] },
      },
      LineManager: {},
      ComplianceOfficer: {},
      HeadofTradeApproval: {},
      HeadofComplianceOfficer: {},
    });
    setAllBrokersData([]);
    setEmployeeBasedBrokersData([]);
    setAllInstrumentsData([]);
    setAssetTypeListingData([]);
    setGetAllPredefineReasonData([]);
    setManageBrokersModalOpen(false);
  };

  /**
   * ------------------------------------------------------
   * Provide all context values to children
   * ------------------------------------------------------
   */
  return (
    <DashboardContext.Provider
      value={{
        // Dashboard Section Data
        dashboardData,
        setDashboardData,

        // Employee-based Brokers
        employeeBasedBrokersData,
        setEmployeeBasedBrokersData,
        allBrokersData,
        setAllBrokersData,

        // Instruments List
        allInstrumentsData,
        setAllInstrumentsData,

        // Asset Types
        assetTypeListingData,
        setAssetTypeListingData,

        // Predefined Reasons
        getAllPredefineReasonData,
        setGetAllPredefineReasonData,

        // Reset Function
        resetDashboardContextState,

        // Role Handling
        currentRoleIsAdmin,
        setCurrentRoleIsAdmin,
        roleChanegFlag,
        setRoleChanegFlag,
        currentRoleIsAdminRef,

        // Urgent Alerts
        urgentAlert,
        setUrgentAlert,

        // manage Broker modal
        manageBrokersModalOpen,
        setManageBrokersModalOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

/**
 * ------------------------------------------------------
 * 3. Custom Hook for Easy Access
 * ------------------------------------------------------
 * Usage:
 *   const { dashboardData } = useDashboardContext();
 */
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider"
    );
  }

  return context;
};
