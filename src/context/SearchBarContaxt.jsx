import React, { createContext, useContext, useState } from "react";

/**
 * 1. Create the SearchBarContext
 * This context is used to manage and share search filter state
 * across Employee My Approval and My Transaction components.
 */
export const SearchBarContext = createContext();

/**
 * 2. Provider Component
 * Wrap your components with <SearchBarProvider> to give them access
 * to the global search/filter state.
 */
export const SearchBarProvider = ({ children }) => {
  /**
   * 🔍 Employee My Approval Filters State
   * Used for filtering data in the Employee My Approval table.
   */
  const [employeeMyApprovalSearch, setEmployeeMyApprovalSearch] = useState({
    instrumentName: "", // Name of the instrument
    quantity: "", // Quantity filter
    startDate: null, // Single date (could be Date object or string)
    mainInstrumentName: "", // Main instrument name for popover or modal
    type: [], // Type filter: ["Buy", "Sell"]
    status: [], // Status filter: ["Pending", "Approved", etc.]
    pageSize: 0, // Pagination: size of page
    pageNumber: 0, // Pagination: current page number
    totalRecords: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  })

  console.log(employeeMyApprovalSearch, "employeeMyApprovalSearch")
  /**
   * 🔍 Employee My Transaction Filters State
   * Used for filtering data in the Employee My Transaction table.
   */
  const [employeeMyTransactionSearch, setEmployeeMyTransactionSearch] =
    useState({
      instrumentName: "", // Name of the instrument
      quantity: 0, // Quantity filter
      startDate: null, // Start of date range
      endDate: null, // End of date range
      mainInstrumentName: "", // Main instrument name for popover or modal
      type: [], // Type filter: ["Buy", "Sell"]
      status: [], // Status filter: ["Pending", "Approved", etc.]
      brokerIDs: [],
      pageSize: "", // Pagination: size of page
      pageNumber: 0, // Pagination: current page number
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /**
   * 🔍 Employee Portfolio Filters State
   * Used for filtering data in the Employee Portfolio table.
   */
  const [employeePortfolioSearch, setEmployeePortfolioSearch] = useState({
    instrumentName: "", // Name of the instrument short
    quantity: "", // Quantity filter
    startDate: null, // Start of date range
    endDate: null, // End of date range
    mainInstrumentName: "", // Main instrument short name for popover or modal
    type: [], // Type filter: ["Buy", "Sell"]
    broker: [], // broker filter:
    pageSize: "", // Pagination: size of page
    pageNumber: 0, // Pagination: current page number
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  /**
   * 🔍 Employee Pending Approval Filters State
   * Used for filtering data in the Employee Pending Approval table.
   */
  const [employeePendingApprovalSearch, setEmployeePendingApprovalSearch] =
    useState({
      instrumentName: "", // Name of the instrument
      quantity: "", // Quantity filter
      startDate: null, // Start of date range
      endDate: null, // End of date range
      mainInstrumentName: "", // Main instrument name for popover or modal
      type: [], // Type filter: ["Buy", "Sell"]
      status: [], // Status filter: ["Pending", "Approved", etc.]
      broker: [], // Status filter: ["Pending", "Approved", etc.]
      pageSize: "", // Pagination: size of page
      pageNumber: 0, // Pagination: current page number
      filterTrigger: false,
      tableFilterTrigger: false,
    });

  /**
   * 🔍 Employee My History Filters State
   * Used for filtering data in the Employee My History table.
   */
  const [employeeMyHistorySearch, setEmployeeMyHistorySearch] = useState({
    transactionid: "",
    instrumentName: "", // Name of the instrument
    quantity: 0, // Quantity filter
    startDate: null, // Start of date range
    endDate: null, // End of date range
    mainInstrumentName: "", // Main instrument name for popover or modal
    type: [], // Type filter: ["Buy", "Sell"]
    nature: [], // Type filter: ["Buy", "Sell"]
    status: [], // Status filter: ["Pending", "Approved", etc.]
    pageSize: 0, // Pagination: size of page
    pageNumber: 0, // Pagination: current page number
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  /**
   * 🔁 Helper: Reset all Employee My Approval filters to initial state
   */
  const resetEmployeeMyApprovalSearch = () => {
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
  };

  /**
   * 🔁 Helper: Reset all Employee My Transaction filters to initial state
   */
  const resetEmployeeMyTransactionSearch = () => {
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
  };

  /**
   * 🔁 Helper: Reset all Employee portfolio filters to initial state
   */
  const resetEmployeePortfolioSearch = () => {
    setEmployeePortfolioSearch({
      instrumentName: "", // Name of the instrument short
      quantity: "", // Quantity filter
      startDate: null, // Start of date range
      endDate: null, // End of date range
      mainInstrumentName: "", // Main instrument short name for popover or modal
      type: [], // Type filter: ["Buy", "Sell"]
      broker: [], // broker filter:
      pageSize: "", // Pagination: size of page
      pageNumber: 0, // Pagination: current page number
      filterTrigger: true,
      tableFilterTrigger: false,
    });
  };

  /**
   * 🔁 Helper: Reset all Employee My Transaction filters to initial state
   */
  const resetEmployeePendingApprovalSearch = () => {
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
  };

  /**
   * 🔁 Helper: Reset all Employee My History filters to initial state
   */
  const resetEmployeeMyHistorySearch = () => {
    setEmployeeMyHistorySearch({
      transactionid: "",
      instrumentName: "", // Name of the instrument
      quantity: 0, // Quantity filter
      startDate: null, // Start of date range
      endDate: null, // End of date range
      mainInstrumentName: "", // Main instrument name for popover or modal
      type: [], // Type filter: ["Buy", "Sell"]
      nature: [], // Type filter: ["Buy", "Sell"]
      status: [], // Status filter: ["Pending", "Approved", etc.]
      pageSize: "", // Pagination: size of page
      pageNumber: 0, // Pagination: current page number
      filterTrigger: true,
      tableFilterTrigger: false,
    });
  };

  /**
   * 🔍 Line-Manager Approval Request Filters State
   * Used for filtering data in the Line-Manager Approval Request table.
   */
  const [lineManagerApprovalSearch, setLineManagerApprovalSearch] = useState({
    instrumentName: "", // Name of the instrument
    requesterName: "", // requester Name filter
    date: null, // Single date (could be Date object or string)
    mainInstrumentName: "", // Main instrument name for popover or modal
    type: [], // Type filter: ["Buy", "Sell"]
    status: [], // Status filter: ["Pending", "Approved", etc.]
    pageSize: 0, // Pagination: size of page
    pageNumber: 0, // Pagination: current page number
    totalRecords: 0,
    filterTrigger: false,
    tableFilterTrigger: false,
  });

  /**
   * 🔁 Helper: Reset all Employee My Approval filters to initial state
   */
  const resetLineManagerApprovalSearch = () => {
    setLineManagerApprovalSearch({
      instrumentName: "",
      requesterName: "",
      date: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      pageSize: 0,
      pageNumber: 0,
      totalRecords: 0,
      filterTrigger: true,
      tableFilterTrigger: false,
    });
  };

  // 🔁 New helper: Reset ALL filters at once
  const resetSearchBarContextState = () => {
    resetEmployeeMyApprovalSearch();
    resetEmployeeMyTransactionSearch();
    resetEmployeePortfolioSearch();
    resetEmployeePendingApprovalSearch();
    resetEmployeeMyHistorySearch();
    resetLineManagerApprovalSearch();
  };

  /**
   * Provide state and actions to the component tree
   */
  return (
    <SearchBarContext.Provider
      value={{
        // Employee My Approval filters and updater
        employeeMyApprovalSearch,
        setEmployeeMyApprovalSearch,
        resetEmployeeMyApprovalSearch,

        // Employee My Transaction filters and updater
        employeeMyTransactionSearch,
        setEmployeeMyTransactionSearch,
        resetEmployeeMyTransactionSearch,

        // Employee My portfolio filters and updater
        employeePortfolioSearch,
        setEmployeePortfolioSearch,
        resetEmployeePortfolioSearch,

        // Employee Pending Approval filters and updater
        employeePendingApprovalSearch,
        setEmployeePendingApprovalSearch,
        resetEmployeePendingApprovalSearch,

        // Employee My History filters and updater
        employeeMyHistorySearch,
        setEmployeeMyHistorySearch,
        resetEmployeeMyHistorySearch,

        // This is For LineManager Approval
        lineManagerApprovalSearch,
        setLineManagerApprovalSearch,
        resetLineManagerApprovalSearch,

        resetSearchBarContextState,
      }}
    >
      {children}
    </SearchBarContext.Provider>
  );
};

/**
 * 3. Custom Hook: useSearchBarContext
 * This allows consuming components to access and update search state.
 * Must be used inside a <SearchBarProvider>.
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
