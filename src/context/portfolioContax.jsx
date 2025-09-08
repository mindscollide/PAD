import React, { createContext, useContext, useState } from "react";

/**
 * PortfolioContext
 *
 * Provides state and actions for managing portfolio-related UI and data:
 * - Active tab state
 * - Upload portfolio modal visibility
 * - Employee pending approvals (API + MQTT)
 */
export const PortfolioContext = createContext();

/**
 * PortfolioProvider
 *
 * Wraps child components and provides portfolio-related state and methods
 * through React Context.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Components that consume the context.
 * @returns {JSX.Element} Context provider with portfolio states and actions.
 */
export const PortfolioProvider = ({ children }) => {
  /**
   * Active tab for Portfolio module.
   * @type {[string, function]}
   */
  const [activeTab, setActiveTab] = useState("portfolio");

  /**
   * Controls visibility of upload portfolio modal.
   * @type {[boolean, function]}
   */
  const [uploadPortfolioModal, setUploadPortfolioModal] = useState(false);

  /**
   * Employee pending approvals fetched via API.
   * @type {[{ data: Array, totalRecords: number, apiCall: boolean }, function]}
   */
  const [employeePendingApprovalsData, setEmployeePendingApprovalsData] =
    useState({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });

  /**
   * Employee pending approvals received via MQTT.
   * @type {[{ data: Array, mqtt: boolean }, function]}
   */
  const [
    employeePendingApprovalsDataMqtt,
    setEmployeePendingApprovalsDataMqtt,
  ] = useState({
    data: [],
    mqtt: false,
  });

  /**
   * Reset only the portfolio tab to its default state.
   */
  const resetPortfolioTab = () => {
    setActiveTab("portfolio");
    setEmployeePendingApprovalsData({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });
  };

  /**
   * Reset portfolio tab and pending approvals (API + MQTT) to initial state.
   */
  const resetPendingApprovalTab = () => {
    setActiveTab("portfolio");
    setEmployeePendingApprovalsData({
      data: [],
      totalRecords: 0,
      apiCall: false,
    });
    setEmployeePendingApprovalsDataMqtt({
      data: [],
      mqtt: false,
    });
  };

  return (
    <PortfolioContext.Provider
      value={{
        activeTab,
        setActiveTab,
        resetPortfolioTab,
        uploadPortfolioModal,
        setUploadPortfolioModal,
        employeePendingApprovalsData,
        setEmployeePendingApprovalsData,
        employeePendingApprovalsDataMqtt,
        setEmployeePendingApprovalsDataMqtt,
        resetPendingApprovalTab,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

/**
 * usePortfolioContext
 *
 * Custom hook to access the PortfolioContext.
 *
 * @returns {{
 *  activeTab: string,
 *  setActiveTab: function,
 *  resetPortfolioTab: function,
 *  uploadPortfolioModal: boolean,
 *  setUploadPortfolioModal: function,
 *  employeePendingApprovalsData: object,
 *  setEmployeePendingApprovalsData: function,
 *  employeePendingApprovalsDataMqtt: object,
 *  setEmployeePendingApprovalsDataMqtt: function,
 *  resetPendingApprovalTab: function
 * }}
 * @throws {Error} If used outside of PortfolioProvider
 */
export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error(
      "usePortfolioContext must be used within a PortfolioProvider"
    );
  }
  return context;
};
