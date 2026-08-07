import React, { createContext, useContext, useRef, useState } from "react";

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
  const [htaEscalatedApprovalData, setHtaEscalatedApprovalData] = useState({
    htaEscalatedApprovalsList: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
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
  /** Stores the latest MQTT update for Compliance Officer Transactions. */
  const [htaEscalatedApprovalDataMqtt, setHtaEscalatedApprovalDataMqtt] =
    useState(false);

  // Tracks which request (approvalID) the HTA currently has View Details
  // open for, if any - read by dashboard.jsx's MQTT handler so
  // ESCALATED_REQUEST_RESOLVED_HTA can close that modal when it's the same
  // request being resolved. A ref (not state) since this is read
  // imperatively from an MQTT callback, not rendered anywhere.
  const viewDetailsHeadOfApprovalIDRef = useRef(null);
  /**
   * ♻️ Reset Context State (Table + API Data)
   *
   */
  const resetMyEscalatedApprovalContextState = () => {
    setHtaEscalatedApprovalData({
      htaEscalatedApprovalsList: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
    setHtaEscalatedApprovalDataMqtt(false);
  };

  return (
    <MyEscalatedApprovalsContext.Provider
      value={{
        // Transactions data (API)
        htaEscalatedApprovalData,
        setHtaEscalatedApprovalData,
        htaEscalatedApprovalDataMqtt,
        setHtaEscalatedApprovalDataMqtt,
        viewDetailsHeadOfApprovalData,
        setViewDetailsHeadOfApprovalData,
        viewDetailsHeadOfApprovalIDRef,

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
 *   htaEscalatedApprovalData: { htaEscalatedApprovals: Array, totalRecords: number },
 *   setHtaEscalatedApprovalData: Function,
 *   resetMyEscalatedApprovalContextState: Function,
 * }}
 *
 * @example
 * const {
 *   htaEscalatedApprovalData,
 *   setHtaEscalatedApprovalData,
 *   resetMyEscalatedApprovalContextState,
 * } = useEscalatedApprovals();
 */
export const useEscalatedApprovals = () =>
  useContext(MyEscalatedApprovalsContext);
