import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * 🔎 SearchBarContext
 *
 * Centralized state management for **search & filter bars** across:
 * - Employee (My Approval, My Transactions, Portfolio, Pending Approval, My History)
 * - Line Manager Approvals
 * - Compliance Officer Reconciliation (Transactions & Portfolio)
 * - Head of Compliance Approval (Portfolio & Escalated Verifications)
 *
 * Exposes filter state, refs (always-latest values), and reset helpers.
 */
export const SearchBarContext = createContext();

/**
 * 🚀 SearchBarProvider
 *
 * Wrap your app (or subtree) inside `<SearchBarProvider>` to give children
 * access to search/filter states and reset utilities via `useSearchBarContext`.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components that consume the context.
 * @returns {JSX.Element} Context provider.
 */
export const SearchBarProvider = ({ children }) => {
  // ===============================
  // Employee States
  // ===============================

  /** 🔍 Employee My Approval table filters */
  const [employeeMyApprovalSearch, setEmployeeMyApprovalSearch] = useState({
    instrumentName: "",
    quantity: "",
    startDate: null,
    mainInstrumentName: "",
    type: [],
    status: [],
    pageSize: 0,
    pageNumber: 0,
    totalRecords: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  /** 🔍 Employee My Transaction table filters */
  const [employeeMyTransactionSearch, setEmployeeMyTransactionSearch] =
    useState({
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      brokerIDs: [],
      pageSize: "",
      pageNumber: 0,
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /** 🔍 Employee Portfolio table filters */
  const [employeePortfolioSearch, setEmployeePortfolioSearch] = useState({
    instrumentName: "",
    quantity: "",
    startDate: null,
    endDate: null,
    mainInstrumentName: "",
    type: [],
    broker: [],
    pageSize: "",
    pageNumber: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  /** 🔍 Employee Pending Approval table filters */
  const [employeePendingApprovalSearch, setEmployeePendingApprovalSearch] =
    useState({
      instrumentName: "",
      quantity: "",
      startDate: null,
      endDate: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      broker: [],
      pageSize: "",
      pageNumber: 0,
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /** 🔍 Employee My History table filters */
  const [employeeMyHistorySearch, setEmployeeMyHistorySearch] = useState({
    transactionid: "",
    instrumentName: "",
    quantity: 0,
    startDate: null,
    endDate: null,
    mainInstrumentName: "",
    type: [],
    nature: [],
    status: [],
    pageSize: 0,
    pageNumber: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  // ===============================
  // Line Manager States
  // ===============================

  /** 🔍 Line Manager Approval Request filters */
  const [lineManagerApprovalSearch, setLineManagerApprovalSearch] = useState({
    instrumentName: "",
    requesterName: "",
    quantity: 0,
    date: null,
    mainInstrumentName: "",
    type: [],
    status: [],
    pageSize: 0,
    pageNumber: 0,
    totalRecords: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  // ===============================
  // Compliance Officer States
  // ===============================

  /** 🔍 Compliance Officer Reconcile Transactions filters */
  const [
    complianceOfficerReconcileTransactionsSearch,
    setComplianceOfficerReconcileTransactionsSearch,
  ] = useState({
    requesterName: "",
    mainInstrumentName: "",
    instrumentName: "",
    quantity: 0,
    startDate: null,
    endDate: null,
    type: [],
    status: [],
    pageSize: 0,
    pageNumber: 0,
    totalRecords: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  /** 🔍 Compliance Officer Reconcile Portfolio filters */
  const [
    complianceOfficerReconcilePortfolioSearch,
    setComplianceOfficerReconcilePortfolioSearch,
  ] = useState({
    requesterName: "",
    instrumentName: "",
    mainInstrumentName: "",
    quantity: 0,
    startDate: null,
    endDate: null,
    type: [],
    status: [],
    pageSize: 0,
    pageNumber: 0,
    totalRecords: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  // ===============================
  // Head of Compliance Approval (HCA) States
  // ===============================

  /** 🔍 HCA Portfolio filters */
  const [
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
  ] = useState({
    requesterName: "",
    instrumentName: "",
    mainInstrumentName: "",
    quantity: 0,
    startDate: null,
    endDate: null,
    type: [],
    status: [],
    pageSize: 0,
    pageNumber: 0,
    totalRecords: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  /** 🔍 HCA Escalated Verifications filters */
  const [
    headOfComplianceApprovalEscalatedVerificationsSearch,
    setHeadOfComplianceApprovalEscalatedVerificationsSearch,
  ] = useState({
    requesterName: "",
    instrumentName: "",
    mainInstrumentName: "",
    quantity: 0,
    requestDateFrom: null,
    requestDateTo: null,
    escalatedDateFrom: null,
    escalatedDateTo: null,
    type: [],
    status: [],
    pageSize: 0,
    pageNumber: 0,
    totalRecords: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  // ===============================
  // Sync Refs (Always-Latest Values)
  // ===============================
  const employeeMyApprovalSearchRef = useRef(employeeMyApprovalSearch);
  const employeeMyTransactionSearchRef = useRef(employeeMyTransactionSearch);
  const employeePortfolioSearchRef = useRef(employeePortfolioSearch);
  const employeePendingApprovalSearchRef = useRef(
    employeePendingApprovalSearch
  );
  const employeeMyHistorySearchRef = useRef(employeeMyHistorySearch);
  const lineManagerApprovalSearchRef = useRef(lineManagerApprovalSearch);
  const complianceOfficerReconcileTransactionsSearchRef = useRef(
    complianceOfficerReconcileTransactionsSearch
  );
  const complianceOfficerReconcilePortfolioSearchRef = useRef(
    complianceOfficerReconcilePortfolioSearch
  );
  const headOfComplianceApprovalPortfolioSearchRef = useRef(
    headOfComplianceApprovalPortfolioSearch
  );
  const headOfComplianceApprovalEscalatedVerificationsSearchRef = useRef(
    headOfComplianceApprovalEscalatedVerificationsSearch
  );

  // 🔄 Keep refs in sync with latest state
  useEffect(() => {
    employeeMyApprovalSearchRef.current = employeeMyApprovalSearch;
  }, [employeeMyApprovalSearch]);

  useEffect(() => {
    employeeMyTransactionSearchRef.current = employeeMyTransactionSearch;
  }, [employeeMyTransactionSearch]);

  useEffect(() => {
    employeePortfolioSearchRef.current = employeePortfolioSearch;
  }, [employeePortfolioSearch]);

  useEffect(() => {
    employeePendingApprovalSearchRef.current = employeePendingApprovalSearch;
  }, [employeePendingApprovalSearch]);

  useEffect(() => {
    employeeMyHistorySearchRef.current = employeeMyHistorySearch;
  }, [employeeMyHistorySearch]);

  useEffect(() => {
    lineManagerApprovalSearchRef.current = lineManagerApprovalSearch;
  }, [lineManagerApprovalSearch]);

  useEffect(() => {
    complianceOfficerReconcileTransactionsSearchRef.current =
      complianceOfficerReconcileTransactionsSearch;
  }, [complianceOfficerReconcileTransactionsSearch]);

  useEffect(() => {
    complianceOfficerReconcilePortfolioSearchRef.current =
      complianceOfficerReconcilePortfolioSearch;
  }, [complianceOfficerReconcilePortfolioSearch]);

  useEffect(() => {
    headOfComplianceApprovalPortfolioSearchRef.current =
      headOfComplianceApprovalPortfolioSearch;
  }, [headOfComplianceApprovalPortfolioSearch]);

  useEffect(() => {
    headOfComplianceApprovalEscalatedVerificationsSearchRef.current =
      headOfComplianceApprovalEscalatedVerificationsSearch;
  }, [headOfComplianceApprovalEscalatedVerificationsSearch]);

  // ===============================
  // Reset Helpers
  // ===============================

  /** Reset Employee My Approval filters */
  const resetEmployeeMyApprovalSearch = () =>
    setEmployeeMyApprovalSearch({
      instrumentName: "",
      quantity: 0,
      startDate: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      pageSize: 0,
      pageNumber: 0,
      totalRecords: 0,
      filterTrigger: true,
      tableFilterTrigger: false,
    });

  /** Reset Employee My Transaction filters */
  const resetEmployeeMyTransactionSearch = () =>
    setEmployeeMyTransactionSearch({
      instrumentName: "",
      quantity: "",
      startDate: null,
      endDate: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      brokerIDs: [],
      pageSize: "",
      pageNumber: 0,
      filterTrigger: true,
      tableFilterTrigger: false,
    });

  /** Reset Employee Portfolio filters */
  const resetEmployeePortfolioSearch = () =>
    setEmployeePortfolioSearch({
      instrumentName: "",
      quantity: "",
      startDate: null,
      endDate: null,
      mainInstrumentName: "",
      type: [],
      broker: [],
      pageSize: "",
      pageNumber: 0,
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /** Reset Employee Pending Approval filters */
  const resetEmployeePendingApprovalSearch = () =>
    setEmployeePendingApprovalSearch({
      instrumentName: "",
      quantity: "",
      startDate: null,
      endDate: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      broker: [],
      pageSize: "",
      pageNumber: 0,
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /** Reset Employee My History filters */
  const resetEmployeeMyHistorySearch = () =>
    setEmployeeMyHistorySearch({
      transactionid: "",
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      mainInstrumentName: "",
      type: [],
      nature: [],
      status: [],
      pageSize: "",
      pageNumber: 0,
      filterTrigger: true,
      tableFilterTrigger: false,
    });

  /** Reset Line Manager Approval filters */
  const resetLineManagerApprovalSearch = () =>
    setLineManagerApprovalSearch({
      instrumentName: "",
      requesterName: "",
      date: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      pageSize: 10,
      pageNumber: 0,
      quantity: 0,
      totalRecords: 0,
      filterTrigger: true,
      tableFilterTrigger: false,
    });

  /** Reset Compliance Officer Reconcile Transactions filters */
  const resetComplianceOfficerReconcileTransactionsSearch = () =>
    setComplianceOfficerReconcileTransactionsSearch({
      requesterName: "",
      instrumentName: "",
      mainInstrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      type: [],
      status: [],
      pageSize: 0,
      pageNumber: 0,
      totalRecords: 0,
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /** Reset Compliance Officer Reconcile Portfolio filters */
  const resetComplianceOfficerReconcilePortfoliosSearch = () =>
    setComplianceOfficerReconcilePortfolioSearch({
      requesterName: "",
      mainInstrumentName: "",
      instrumentName: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      type: [],
      status: [],
      pageSize: 0,
      pageNumber: 0,
      totalRecords: 0,
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /** Reset HCA Portfolio filters */
  const resetHeadOfComplianceApprovalPortfolioSearch = () =>
    setHeadOfComplianceApprovalPortfolioSearch({
      requesterName: "",
      instrumentName: "",
      mainInstrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      type: [],
      status: [],
      pageSize: 0,
      pageNumber: 0,
      totalRecords: 0,
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /** Reset HCA Escalated Verifications filters */
  const resetHeadOfComplianceApprovalEscalatedVerificationsSearch = () =>
    setHeadOfComplianceApprovalEscalatedVerificationsSearch({
      requesterName: "",
      instrumentName: "",
      mainInstrumentName: "",
      quantity: 0,
      requestDateFrom: null,
      requestDateTo: null,
      escalatedDateFrom: null,
      escalatedDateTo: null,
      type: [],
      status: [],
      pageSize: 0,
      pageNumber: 0,
      totalRecords: 0,
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /** Reset all filters across modules */
  const resetSearchBarContextState = () => {
    resetEmployeeMyApprovalSearch();
    resetEmployeeMyTransactionSearch();
    resetEmployeePortfolioSearch();
    resetEmployeePendingApprovalSearch();
    resetEmployeeMyHistorySearch();
    resetLineManagerApprovalSearch();
    resetComplianceOfficerReconcileTransactionsSearch();
    resetComplianceOfficerReconcilePortfoliosSearch();
    resetHeadOfComplianceApprovalPortfolioSearch();
    resetHeadOfComplianceApprovalEscalatedVerificationsSearch();
  };

  // ===============================
  // Context Provider Value
  // ===============================
  return (
    <SearchBarContext.Provider
      value={{
        // Employee
        employeeMyApprovalSearch,
        setEmployeeMyApprovalSearch,
        resetEmployeeMyApprovalSearch,
        employeeMyTransactionSearch,
        setEmployeeMyTransactionSearch,
        resetEmployeeMyTransactionSearch,
        employeePortfolioSearch,
        setEmployeePortfolioSearch,
        resetEmployeePortfolioSearch,
        employeePendingApprovalSearch,
        setEmployeePendingApprovalSearch,
        resetEmployeePendingApprovalSearch,
        employeeMyHistorySearch,
        setEmployeeMyHistorySearch,
        resetEmployeeMyHistorySearch,

        // Line Manager
        lineManagerApprovalSearch,
        setLineManagerApprovalSearch,
        resetLineManagerApprovalSearch,

        // Compliance Officer
        complianceOfficerReconcileTransactionsSearch,
        setComplianceOfficerReconcileTransactionsSearch,
        resetComplianceOfficerReconcileTransactionsSearch,
        complianceOfficerReconcilePortfolioSearch,
        setComplianceOfficerReconcilePortfolioSearch,
        resetComplianceOfficerReconcilePortfoliosSearch,

        // Head of Compliance Approval
        headOfComplianceApprovalPortfolioSearch,
        setHeadOfComplianceApprovalPortfolioSearch,
        resetHeadOfComplianceApprovalPortfolioSearch,
        headOfComplianceApprovalEscalatedVerificationsSearch,
        setHeadOfComplianceApprovalEscalatedVerificationsSearch,
        resetHeadOfComplianceApprovalEscalatedVerificationsSearch,

        // Always-latest refs
        employeeMyApprovalSearchRef,
        employeeMyTransactionSearchRef,
        employeePortfolioSearchRef,
        employeePendingApprovalSearchRef,
        employeeMyHistorySearchRef,
        lineManagerApprovalSearchRef,
        complianceOfficerReconcileTransactionsSearchRef,
        complianceOfficerReconcilePortfolioSearchRef,
        headOfComplianceApprovalPortfolioSearchRef,
        headOfComplianceApprovalEscalatedVerificationsSearchRef,

        // Global reset
        resetSearchBarContextState,
      }}
    >
      {children}
    </SearchBarContext.Provider>
  );
};

/**
 * 🪝 useSearchBarContext
 *
 * Hook to consume the `SearchBarContext`.
 *
 * @returns {object} Context values: all filter states, setters, reset helpers, and refs.
 * @throws {Error} If used outside of a `<SearchBarProvider>`.
 */
export const useSearchBarContext = () => {
  const context = useContext(SearchBarContext);
  if (!context) {
    throw new Error(
      "useSearchBarContext must be used within a SearchBarProvider"
    );
  }
  return context;
};
