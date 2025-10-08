import React, { createContext, useContext, useState } from "react";

/**
 * 📌 MyNotificationContext
 *
 * Centralized context for managing:
 * - API-driven employee Notification data
 * - Real-time Notification updates (via MQTT) for **table** and **modal** views
 */
const MyNotificationContext = createContext();

/**
 * 🏦 MyNotificationProvider
 *
 * Provides Notification-related states and actions to its child components.
 * Wrap your app (or specific parts of it) with this provider to access:
 *
 * - Notification data (from API)
 * - Table updates from MQTT
 * - Modal updates from MQTT
 * - Reset functions for clearing context state
 *
 * @component
 * @example
 * return (
 *   <MyNotificationProvider>
 *     <MyComponent />
 *   </MyNotificationProvider>
 * );
 */
export const MyNotificationProvider = ({ children }) => {
  /**
   * 🔹 State: Notification Data (from API)
   *
   * - `data`: All Notification retrieved from API
   * - `totalRecords`: Total count of records
   * - `apiCall`: Flag for tracking if API was recently called
   */
  const [webNotificationData, setWebNotificationData] = useState({
    notifications: [],
    unReadCount: 0,
    totalCount: 0,
  });

  /**
   * ♻️ Reset Context State (Table + API Data)
   *
   * Clears table MQTT updates and resets API Notification data
   * back to initial state. Useful when navigating away from
   * Notification view or logging out.
   */
  const resetWebNotificationDataContextState = () => {
    setWebNotificationData({
      notifications: [],
      unReadCount: 0,
      totalCount: 0,
    });
  };

  return (
    <MyNotificationContext.Provider
      value={{
        // Notification data (API)
        webNotificationData,
        setWebNotificationData,
        resetWebNotificationDataContextState,
      }}
    >
      {children}
    </MyNotificationContext.Provider>
  );
};

/**
 * 🔗 useWebNotification
 *
 * Custom hook for accessing MyNotificationContext.
 *
 * @returns {{
 *   webNotificationData: { notifications: Array, unReadCount: number, totalCount: number },
 *   setWebNotificationData: Function
 * }}
 *
 * @example
 * const {
 *   webNotificationData,
 *   setWebNotificationData,
 
 * } = useWebNotification();
 */
export const useWebNotification = () => useContext(MyNotificationContext);
