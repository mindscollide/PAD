import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * ReconcileContext
 *
 * Global context for managing the **Compliance Officer Reconciliation** and
 * **Head of Compliance Officer (HCO)** workflows:
 *
 * - Active tab states (Compliance Officer + HCO)
 * - Modal states (Transactions + Portfolio)
 * - Data sources (API + MQTT updates)
 * - View detail states
 * - Reset utilities for clearing state
 * - Aggregate totals (e.g., portfolio quantities)
 */
export const ReconcileContext = createContext();

/**
 * ReconcileProvider
 *
 * Wraps the reconciliation module with state and actions for:
 * - Compliance Officer reconciliation (Transactions + Portfolio)
 * - Head of Compliance Officer approvals and escalations
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - Components that consume this context.
 * @returns {JSX.Element} Provider exposing reconciliation state and utilities.
 */
export const ReconcileProvider = ({ children }) => {
  // ───────────────────────────────
  // Compliance Officer State
  // ───────────────────────────────

  /** Active tab inside the Compliance Officer reconciliation module. */
  const [activeTab, setActiveTab] = useState("transactions");
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab; // keep ref updated with latest tab
  }, [activeTab]);

  /** Controls visibility of the Compliance Officer Transaction modal. */
  const [
    complianceOfficerReconcileTransactionModal,
    setComplianceOfficerReconcileTransactionModal,
  ] = useState(false);

  /** Controls visibility of the Compliance Officer Portfolio modal. */
  const [
    complianceOfficerReconcilePortfolioModal,
    setComplianceOfficerReconcilePortfolioModal,
  ] = useState(false);

  /** API + MQTT data for Compliance Officer Transactions. */
  const [
    complianceOfficerReconcileTransactionData,
    setComplianceOfficerReconcileTransactionData,
  ] = useState({ data: [], totalRecords: 0, apiCall: false });

  /** Stores the latest MQTT update for Compliance Officer Transactions. */
  const [
    complianceOfficerReconcileTransactionDataMqtt,
    setComplianceOfficerReconcileTransactionDataMqtt,
  ] = useState(false);

  /** API + MQTT data for Compliance Officer Portfolio. */
  const [
    complianceOfficerReconcilePortfolioData,
    setComplianceOfficerReconcilePortfolioData,
  ] = useState({ data: [], totalRecords: 0, apiCall: false });

  /** Stores the latest MQTT update for Compliance Officer Portfolio. */
  const [
    complianceOfficerReconcilePortfolioDataMqtt,
    setComplianceOfficerReconcilePortfolioDataMqtt,
  ] = useState(false);

  /** Data for viewing detailed information of a transaction. */
  const [
    reconcileTransactionViewDetailData,
    setReconcileTransactionViewDetailData,
  ] = useState({
    details: [],
    assetTypes: [],
    hierarchyDetails: [],
    workFlowStatus: {},
    tradedWorkFlowReqeust: [],
    ticketUploaded: false,
    reqeusterName: "",
  });

  /** Aggregate portfolio quantity for Compliance Officer. */
  //To get the selected data by clicking on View Detail of reconcile Transaction
  const [
    selectedReconcileTransactionData,
    setSelectedReconcileTransactionData,
  ] = useState(null);

  /**
   * Aggregate total quantity across all reconcile portfolio holdings.
   *
   * @type {[number, function]}
   */
  const [aggregateTotalQuantity, setAggregateTotalQuantity] = useState(0);

  // ───────────────────────────────
  // Head of Compliance Officer (HCO) State
  // ───────────────────────────────

  /** Active tab inside the HCO reconciliation module. */
  const [activeTabHCO, setActiveTabHCO] = useState("escalated");
  const activeTabHCORef = useRef(activeTabHCO);

  useEffect(() => {
    activeTabHCORef.current = activeTabHCO; // keep ref updated with latest tab
  }, [activeTabHCO]);

  /** API + MQTT data for HCO portfolio approvals. */
  const [
    headOfComplianceApprovalPortfolioData,
    setHeadOfComplianceApprovalPortfolioData,
  ] = useState({ data: [], totalRecords: 0, apiCall: false });

  /** Stores the latest MQTT update for HCO portfolio approvals. */
  const [
    headOfComplianceApprovalPortfolioMqtt,
    setHeadOfComplianceApprovalPortfolioMqtt,
  ] = useState(false);

  /** API + MQTT data for HCO escalated verifications. */
  const [
    headOfComplianceApprovalEscalatedVerificationsData,
    setHeadOfComplianceApprovalEscalatedVerificationsData,
  ] = useState({ data: [], totalRecords: 0, apiCall: false });

  /** Stores the latest MQTT update for HCO escalated verifications. */
  const [
    headOfComplianceApprovalEscalatedVerificationsMqtt,
    setHeadOfComplianceApprovalEscalatedVerificationsMqtt,
  ] = useState(false);

  // ───────────────────────────────
  // Reset Utilities
  // ───────────────────────────────

  /** Reset the Compliance Officer Portfolio tab (API + MQTT + totals). */
  const resetComplianceOfficerReconcilePortfolioTab = () => {
    setActiveTab("Transactions");
    setComplianceOfficerReconcilePortfolioData({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });
    setComplianceOfficerReconcilePortfolioDataMqtt(false);
    setAggregateTotalQuantity(0);
  };

  /** Reset the Compliance Officer Transactions tab (API + MQTT). */
  const resetComplianceOfficerReconcileTransactionTab = () => {
    setActiveTab("Transactions");
    setComplianceOfficerReconcileTransactionData({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });
    setComplianceOfficerReconcileTransactionDataMqtt(false);
  };

  /** Reset the HCO Portfolio Approvals tab (API + MQTT). */
  const resetHeadOfComplianceApprovalPortfolioTab = () => {
    setActiveTabHCO("portfolio");
    setHeadOfComplianceApprovalPortfolioData({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });
    setHeadOfComplianceApprovalPortfolioMqtt(false);
  };

  /** Reset the HCO Escalated Verifications tab (API + MQTT). */
  const resetHeadOfComplianceApprovalEscalatedVerificationsTab = () => {
    setActiveTabHCO("escalated");
    setHeadOfComplianceApprovalEscalatedVerificationsData({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });
    setHeadOfComplianceApprovalEscalatedVerificationsMqtt(false);
  };

  return (
    <ReconcileContext.Provider
      value={{
        // Compliance Officer Tabs
        activeTab,
        activeTabRef,
        setActiveTab,

        // Compliance Officer Modals
        complianceOfficerReconcileTransactionModal,
        setComplianceOfficerReconcileTransactionModal,
        complianceOfficerReconcilePortfolioModal,
        setComplianceOfficerReconcilePortfolioModal,

        // Compliance Officer Transactions
        complianceOfficerReconcileTransactionData,
        setComplianceOfficerReconcileTransactionData,
        complianceOfficerReconcileTransactionDataMqtt,
        setComplianceOfficerReconcileTransactionDataMqtt,
        resetComplianceOfficerReconcileTransactionTab,

        // Compliance Officer Portfolio
        complianceOfficerReconcilePortfolioData,
        setComplianceOfficerReconcilePortfolioData,
        complianceOfficerReconcilePortfolioDataMqtt,
        setComplianceOfficerReconcilePortfolioDataMqtt,
        resetComplianceOfficerReconcilePortfolioTab,

        // Head of Compliance Officer (HCO)
        activeTabHCO,
        setActiveTabHCO,
        activeTabHCORef,
        headOfComplianceApprovalPortfolioData,
        setHeadOfComplianceApprovalPortfolioData,
        headOfComplianceApprovalPortfolioMqtt,
        setHeadOfComplianceApprovalPortfolioMqtt,
        headOfComplianceApprovalEscalatedVerificationsData,
        setHeadOfComplianceApprovalEscalatedVerificationsData,
        headOfComplianceApprovalEscalatedVerificationsMqtt,
        setHeadOfComplianceApprovalEscalatedVerificationsMqtt,
        resetHeadOfComplianceApprovalPortfolioTab,
        resetHeadOfComplianceApprovalEscalatedVerificationsTab,

        // Shared Totals
        aggregateTotalQuantity,
        setAggregateTotalQuantity,

        // View detail
        reconcileTransactionViewDetailData,
        setReconcileTransactionViewDetailData,

        selectedReconcileTransactionData,
        setSelectedReconcileTransactionData,
      }}
    >
      {children}
    </ReconcileContext.Provider>
  );
};

/**
 * useReconcileContext
 *
 * Custom hook for consuming `ReconcileContext`.
 *
 * @returns {object} All reconciliation state and setters.
 * @throws {Error} If used outside of a `ReconcileProvider`.
 */
export const useReconcileContext = () => {
  const context = useContext(ReconcileContext);
  if (!context) {
    throw new Error(
      "useReconcileContext must be used within a ReconcileProvider"
    );
  }
  return context;
};
