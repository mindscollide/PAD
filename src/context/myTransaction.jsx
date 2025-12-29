import React, { createContext, useContext, useState } from "react";

/**
 * 📌 MyTransactionsContext
 *
 * Centralized context for managing:
 * - API-driven employee transactions data
 * - Real-time transaction updates (via MQTT) for **table** and **modal** views
 */
const MyTransactionsContext = createContext();

/**
 * 🏦 MyTransactionsProvider
 *
 * Provides transaction-related states and actions to its child components.
 * Wrap your app (or specific parts of it) with this provider to access:
 *
 * - Transactions data (from API)
 * - Table updates from MQTT
 * - Modal updates from MQTT
 * - Reset functions for clearing context state
 *
 * @component
 * @example
 * return (
 *   <MyTransactionsProvider>
 *     <MyComponent />
 *   </MyTransactionsProvider>
 * );
 */
export const MyTransactionsProvider = ({ children }) => {
  /**
   * 🔹 State: Transactions Data (from API)
   *
   * - `data`: All transactions retrieved from API
   * - `totalRecords`: Total count of records
   * - `apiCall`: Flag for tracking if API was recently called
   */
  const [employeeTransactionsData, setEmployeeTransactionsData] = useState({
    transactions: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  //  emoployee reoprts of my trade approvals
  const [employeeMyTradeApprovalsData, setEmployeeMyTradeApprovalsData] =
    useState({
      myTradeApprovals: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });

  const [employeeMyTradeApprovalsMqtt, setEmployeeMyTradeApprovalMqtt] =
    useState(false);

  // Context STate to extract data from get All View Trade Approval which is show by click on View Detail
  const [
    employeeTransactionViewDetailData,
    setEmployeeTransactionViewDetailData,
  ] = useState({
    assetTypes: [],
    details: [],
    hierarchyList: [],
    hierarchyDetails: [],
    workFlowStatus: {},
    tradedWorkFlowReqeust: [],
    reqeusterName: "",
    ticketUploaded: false,
  });

  /**
   * 🔹 State: MQTT Updates (for Table)
   *
   * - `mqttRecivedData`: New transaction(s) received via MQTT
   * - `mqttRecived`: Boolean flag to indicate if new data arrived
   */
  const [
    employeeTransactionsTableDataMqtt,
    setEmployeeTransactionsTableDataMqtt,
  ] = useState(false);

  /**
   * 🔹 State: MQTT Updates (for Modal)
   *
   * - `mqttRecivedData`: New transaction(s) received via MQTT (for modal view)
   * - `mqttRecived`: Boolean flag to indicate if new data arrived
   */
  const [
    employeeTransactionsModalDataMqtt,
    setEmployeeTransactionsModalDataMqtt,
  ] = useState({
    mqttRecivedData: [],
    mqttRecived: false,
  });

  //  emoployee reoprts of my trade approvals
  const [hcoUploadedPortFolioData, setHCOUploadedPortFolioData] = useState({
    pendingPortfolios: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  const [hcoUploadedPortFolioDataMqtt, setHCOUploadedPortFolioDataMqtt] =
    useState(false);
  /**
   * ♻️ Reset Context State (Table + API Data)
   *
   * Clears table MQTT updates and resets API transaction data
   * back to initial state. Useful when navigating away from
   * transactions view or logging out.
   */
  const resetMyTransactionsContextState = () => {
    setEmployeeTransactionsTableDataMqtt({
      mqttRecivedData: [],
      mqttRecived: false,
    });
    setEmployeeTransactionsData({
      transactions: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  const resetMyTradeApprovalsState = () => {
    const [employeeMyTradeApprovalsData, setEmployeeMyTradeApprovalsData] =
      useState({
        myTradeApprovals: [],
        totalRecordsDataBase: 0,
        totalRecordsTable: 0,
      });

    const [employeeMyTradeApprovalsMqtt, setEmployeeMyTradeApprovalMqtt] =
      useState(false);
  };

  // REset state of report of hco uploaded portfolio
  const resetHCOUploadedPortFolioData = () => {
    setHCOUploadedPortFolioData({
      myTradeApprovals: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
    setHCOUploadedPortFolioDataMqtt(false);
  };

  /**
   * ♻️ Reset Modal Context State
   *
   * Clears only the modal MQTT updates, leaving API and table states intact.
   */
  const resetMyTransactionsModalDataContextState = () => {
    setEmployeeTransactionsModalDataMqtt({
      mqttRecivedData: [],
      mqttRecived: false,
    });
  };

  return (
    <MyTransactionsContext.Provider
      value={{
        // Transactions data (API)
        employeeTransactionsData,
        setEmployeeTransactionsData,

        // MQTT updates (table)
        employeeTransactionsTableDataMqtt,
        setEmployeeTransactionsTableDataMqtt,

        // MQTT updates (modal)
        employeeTransactionsModalDataMqtt,
        setEmployeeTransactionsModalDataMqtt,

        // Reset functions
        resetMyTransactionsContextState,
        resetMyTransactionsModalDataContextState,

        // View Detail
        employeeTransactionViewDetailData,
        setEmployeeTransactionViewDetailData,

        // emplouyee trpot my tarade approvals mqtt
        resetMyTradeApprovalsState,
        employeeMyTradeApprovalsData,
        setEmployeeMyTradeApprovalsData,
        employeeMyTradeApprovalsMqtt,
        setEmployeeMyTradeApprovalMqtt,

        // HCO  Uploaded PortFolio
        resetHCOUploadedPortFolioData,
        hcoUploadedPortFolioData,
        setHCOUploadedPortFolioData,
        hcoUploadedPortFolioDataMqtt,
        setHCOUploadedPortFolioDataMqtt,
      }}
    >
      {children}
    </MyTransactionsContext.Provider>
  );
};

/**
 * 🔗 useTransaction
 *
 * Custom hook for accessing MyTransactionsContext.
 *
 * @returns {{
 *   employeeTransactionsData: { data: Array, totalRecords: number, apiCall: boolean },
 *   setEmployeeTransactionsData: Function,
 *   employeeTransactionsTableDataMqtt: { mqttRecivedData: Array, mqttRecived: boolean },
 *   setEmployeeTransactionsTableDataMqtt: Function,
 *   employeeTransactionsModalDataMqtt: { mqttRecivedData: Array, mqttRecived: boolean },
 *   setEmployeeTransactionsModalDataMqtt: Function,
 *   resetMyTransactionsContextState: Function,
 *   resetMyTransactionsModalDataContextState: Function
 * }}
 *
 * @example
 * const {
 *   employeeTransactionsData,
 *   setEmployeeTransactionsData,
 *   employeeTransactionsTableDataMqtt,
 *   setEmployeeTransactionsTableDataMqtt,
 *   employeeTransactionsModalDataMqtt,
 *   setEmployeeTransactionsModalDataMqtt,
 *   resetMyTransactionsContextState,
 *   resetMyTransactionsModalDataContextState
 * } = useTransaction();
 */
export const useTransaction = () => useContext(MyTransactionsContext);
