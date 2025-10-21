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

  // context for admin role while getting brokers
  const [adminBrokerData, setAdminBrokerData] = useState({
    brokers: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });
  const [adminBrokerMqtt, setAdminBrokerMqtt] = useState(false);

  // context for admin role while getting Instruments
  const [adminIntrumentsData, setAdminIntrumentsData] = useState({
    intruments: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });
  const [adminIntrumentsMqtt, setAdminIntrumentsMqtt] = useState(false);

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
  const resetAdminDataContextState = () => {
    // intruments
    setAdminBrokerData({
      brokers: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
    setAdminBrokerMqtt(false);

    // brokers
    setAdminIntrumentsData({
      intruments: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
    setAdminIntrumentsMqtt(false);
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
        
        // Admin Broker (API)
        adminBrokerData,
        setAdminBrokerData,
        adminBrokerMqtt,
        setAdminBrokerMqtt,
        resetAdminBrokersDataContextState,
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
