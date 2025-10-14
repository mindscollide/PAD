import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// 1. Create the Context
export const DashboardContext = createContext();

// 2. Create a Provider component
export const DashboardProvider = ({ children }) => {
  // this state is used for sider bar open and closed
  const [dashboardData, setDashboardData] = useState({
    title: "",
    subTitle: "",
    employee: {
      Portfolio: {
        title: "Portfolio",
        data: [],
      },
      MyApprovals: {
        title: "My Approvals",
        data: [],
      },
      MyTransactions: {
        title: "My Transactions",
        data: [],
      },
      MyHistory: {
        title: "My History",
        data: [],
      },
      Reports: {
        title: "Reports",
        data: [],
      },
    },
    LineManager: {},
    ComplianceOfficer: {},
    HeadofTradeApproval: {},
    HeadofComplianceOfficer: {},
  });
  // this state is used for get list of current user allowed brokers to deal with
  const [employeeBasedBrokersData, setEmployeeBasedBrokersData] = useState([]);
  const [allInstrumentsData, setAllInstrumentsData] = useState([]);

  //This state is for the addApproval Request on Approval listing page
  const [assetTypeListingData, setAssetTypeListingData] = useState([]);

  // This state is for the Predefinr Request Reason on Resubmit
  const [getAllPredefineReasonData, setGetAllPredefineReasonData] = useState(
    []
  );
  const [currentRoleIsAdmin, setCurrentRoleIsAdmin] = useState(false);
  const [roleChanegFlag, setRoleChanegFlag] = useState(false);
  const currentRoleIsAdminRef = useRef(currentRoleIsAdmin);
  // Main resetDashboardContext State
  // ✅ This will reset all states to initial (inline - no separate function)
  useEffect(() => {
    const storedAdminStatus = sessionStorage.getItem("current_role_is_admin");
    if (storedAdminStatus !== null) {
      setCurrentRoleIsAdmin(JSON.parse(storedAdminStatus));
    }
  }, []);

  useEffect(() => {
    currentRoleIsAdminRef.current = currentRoleIsAdmin; // keep ref updated with latest tab
  }, [currentRoleIsAdmin]);

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

    setEmployeeBasedBrokersData([]);
    setAllInstrumentsData([]);
    setAssetTypeListingData([]);
    setGetAllPredefineReasonData([]);
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        setDashboardData,
        employeeBasedBrokersData,
        setEmployeeBasedBrokersData,
        allInstrumentsData,
        setAllInstrumentsData,
        assetTypeListingData,
        setAssetTypeListingData,
        getAllPredefineReasonData,
        setGetAllPredefineReasonData,
        resetDashboardContextState,
        currentRoleIsAdmin,
        setCurrentRoleIsAdmin,
        roleChanegFlag,
        setRoleChanegFlag,
        currentRoleIsAdminRef,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// 3. Custom Hook to consume context
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }

  return context;
};
