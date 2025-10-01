import React, { createContext, useContext, useState } from "react";

/**
 * 📌 MyEscalatedApprovalsContext
 *
 * Centralized context for managing:
 * - API-driven Escalated Approvalsdata
 * - Real-time Escalated Approvals updates (via MQTT) for **table** and **modal** views
 */
const MyEscalatedApprovalsContext = createContext();

/**
 * 🏦 MyEscalatedApprovalsProvider
 *
 * Provides Escalated Approvals-related states and actions to its child components.
 * Wrap your app (or specific parts of it) with this provider to access:
 *
 * - Escalated Approvals data (from API)
 * - Table updates from MQTT
 * - Modal updates from MQTT
 * - Reset functions for clearing context state
 *
 * @component
 * @example
 * return (
 *   <MyEscalatedApprovalsProvider>
 *     <MyComponent />
 *   </MyEscalatedApprovalsProvider>
 * );
 */
export const MyEscalatedApprovalsProvider = ({ children }) => {
  /**
   * 🔹 State: Escalated Approvals Data (from API)
   *
   * - `htaEscalatedApprovals`: All EscalatedApprovals retrieved from API
   * - `totalRecords`: Total count of records
   */
  const [escalatedApprovalData, setEscalatedApprovalData] = useState({
    data: [],
    totalRecords: 0,
    apiCall: false,
  });

  // Context STate to extract data from get All View Trade Approval which is show by click on View Detail
  const [viewDetailsHeadOfApprovalData, setViewDetailsHeadOfApprovalData] =
    useState({
      details: [],
      requesterName: "",
      workFlowStatus: {},
      assetTypes: [],
      hierarchyDetails: [],
      escalations: [],
    });

  /**
   * ♻️ Reset Context State (Table + API Data)
   *
   */
  const resetMyEscalatedApprovalContextState = () => {
    setEscalatedApprovalData({
       data: [], totalRecords: 0, apiCall: false 
    });
  };

  return (
    <MyEscalatedApprovalsContext.Provider
      value={{
        // Transactions data (API)
        escalatedApprovalData,
        setEscalatedApprovalData,
        viewDetailsHeadOfApprovalData,
        setViewDetailsHeadOfApprovalData,

        // Reset functions
        resetMyEscalatedApprovalContextState,
      }}
    >
      {children}
    </MyEscalatedApprovalsContext.Provider>
  );
};

/**
 * 🔗 useEscalatedApprovals
 *
 * Custom hook for accessing MyEscalatedApprovalsContext.
 *
 * @returns {{
 *   escalatedApprovalData: { htaEscalatedApprovals: Array, totalRecords: number },
 *   setEscalatedApprovalData: Function,
 *   resetMyEscalatedApprovalContextState: Function,
 * }}
 *
 * @example
 * const {
 *   escalatedApprovalData,
 *   setEscalatedApprovalData,
 *   resetMyEscalatedApprovalContextState,
 * } = useEscalatedApprovals();
 */
export const useEscalatedApprovals = () =>
  useContext(MyEscalatedApprovalsContext);
