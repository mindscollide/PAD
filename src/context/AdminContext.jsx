import React, { createContext, useContext, useState } from "react";

/**
 * 📌 MyAdminContext
 *
 * Centralized context for managing:
 * - API-driven Admin data
 * - Real-time Admin updates (via MQTT) for **table** and **modal** views
 */
const MyAdminContext = createContext();

/**
 * 🏦 MyAdminProvider
 *
 * Provides Admin-related states and actions to its child components.
 * Wrap your app (or specific parts of it) with this provider to access:
 *
 * - Admin data (from API)
 * - Table updates from MQTT
 * - Modal updates from MQTT
 * - Reset functions for clearing context state
 *
 * @component
 * @example
 * return (
 *   <MyAdminProvider>
 *     <MyComponent />
 *   </MyAdminProvider>
 * );
 */
export const MyAdminProvider = ({ children }) => {
  /**
   * 🔹 State: Admin Data (from API)
   *
   * - `data`: All Admin retrieved from API
   * - `totalRecords`: Total count of records
   * - `apiCall`: Flag for tracking if API was recently called
   */

  // context for admin  getting brokers
  const [adminBrokerData, setAdminBrokerData] = useState({
    brokers: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });
  const [adminBrokerMqtt, setAdminBrokerMqtt] = useState(false);

  // context for admin  getting Instruments
  const [adminIntrumentsData, setAdminIntrumentsData] = useState({
    intruments: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  const [adminIntrumentsMqtt, setAdminIntrumentsMqtt] = useState(false);

  // context for admin  getting Gropus And Policy
  const [adminGropusAndPolicyData, setAdminGropusAndPolicyData] = useState({
    groupsAndPolicy: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  const [adminGropusAndPolicyMqtt, setAdminGropusAndPolicyMqtt] =
    useState(false);

  // this is use for open new page to add create and edit
  const [
    openNewFormForAdminGropusAndPolicy,
    setOpenNewFormForAdminGropusAndPolicy,
  ] = useState(false);

  // this is use for to set view of  page to add create and edit
  // 0 create
  // 1 edit
  // 2 view
  const [pageTypeForAdminGropusAndPolicy, setPageTypeForAdminGropusAndPolicy] =
    useState(0);

  // this is use for which tab is open currently
  // 0 details
  // 1 policy
  // 2 user
  const [pageTabesForAdminGropusAndPolicy, setPageTabeForAdminGropusAndPolicy] =
    useState(0);

  // All tabs data
  const [
    tabesFormDataofAdminGropusAndPolicy,
    setTabesFormDataofAdminGropusAndPolicy,
  ] = useState({
    details: {
      groupTitle: "",
      groupDiscription: "",
    },
    policies: [],
    users: [],
  });

  // set all policies list on policies tab data
  const [
    adminGroupeAndPoliciesPoliciesTabData,
    setAdminGroupeAndPoliciesPoliciesTabData,
  ] = useState([]);

  // set all policies list on policies tab data
  const [
    adminGroupeAndPoliciesUsersTabData,
    setAdminGroupeAndPoliciesUsersTabData,
  ] = useState({
    employees: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });
  // For add and Delete Mqtt when User add in Edit Modal or Delete in Edit Instrument Modal
  const [adminAddDeleteClosingInstrument, setAdminAddDeleteClosingInstrument] =
    useState(false);

  // context for admin role while edit button hit for upcoming Closing Data
  const [
    adminInstrumentUpcomingClosingData,
    setAdminInstrumentUpcomingClosingData,
  ] = useState({
    closingPeriods: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  // context for admin role while edit button hit for Previous Closing Data
  const [
    adminInstrumentPreviousClosingData,
    setAdminInstrumentPreviousClosingData,
  ] = useState({
    closingPeriods: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  const [selectedInstrumentOnClick, setSelectedInstrumentOnClick] =
    useState(null);

  // this state for setOpen tab of manage users
  // 0 users tab
  // 1 pending Request
  // 2 rejected request
  const [manageUsersTab, setManageUsersTab] = useState("0");
  // manage user pending tab data
  const [manageUsersPendingTabData, setManageUsersPendingTabData] = useState(
    []
  );

  /**
   * ♻️ Reset Context State (Table + API Data)
   *
   * Clears table MQTT updates and resets API Admin data
   * back to initial state. Useful when navigating away from
   * Admin view or logging out.
   */
  const resetAdminBrokersDataContextState = () => {
    setAdminBrokerData({
      brokers: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
    setAdminBrokerMqtt(false);
  };

  const resetAdminInstrumentsContextState = () => {
    setAdminIntrumentsData({
      intruments: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
    setAdminIntrumentsMqtt(false);
  };
  // its rest all data of groupe list page
  const resetAdminGropusAndPolicyListContextState = () => {
    setAdminGropusAndPolicyData({
      groupsAndPolicy: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
    setAdminGropusAndPolicyMqtt(false);
  };

  const resetAdminGroupeAndPoliciesPoliciesTabDataState = () => {
    setAdminGroupeAndPoliciesPoliciesTabData([]);
  };

  const resetAdminGroupeAndPoliciesUsersTabDataState = () => {
    setAdminGroupeAndPoliciesUsersTabData({
      employees: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  // its for view edit and create data comming from get or seting data init
  const resetAdminGropusAndPolicyContextState = () => {
    setOpenNewFormForAdminGropusAndPolicy(false);
    setPageTypeForAdminGropusAndPolicy(0);
    setPageTabeForAdminGropusAndPolicy(0);
    setTabesFormDataofAdminGropusAndPolicy({
      details: {
        groupTitle: "",
        groupDiscription: "",
      },
      policies: [],
      users: [],
    });
    setAdminGroupeAndPoliciesPoliciesTabData();
    resetAdminGroupeAndPoliciesUsersTabDataState();
  };

  // reset manage user tab data
  const resetmanageUsersPendingTabDataState = () => {
    setManageUsersPendingTabData([]);
  };

  // rest Contaxt of manager tab data
  const resetmanageUsersContextState = () => {
    setManageUsersTab("0");
    resetmanageUsersPendingTabDataState();
  };

  const resetAdminDataContextState = () => {
    // intruments
    resetAdminInstrumentsContextState();

    // brokers
    resetAdminBrokersDataContextState();

    // Groups and Policy
    resetAdminGropusAndPolicyListContextState();
    // Groups and Policy new add edit view page
    resetAdminGropusAndPolicyContextState();

    resetAdminGroupeAndPoliciesPoliciesTabDataState();

    // manageUsers tab
    resetmanageUsersContextState();
    //
  };

  return (
    <MyAdminContext.Provider
      value={{
        // this for all state reset
        resetAdminDataContextState,

        // Admin Instruments (API)
        adminIntrumentsData,
        setAdminIntrumentsData,
        adminIntrumentsMqtt,
        setAdminIntrumentsMqtt,
        resetAdminInstrumentsContextState,
        //For Upcoming Closing Data
        adminInstrumentUpcomingClosingData,
        setAdminInstrumentUpcomingClosingData,
        //For Previous Closing Data
        adminInstrumentPreviousClosingData,
        setAdminInstrumentPreviousClosingData,
        selectedInstrumentOnClick,
        setSelectedInstrumentOnClick,

        // Add and Delete Mqtt on Edit Modal of Instrument
        adminAddDeleteClosingInstrument,
        setAdminAddDeleteClosingInstrument,

        // Admin Broker (API)
        adminBrokerData,
        setAdminBrokerData,
        adminBrokerMqtt,
        setAdminBrokerMqtt,
        resetAdminBrokersDataContextState,

        // Group And Policy
        adminGropusAndPolicyData,
        setAdminGropusAndPolicyData,
        adminGropusAndPolicyMqtt,
        setAdminGropusAndPolicyMqtt,
        resetAdminGropusAndPolicyListContextState,

        resetAdminGropusAndPolicyContextState,
        setOpenNewFormForAdminGropusAndPolicy,
        openNewFormForAdminGropusAndPolicy,
        setPageTypeForAdminGropusAndPolicy,
        pageTypeForAdminGropusAndPolicy,
        setPageTabeForAdminGropusAndPolicy,
        pageTabesForAdminGropusAndPolicy,

        // All tabs Data of Group and Policy
        tabesFormDataofAdminGropusAndPolicy,
        setTabesFormDataofAdminGropusAndPolicy,

        resetAdminGroupeAndPoliciesPoliciesTabDataState,
        adminGroupeAndPoliciesPoliciesTabData,
        setAdminGroupeAndPoliciesPoliciesTabData,

        resetAdminGroupeAndPoliciesUsersTabDataState,
        adminGroupeAndPoliciesUsersTabData,
        setAdminGroupeAndPoliciesUsersTabData,

        // manageUsers tab
        manageUsersTab,
        setManageUsersTab,
        resetmanageUsersContextState,

        // manage users pending data tab
        manageUsersPendingTabData,
        setManageUsersPendingTabData,
        resetmanageUsersPendingTabDataState,
      }}
    >
      {children}
    </MyAdminContext.Provider>
  );
};

/**
 * 🔗 useMyAdmin
 *
 * Custom hook for accessing MyAdminContext.

 *
 * @example
 * const {
 *   adminBrokerData,
 *   setAdminBrokerData,
 
 * } = useMyAdmin();
 */
export const useMyAdmin = () => useContext(MyAdminContext);
