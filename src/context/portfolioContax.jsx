import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * PortfolioContext
 *
 * Provides global state for managing the Portfolio module:
 * - Active tab control
 * - Upload portfolio modal state
 * - Employee pending approvals (API + MQTT)
 * - Employee portfolio data (API + MQTT)
 * - Aggregate totals
 */
export const PortfolioContext = createContext();

/**
 * PortfolioProvider
 *
 * Wraps the app (or subtree) with portfolio-related state and methods.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - Components that consume the context.
 * @returns {JSX.Element} Portfolio context provider.
 */
export const PortfolioProvider = ({ children }) => {
  /**
   * Currently active tab inside the portfolio module.
   *
   * @type {[string, function]}
   */
  const [activeTab, setActiveTab] = useState("portfolio");
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab; // always latest
  }, [activeTab]);
  /**
   * Controls visibility of the "Upload Portfolio" modal.
   *
   * @type {[boolean, function]}
   */
  const [uploadPortfolioModal, setUploadPortfolioModal] = useState(false);

  /**
   * Employee pending approvals fetched via API.
   *
   * @type {[{ data: Array, totalRecords: number, apiCall: boolean }, function]}
   */
  const [employeePendingApprovalsData, setEmployeePendingApprovalsData] =
    useState({
      pendingApprovalsData: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });

  /**
   * Employee pending approvals received via MQTT.
   *
   * @type {[{ data: Array, mqtt: boolean }, function]}
   */
  // const [
  //   employeePendingApprovalsDataMqtt,
  //   setEmployeePendingApprovalsDataMqtt,
  // ] = useState({
  //   data: [],
  //   mqtt: false,
  // });
  const [
    employeePendingApprovalsDataMqtt,
    setEmployeePendingApprovalsDataMqtt,
  ] = useState(false);
  /**
   * Employee portfolio data fetched via API.
   *
   * @type {[{ data: Array, totalRecords: number, apiCall: boolean }, function]}
   */
  const [employeePortfolioData, setEmployeePortfolioData] = useState({
    data: [],
    totalRecords: 0,
    apiCall: false,
  });

  /**
   * Employee portfolio data received via MQTT.
   *
   * @type {[{ data: Array, mqtt: boolean }, function]}
   */
  const [employeePortfolioDataMqtt, setEmployeePortfolioDataMqtt] = useState({
    data: [],
    mqtt: false,
  });

  /**
   * Aggregate total quantity of all portfolio holdings.
   *
   * @type {[number, function]}
   */
  const [aggregateTotalQuantity, setAggregateTotalQuantity] = useState(0);

  // Context STate to extract data from GetComplianceOfficerViewDetailsByTradeApprovalID which is show by click on Viewdetail of Portfolio reconcile transaction
  const [
    reconcilePortfolioViewDetailData,
    setReconcilePortfolioViewDetailData,
  ] = useState({
    assetTypes: [],
    details: [],
    hierarchyDetails: [],
    requesterName: "",
    workFlowStatus: {},
  });

  // Head Of Compliance (HOC) view detail data state Start here
  const [
    isEscalatedPortfolioHeadOfComplianceViewDetailData,
    setIsEscalatedPortfolioHeadOfComplianceViewDetailData,
  ] = useState({
    details: [],
    assetTypes: [],
    hierarchyDetails: [],
    workFlowStatus: {},
    tradedWorkFlowRequests: [],
    ticketUploaded: false,
    requesterName: "",
    escalations: [],
  });

  //To get the selected data by clicking on View Detail of reconcile Transaction
  const [
    selectedEscalatedPortfolioHeadOfComplianceData,
    setSelectedEscalatedPortfolioHeadOfComplianceData,
  ] = useState(null);

  //To get the selected data by clicking on View Detail of reconcile Transaction
  const [
    selectedPortfolioTransactionData,
    setSelectedPortfolioTransactionData,
  ] = useState(null);

  /**
   * Reset only the portfolio tab state.
   */
  const resetPortfolioTab = () => {
    setActiveTab("portfolio");
    setEmployeePortfolioData({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });
    setEmployeePortfolioDataMqtt({
      data: [],
      mqtt: false,
    });
    setAggregateTotalQuantity(0);
  };

  /**
   * Reset the pending approvals tab state (API + MQTT).
   */
  const resetPendingApprovalTab = () => {
    setActiveTab("portfolio");
    setEmployeePendingApprovalsData({
      pendingApprovalsData: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
    setEmployeePendingApprovalsDataMqtt(false);
  };

  return (
    <PortfolioContext.Provider
      value={{
        activeTab,
        activeTabRef,
        setActiveTab,
        uploadPortfolioModal,
        setUploadPortfolioModal,
        employeePendingApprovalsData,
        setEmployeePendingApprovalsData,
        employeePendingApprovalsDataMqtt,
        setEmployeePendingApprovalsDataMqtt,
        employeePortfolioData,
        setEmployeePortfolioData,
        employeePortfolioDataMqtt,
        setEmployeePortfolioDataMqtt,
        aggregateTotalQuantity,
        setAggregateTotalQuantity,
        resetPortfolioTab,
        resetPendingApprovalTab,
        reconcilePortfolioViewDetailData,
        setReconcilePortfolioViewDetailData,
        selectedPortfolioTransactionData,
        setSelectedPortfolioTransactionData,

        // Head Of Compliance (HOC) States
        isEscalatedPortfolioHeadOfComplianceViewDetailData,
        setIsEscalatedPortfolioHeadOfComplianceViewDetailData,
        selectedEscalatedPortfolioHeadOfComplianceData,
        setSelectedEscalatedPortfolioHeadOfComplianceData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

/**
 * usePortfolioContext
 *
 * Custom hook to access PortfolioContext values.
 *
 * @returns {{
 *  activeTab: string,
 *  setActiveTab: function,
 *  uploadPortfolioModal: boolean,
 *  setUploadPortfolioModal: function,
 *  employeePendingApprovalsData: { data: Array, totalRecords: number, apiCall: boolean },
 *  setEmployeePendingApprovalsData: function,
 *  employeePendingApprovalsDataMqtt: { data: Array, mqtt: boolean },
 *  setEmployeePendingApprovalsDataMqtt: function,
 *  employeePortfolioData: { data: Array, totalRecords: number, apiCall: boolean },
 *  setEmployeePortfolioData: function,
 *  employeePortfolioDataMqtt: { data: Array, mqtt: boolean },
 *  setEmployeePortfolioDataMqtt: function,
 *  aggregateTotalQuantity: number,
 *  setAggregateTotalQuantity: function,
 *  resetPortfolioTab: function,
 *  resetPendingApprovalTab: function
 * }}
 *
 * @throws {Error} If used outside of PortfolioProvider.
 */
export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error(
      "usePortfolioContext must be used within a PortfolioProvider"
    );
  }
  return context;
};
