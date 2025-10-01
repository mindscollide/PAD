// components/SearchWithPopoverOnly.jsx
import React, { useState } from "react";
import { Input, Popover, Space } from "antd";

// Assets
import SearchFilterIcon from "../../../assets/img/search-filter-icon.png";

// Utilities
import {
  getMainSearchInputValueByKey,
  handleMainInstrumentChange,
  handleSearchMainInputReset,
  renderFilterContent,
} from "./utill";

// Styles
import styles from "./SearchWithPopoverOnly.module.css";

// Contexts
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { usePortfolioContext } from "../../../context/portfolioContax";
import { useReconcileContext } from "../../../context/reconsileContax";
import { removeFirstSpace } from "../../../commen/funtions/rejex";

/**
 * 🔎 SearchWithPopoverOnly
 *
 * A reusable search input with:
 * - Popover filter panel
 * - Integration with multiple search contexts (Employee, Line Manager, Compliance Officer, etc.)
 * - Automatic handling of portfolio/pending approval tabs
 *
 * Props: none (relies on global contexts)
 */
const SearchWithPopoverOnly = () => {
  // -------------------------
  // ✅ Context hooks
  // -------------------------
  const { collapsed, selectedKey } = useSidebarContext();
  const { activeTab } = usePortfolioContext(); // Portfolio / Pending
  const { activeTab: reconcileActiveTab, activeTabHCO } = useReconcileContext(); // Transactions / Portfolio

  const {
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch,
    employeePortfolioSearch,
    setEmployeePortfolioSearch,
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    lineManagerApprovalSearch,
    setLineManagerApprovalSearch,
    complianceOfficerReconcileTransactionsSearch,
    setComplianceOfficerReconcileTransactionsSearch,
    complianceOfficerReconcilePortfolioSearch,
    setComplianceOfficerReconcilePortfolioSearch,
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    headOfComplianceApprovalEscalatedVerificationsSearch,
    setHeadOfComplianceApprovalEscalatedVerificationsSearch,
  } = useSearchBarContext();

  // -------------------------
  // ✅ Local state
  // -------------------------
  const [visible, setVisible] = useState(false);

  // ----------------------------------------------------------------
  // 🔧 HELPERS
  // ----------------------------------------------------------------

  /**
   * Apply popover filters (e.g., date, quantity).
   * Triggers a context-specific search.
   */
  const handleSearch = () => {
    switch (selectedKey) {
      case "1": // Employee → My Approval
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          mainInstrumentName: "",
          pageNumber: 0,
          tableFilterTrigger: true,
        }));
        break;

      case "2": // Employee → My Transaction
        setEmployeeMyTransactionSearch((prev) => ({
          ...prev,
          mainInstrumentName: "",
          pageNumber: 0,
          tableFilterTrigger: true,
        }));
        break;

      case "4": // Employee → Portfolio / Pending
        if (activeTab === "portfolio") {
          setEmployeePortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
            pageNumber: 0,
            filterTrigger: true,
          }));
        } else if (activeTab === "pending") {
          setEmployeePendingApprovalSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
            pageNumber: 0,
            filterTrigger: true,
          }));
        }
        break;

      case "6": // Line Manager Approval
        setLineManagerApprovalSearch((prev) => ({
          ...prev,
          tableFilterTrigger: true,
        }));
        break;

      case "9": // Compliance Officer → Reconcile
        if (reconcileActiveTab === "transactions") {
          setComplianceOfficerReconcileTransactionsSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
            pageNumber: 0,
            filterTrigger: true,
          }));
        } else if (reconcileActiveTab === "portfolio") {
          setComplianceOfficerReconcilePortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
            pageNumber: 0,
            filterTrigger: true,
          }));
        }
        break;
      case "15": // Head of Compliance Approval
        if (activeTabHCO === "escalated") {
          setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
            pageNumber: 0,
            filterTrigger: true,
          }));
        } else if (activeTabHCO === "portfolio") {
          setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
            pageNumber: 0,
            filterTrigger: true,
          }));
        }
        break;
      default: // fallback
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          mainInstrumentName: "",
          pageNumber: 0,
          filterTrigger: true,
        }));
        break;
    }
    setVisible(false); // ✅ Close popover
  };

  /**
   * Handle Enter key search (direct main input only).
   */
  const handleSearchMain = () => {
    switch (selectedKey) {
      case "1": // Employee → My Approval
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          instrumentName: "",
          quantity: 0,
          startDate: null,
          pageNumber: 0,
          tableFilterTrigger: true,
        }));
        break;

      case "2": // Employee → My Transaction
        setEmployeeMyTransactionSearch((prev) => ({
          ...prev,
          instrumentName: "",
          quantity: 0,
          startDate: null,
          endDate: null,
          pageNumber: 0,
          tableFilterTrigger: true,
        }));
        break;

      case "4": // Employee → Portfolio / Pending
        if (activeTab === "portfolio") {
          setEmployeePortfolioSearch((prev) => ({
            ...prev,
            instrumentName: "",
            quantity: 0,
            startDate: null,
            endDate: null,
            pageNumber: 0,
            filterTrigger: true,
          }));
        } else if (activeTab === "pending") {
          setEmployeePendingApprovalSearch((prev) => ({
            ...prev,
            instrumentName: "",
            quantity: 0,
            startDate: null,
            endDate: null,
            pageNumber: 0,
            filterTrigger: true,
          }));
        }
        break;

      case "6": // Line Manager Approval
        setLineManagerApprovalSearch((prev) => ({
          ...prev,
          instrumentName: "",
          requesterName: "",
          quantity: 0,
          startDate: null,
          tableFilterTrigger: true,
        }));
        break;

      case "9": // Compliance Officer → Reconcile
        if (reconcileActiveTab === "transactions") {
          setComplianceOfficerReconcileTransactionsSearch((prev) => ({
            ...prev,
            instrumentName: "",
            requesterName: "",
            startDate: null,
            endDate: null,
            quantity: 0,
            pageNumber: 0,
            filterTrigger: true,
          }));
        } else if (reconcileActiveTab === "portfolio") {
          setComplianceOfficerReconcilePortfolioSearch((prev) => ({
            ...prev,
            instrumentName: "",
            requesterName: "",
            startDate: null,
            endDate: null,
            quantity: 0,
            pageNumber: 0,
            filterTrigger: true,
          }));
        }
        break;

      case "15": // Head of Compliance Approval
        if (activeTabHCO === "escalated") {
          setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
            ...prev,
            requesterName: "",
            instrumentName: "",
            quantity: 0,
            requestDateFrom: null,
            requestDateTo: null,
            escalatedDateFrom: null,
            escalatedDateTo: null,
            type: [],
            status: [],
            pageNumber: 0,
            totalRecords: 0,
            filterTrigger: true,
          }));
        } else if (activeTabHCO === "portfolio") {
          setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
            pageNumber: 0,
            filterTrigger: true,
          }));
        }
        break;
      default:
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          filterTrigger: true,
        }));
        break;
    }
  };

  // ----------------------------------------------------------------
  // ✅ RENDER
  // ----------------------------------------------------------------
  return (
    <Space.Compact className={styles.searchWrapper}>
      {/* 🔎 Main Search Input */}
      <Input
        placeholder="Instrument name. Click to view more options"
        allowClear
        className={
          collapsed ? styles["inputWrapperCollapsed"] : styles["inputWrapper"]
        }
        value={getMainSearchInputValueByKey(
          selectedKey,
          activeTab,
          reconcileActiveTab,
          activeTabHCO,
          employeeMyApprovalSearch,
          employeeMyTransactionSearch,
          employeePortfolioSearch,
          employeePendingApprovalSearch,
          lineManagerApprovalSearch,
          complianceOfficerReconcilePortfolioSearch,
          complianceOfficerReconcileTransactionsSearch,
          headOfComplianceApprovalEscalatedVerificationsSearch,
          headOfComplianceApprovalPortfolioSearch
        )}
        onChange={(e) => {
          const value = removeFirstSpace(e.target.value); // ✅ Prevent leading space
          handleMainInstrumentChange(
            selectedKey,
            activeTab,
            reconcileActiveTab,
            activeTabHCO,
            value,
            setEmployeeMyApprovalSearch,
            setEmployeeMyTransactionSearch,
            setEmployeePortfolioSearch,
            setEmployeePendingApprovalSearch,
            setLineManagerApprovalSearch,
            setComplianceOfficerReconcilePortfolioSearch,
            setComplianceOfficerReconcileTransactionsSearch,
            setHeadOfComplianceApprovalEscalatedVerificationsSearch,
            setHeadOfComplianceApprovalPortfolioSearch
          );
        }}
        style={{
          borderStartEndRadius: 0,
          borderEndEndRadius: 0,
          borderRight: "none", // merge visually with filter icon
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !visible) {
            handleSearchMain();
          }
        }}
      />

      {/* 🎛️ Popover Filter */}
      <Popover
        overlayClassName={
          collapsed ? styles.popoverContenCollapsed : styles.popoverContent
        }
        content={renderFilterContent(
          selectedKey,
          activeTab,
          reconcileActiveTab,
          activeTabHCO,
          handleSearch,
          setVisible
        )}
        trigger="click"
        open={visible}
        onOpenChange={(newVisible) => {
          setVisible(newVisible);
          if (newVisible) {
            // ✅ Reset filters when opening popover
            handleSearchMainInputReset({
              selectedKey,
              activeTab,
              reconcileActiveTab,
              activeTabHCO,
              setEmployeeMyApprovalSearch,
              setEmployeeMyTransactionSearch,
              setEmployeePortfolioSearch,
              setEmployeePendingApprovalSearch,
              setLineManagerApprovalSearch,
              setComplianceOfficerReconcilePortfolioSearch,
              setComplianceOfficerReconcileTransactionsSearch,
              setHeadOfComplianceApprovalEscalatedVerificationsSearch,
              setHeadOfComplianceApprovalPortfolioSearch,
            });
          }
        }}
        placement="bottomRight"
        getPopupContainer={(triggerNode) =>
          triggerNode.parentElement || document.body
        }
      >
        <img
          draggable={false}
          src={SearchFilterIcon}
          alt="filter"
          className={styles.filterIcon}
        />
      </Popover>
    </Space.Compact>
  );
};

export default SearchWithPopoverOnly;
