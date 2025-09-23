import React, { createContext, useContext, useState } from "react";

/**
 * ReconcileContext
 *
 * Provides global state for managing the **Compliance Officer Reconciliation** module:
 * - Active tab control
 * - Modal visibility for reconciliation (transactions & portfolio)
 * - Compliance Officer reconcile transactions (API + MQTT)
 * - Compliance Officer reconcile portfolio (API + MQTT)
 * - Aggregate totals across reconciliation portfolio
 */
export const ReconcileContext = createContext();

/**
 * ReconcileProvider
 *
 * Wraps the app (or subtree) with reconciliation-related state and methods.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - Components that consume the context.
 * @returns {JSX.Element} Reconcile context provider.
 */
export const ReconcileProvider = ({ children }) => {
  /**
   * Currently active tab inside the reconciliation module.
   *
   * Can be:
   * - `"Transactions"` → shows the reconcile portfolio view
   * - `"transactions"` → shows the reconcile transactions view
   *
   * @type {[string, function]}
   */
  const [activeTab, setActiveTab] = useState("Transactions");

  /**
   * Controls visibility of the "Compliance Officer Reconcile Transaction" modal.
   *
   * @type {[boolean, function]}
   */
  const [
    complianceOfficerReconcileTransactionModal,
    setComplianceOfficerReconcileTransactionModal,
  ] = useState(false);

  /**
   * Controls visibility of the "Compliance Officer Reconcile Portfolio" modal.
   *
   * @type {[boolean, function]}
   */
  const [
    complianceOfficerReconcilePortfolioModal,
    setComplianceOfficerReconcilePortfolioModal,
  ] = useState(false);

  /**
   * Compliance Officer reconcile transactions fetched via API.
   *
   * @type {[{ data: Array, totalRecords: number, apiCall: boolean }, function]}
   */
  const [
    complianceOfficerReconcileTransactionData,
    setComplianceOfficerReconcileTransactionData,
  ] = useState({
    data: [],
    totalRecords: 0,
    apiCall: false,
  });

  /**
   * Compliance Officer reconcile transactions received via MQTT.
   *
   * @type {[{ data: Array, mqtt: boolean }, function]}
   */
  const [
    complianceOfficerReconcileTransactionDataMqtt,
    setComplianceOfficerReconcileTransactionDataMqtt,
  ] = useState({
    data: [],
    mqtt: false,
  });

  /**
   * Compliance Officer reconcile portfolio fetched via API.
   *
   * @type {[{ data: Array, totalRecords: number, apiCall: boolean }, function]}
   */
  const [
    complianceOfficerReconcilePortfolioData,
    setComplianceOfficerReconcilePortfolioData,
  ] = useState({
    data: [],
    totalRecords: 0,
    apiCall: false,
  });

  /**
   * Compliance Officer reconcile portfolio received via MQTT.
   *
   * @type {[{ data: Array, mqtt: boolean }, function]}
   */
  const [
    complianceOfficerReconcilePortfolioDataMqtt,
    setComplianceOfficerReconcilePortfolioDataMqtt,
  ] = useState({
    data: [],
    mqtt: false,
  });

  /**
   * Aggregate total quantity across all reconcile portfolio holdings.
   *
   * @type {[number, function]}
   */
  const [aggregateTotalQuantity, setAggregateTotalQuantity] = useState(0);

  /**
   * Reset only the reconcile portfolio tab state.
   */
  const resetComplianceOfficerReconcilePortfolioTab = () => {
    setActiveTab("Transactions");
    setComplianceOfficerReconcilePortfolioData({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });
    setComplianceOfficerReconcilePortfolioDataMqtt({
      data: [],
      mqtt: false,
    });
    setAggregateTotalQuantity(0);
  };

  /**
   * Reset the reconcile transactions tab state (API + MQTT).
   */
  const resetComplianceOfficerReconcileTransactionTab = () => {
    setActiveTab("Transactions");
    setComplianceOfficerReconcileTransactionData({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });
    setComplianceOfficerReconcileTransactionDataMqtt({
      data: [],
      mqtt: false,
    });
  };

  return (
    <ReconcileContext.Provider
      value={{
        activeTab,
        setActiveTab,

        complianceOfficerReconcileTransactionModal,
        setComplianceOfficerReconcileTransactionModal,
        complianceOfficerReconcileTransactionData,
        setComplianceOfficerReconcileTransactionData,
        complianceOfficerReconcileTransactionDataMqtt,
        setComplianceOfficerReconcileTransactionDataMqtt,
        resetComplianceOfficerReconcileTransactionTab,

        complianceOfficerReconcilePortfolioModal,
        setComplianceOfficerReconcilePortfolioModal,
        complianceOfficerReconcilePortfolioData,
        setComplianceOfficerReconcilePortfolioData,
        complianceOfficerReconcilePortfolioDataMqtt,
        setComplianceOfficerReconcilePortfolioDataMqtt,
        resetComplianceOfficerReconcilePortfolioTab,

        aggregateTotalQuantity,
        setAggregateTotalQuantity,
      }}
    >
      {children}
    </ReconcileContext.Provider>
  );
};

/**
 * useReconcileContext
 *
 * Custom hook to access ReconcileContext values.
 *
 * @returns {{
 *  activeTab: string,
 *  setActiveTab: function,
 *
 *  complianceOfficerReconcileTransactionModal: boolean,
 *  setComplianceOfficerReconcileTransactionModal: function,
 *  complianceOfficerReconcileTransactionData: { data: Array, totalRecords: number, apiCall: boolean },
 *  setComplianceOfficerReconcileTransactionData: function,
 *  complianceOfficerReconcileTransactionDataMqtt: { data: Array, mqtt: boolean },
 *  setComplianceOfficerReconcileTransactionDataMqtt: function,
 *  resetComplianceOfficerReconcileTransactionTab: function,
 *
 *  complianceOfficerReconcilePortfolioModal: boolean,
 *  setComplianceOfficerReconcilePortfolioModal: function,
 *  complianceOfficerReconcilePortfolioData: { data: Array, totalRecords: number, apiCall: boolean },
 *  setComplianceOfficerReconcilePortfolioData: function,
 *  complianceOfficerReconcilePortfolioDataMqtt: { data: Array, mqtt: boolean },
 *  setComplianceOfficerReconcilePortfolioDataMqtt: function,
 *  resetComplianceOfficerReconcilePortfolioTab: function,
 *
 *  aggregateTotalQuantity: number,
 *  setAggregateTotalQuantity: function
 * }}
 *
 * @throws {Error} If used outside of ReconcileProvider.
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
