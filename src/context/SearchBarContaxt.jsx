import React, { createContext, useContext, useState } from "react";

/**
 * 🔎 SearchBarContext
 *
 * Centralized state management for all **search & filter bars** used across:
 * - Employee (My Approval, My Transactions, Portfolio, Pending Approval, My History)
 * - Line Manager Approvals
 * - Compliance Officer Reconciliation (Transactions & Portfolio)
 *
 * Provides state + helper functions to update or reset filters.
 */
export const SearchBarContext = createContext();

/**
 * 🚀 SearchBarProvider
 *
 * Wrap your components inside `<SearchBarProvider>` to give them access
 * to global search/filter states and reset functions.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - React children that consume the context.
 * @returns {JSX.Element} Context provider wrapping child components.
 */
export const SearchBarProvider = ({ children }) => {
  /**
   * ===============================
   * Employee Context States
   * ===============================
   */

  /**
   * 🔍 Employee My Approval Filters State
   *
   * Used for filtering data in the Employee My Approval table.
   */
  const [employeeMyApprovalSearch, setEmployeeMyApprovalSearch] = useState({
    instrumentName: "",
    quantity: "",
    startDate: null,
    mainInstrumentName: "",
    type: [], // e.g. ["Buy", "Sell"]
    status: [], // e.g. ["Pending", "Approved"]
    pageSize: 0,
    pageNumber: 0,
    totalRecords: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  /**
   * 🔍 Employee My Transaction Filters State
   *
   * Used for filtering data in the Employee My Transaction table.
   */
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

  /**
   * 🔍 Employee Portfolio Filters State
   *
   * Used for filtering data in the Employee Portfolio table.
   */
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

  /**
   * 🔍 Employee Pending Approval Filters State
   *
   * Used for filtering data in the Employee Pending Approval table.
   */
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

  /**
   * 🔍 Employee My History Filters State
   *
   * Used for filtering data in the Employee My History table.
   */
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

  /**
   * ===============================
   * Line Manager Context State
   * ===============================
   */

  /**
   * 🔍 Line Manager Approval Request Filters State
   *
   * Used for filtering data in the Line-Manager Approval Request table.
   */
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

  /**
   * ===============================
   * Compliance Officer Context States
   * ===============================
   */

  /**
   * 🔍 Compliance Officer Reconcile Transactions Filters State
   *
   * Used for filtering data in the Compliance Officer’s Reconcile Transactions table.
   */
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

  /**
   * 🔍 Compliance Officer Reconcile Portfolio Filters State
   *
   * Used for filtering data in the Compliance Officer’s Reconcile Portfolio table.
   */
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

  /**
   * ===============================
   * Reset Helpers
   * ===============================
   */

  // Each helper resets a filter state to its initial defaults
  const resetEmployeeMyApprovalSearch = () =>
    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
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
    }));

  const resetEmployeeMyTransactionSearch = () =>
    setEmployeeMyTransactionSearch((prev) => ({
      ...prev,
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
    }));

  const resetEmployeePortfolioSearch = () =>
    setEmployeePortfolioSearch((prev) => ({
      ...prev,
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
    }));

  const resetEmployeePendingApprovalSearch = () =>
    setEmployeePendingApprovalSearch((prev) => ({
      ...prev,
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
    }));

  const resetEmployeeMyHistorySearch = () =>
    setEmployeeMyHistorySearch((prev) => ({
      ...prev,
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
    }));

  const resetLineManagerApprovalSearch = () =>
    setLineManagerApprovalSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      date: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      pageSize: 0,
      pageNumber: 0,
      quantity: 0,
      totalRecords: 0,
      filterTrigger: true,
      tableFilterTrigger: false,
    }));

  const resetComplianceOfficerReconcileTransactionsSearch = () =>
    setComplianceOfficerReconcileTransactionsSearch((prev) => ({
      ...prev,
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
    }));

  const resetComplianceOfficerReconcilePortfoliosSearch = () =>
    setComplianceOfficerReconcilePortfolioSearch((prev) => ({
      ...prev,
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
    }));

  /**
   * 🔄 Reset ALL search filters across modules
   */
  const resetSearchBarContextState = () => {
    resetEmployeeMyApprovalSearch();
    resetEmployeeMyTransactionSearch();
    resetEmployeePortfolioSearch();
    resetEmployeePendingApprovalSearch();
    resetEmployeeMyHistorySearch();
    resetLineManagerApprovalSearch();
    resetComplianceOfficerReconcileTransactionsSearch();
    resetComplianceOfficerReconcilePortfoliosSearch();
  };

  /**
   * 🌍 Provide context values
   */
  return (
    <SearchBarContext.Provider
      value={{
        // Employee states
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

        // Line Manager state
        lineManagerApprovalSearch,
        setLineManagerApprovalSearch,
        resetLineManagerApprovalSearch,

        // Compliance Officer states
        complianceOfficerReconcileTransactionsSearch,
        setComplianceOfficerReconcileTransactionsSearch,
        resetComplianceOfficerReconcileTransactionsSearch,

        complianceOfficerReconcilePortfolioSearch,
        setComplianceOfficerReconcilePortfolioSearch,
        resetComplianceOfficerReconcilePortfoliosSearch,

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
 * Custom hook for accessing `SearchBarContext`.
 *
 * @returns {object} Context values: all filter states, setters, and reset helpers.
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
