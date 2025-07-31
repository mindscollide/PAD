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
    date: null, // Single date (could be Date object or string)
    mainInstrumentName: "", // Main instrument name for popover or modal
    type: [], // Type filter: ["Buy", "Sell"]
    status: [], // Status filter: ["Pending", "Approved", etc.]
    pageSize: "", // Pagination: size of page
    pageNumber: "", // Pagination: current page number
    filterTrigger: false,
  });

  /**
   * 🔍 Employee My Transaction Filters State
   * Used for filtering data in the Employee My Transaction table.
   */
  const [employeeMyTransactionSearch, setEmployeeMyTransactionSearch] =
    useState({
      instrumentName: "", // Name of the instrument
      quantity: "", // Quantity filter
      startDate: null, // Start of date range
      endDate: null, // End of date range
      mainInstrumentName: "", // Main instrument name for popover or modal
      type: [], // Type filter: ["Buy", "Sell"]
      status: [], // Status filter: ["Pending", "Approved", etc.]
      broker:[],
      pageSize: "", // Pagination: size of page
      pageNumber: "", // Pagination: current page number
      filterTrigger: false,
    });

  /**
   * 🔍 Employee Portfolio Filters State
   * Used for filtering data in the Employee Portfolio table.
   */
  const [employeePortfolioSearch, setEmployeePortfolioSearch] = useState({
    instrumentShortName: "", // Name of the instrument short
    quantity: "", // Quantity filter
    startDate: null, // Start of date range
    endDate: null, // End of date range
    mainInstrumentShortName: "", // Main instrument short name for popover or modal
    type: [], // Type filter: ["Buy", "Sell"]
    broker: [], // broker filter:
    pageSize: "", // Pagination: size of page
    pageNumber: "", // Pagination: current page number
    filterTrigger: false,
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
      pageNumber: "", // Pagination: current page number
      filterTrigger: false,
    });


    
  /**
   * 🔁 Helper: Reset all Employee My Approval filters to initial state
   */
  const resetEmployeeMyApprovalSearch = () => {
    setEmployeeMyApprovalSearch({
      instrumentName: "",
      quantity: "",
      date: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      pageSize: "",
      pageNumber: "",
      filterTrigger: true,
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
      broker:[],
      pageSize: "",
      pageNumber: "",
      filterTrigger: true,
    });
  };

  /**
   * 🔁 Helper: Reset all Employee portfolio filters to initial state
   */
  const resetEmployeePortfolioSearch = () => {
    setEmployeePortfolioSearch({
      instrumentShortName: "", // Name of the instrument short
      quantity: "", // Quantity filter
      startDate: null, // Start of date range
      endDate: null, // End of date range
      mainInstrumentShortName: "", // Main instrument short name for popover or modal
      type: [], // Type filter: ["Buy", "Sell"]
      broker: [], // broker filter:
      pageSize: "", // Pagination: size of page
      pageNumber: "", // Pagination: current page number
      filterTrigger: true,
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
      pageNumber: "",
      filterTrigger: true,
    });
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
