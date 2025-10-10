// components/SearchWithPopoverOnly.jsx
import React, { useEffect, useState } from "react";
import { Input, Popover, Space } from "antd";

// Assets
import SearchFilterIcon from "../../../assets/img/search-filter-icon.png";

// Utilities
import { renderFilterContent } from "./utill";

// Styles
import styles from "./SearchWithPopoverOnly.module.css";

// Contexts
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { usePortfolioContext } from "../../../context/portfolioContax";
import { useReconcileContext } from "../../../context/reconsileContax";

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
    setEmployeeMyApprovalSearch,
    setEmployeeMyTransactionSearch,
    setEmployeePortfolioSearch,
    setEmployeePendingApprovalSearch,
    setLineManagerApprovalSearch,
    setComplianceOfficerReconcileTransactionsSearch,
    setComplianceOfficerReconcilePortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalEscalatedVerificationsSearch,
    setHeadOfTradeEscalatedApprovalsSearch,
  } = useSearchBarContext();

  // -------------------------
  // ✅ Local state
  // -------------------------
  const [searchMain, setSearchMain] = useState("");
  const [visible, setVisible] = useState(false);
  const [clear, setClear] = useState(false);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setSearchMain(value.trimStart());
  };
  // Reset on selectedKey change
  useEffect(() => {
    setSearchMain("");
  }, [selectedKey, activeTab]);

  // ----------------------------------------------------------------
  // 🔧 HELPERS
  // ----------------------------------------------------------------

  /**
   * Handle Enter key search (direct main input only).
   */
  const handleSearchMain = () => {
    switch (selectedKey) {
      case "1": // Employee → My Approval
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          instrumentName: searchMain,
          quantity: 0,
          startDate: null,
          endDate: null,
          pageNumber: 0,
          filterTrigger: true,
        }));
        setSearchMain("");
        break;

      case "2": // Employee → My Transaction
        setEmployeeMyTransactionSearch((prev) => ({
          ...prev,
          instrumentName: searchMain,
          quantity: 0,
          startDate: null,
          endDate: null,
          brokerIDs: [],
          pageNumber: 0,
          filterTrigger: true,
        }));
        setSearchMain("");
        break;

      case "4": // Employee → Portfolio / Pending
        if (activeTab === "portfolio") {
          setEmployeePortfolioSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            quantity: 0,
            startDate: null,
            endDate: null,
            brokerIDs: [],
            pageNumber: 0,
            filterTrigger: true,
          }));
          setSearchMain("");
        } else if (activeTab === "pending") {
          setEmployeePendingApprovalSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            quantity: 0,
            startDate: null,
            endDate: null,
            brokerIDs: [],
            pageNumber: 0,
            filterTrigger: true,
          }));
          setSearchMain("");
        }
        break;

      case "6": // Line Manager Approval
        setLineManagerApprovalSearch((prev) => ({
          ...prev,
          instrumentName: searchMain,
          requesterName: "",
          quantity: 0,
          startDate: null,
          endDate: null,
          filterTrigger: true,
        }));
        setSearchMain("");
        break;

      case "9": // Compliance Officer → Reconcile
        if (reconcileActiveTab === "transactions") {
          setComplianceOfficerReconcileTransactionsSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            requesterName: "",
            startDate: null,
            endDate: null,
            quantity: 0,
            pageNumber: 0,
            filterTrigger: true,
          }));
          setSearchMain("");
        } else if (reconcileActiveTab === "portfolio") {
          setComplianceOfficerReconcilePortfolioSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            requesterName: "",
            startDate: null,
            endDate: null,
            quantity: 0,
            pageNumber: 0,
            filterTrigger: true,
          }));
          setSearchMain("");
        }
        break;

      case "12": // HTA Escalated
        setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
          ...prev,
          instrumentName: searchMain,
          requesterName: "",
          lineManagerName: "",
          requestDateFrom: null,
          requestDateTo: null,
          escalatedDateFrom: null,
          escalatedDateTo: null,
          status: [],
          type: [],
          pageNumber: 0,
          pageSize: 10,
          filterTrigger: true,
        }));
        setSearchMain("");

        break;

      case "15": // HCA Escalated
        if (activeTabHCO === "escalated") {
          setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            requesterName: "",
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
          setSearchMain("");
        } else if (activeTabHCO === "portfolio") {
          setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            pageNumber: 0,
            filterTrigger: true,
          }));
          setSearchMain("");
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
  console.log("visible", visible);

  // ----------------------------------------------------------------
  // ✅ RENDER
  // ----------------------------------------------------------------
  return (
    <Space.Compact className={styles.searchWrapper}>
      {/* 🔎 Main Search Input */}
      <Input
        placeholder="Instrument name. Click the icon to view more options"
        allowClear
        className={
          collapsed ? styles["inputWrapperCollapsed"] : styles["inputWrapper"]
        }
        value={searchMain}
        onChange={handleInputChange}
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
          setVisible,
          searchMain,
          setSearchMain,
          clear,
          setClear
        )}
        trigger="click"
        open={visible}
        onOpenChange={(newVisible) => {
          setVisible(newVisible);
          setClear(newVisible);
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
