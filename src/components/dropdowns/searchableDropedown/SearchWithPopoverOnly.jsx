// components/SearchWithPopoverOnly.jsx
import React, { useEffect, useState } from "react";
import { Input, Popover, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
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
import { useMyAdmin } from "../../../context/AdminContext";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const currentPath = location.pathname;

  // -------------------------
  // ✅ Context hooks
  // -------------------------
  const { collapsed, selectedKey } = useSidebarContext();
  const { activeTab } = usePortfolioContext(); // Portfolio / Pending
  const { activeTab: reconcileActiveTab, activeTabHCO } = useReconcileContext(); // Transactions / Portfolio
  const {
    setEmployeeMyApprovalSearch,
    setEmployeeMyTransactionSearch,
    setEmployeeMyHistorySearch,
    setEmployeeMyTransactionReportSearch,
    setLineManagerMyActionSearch,
    setEmployeePortfolioSearch,
    setEmployeePendingApprovalSearch,
    setLineManagerApprovalSearch,
    setComplianceOfficerReconcileTransactionsSearch,
    setComplianceOfficerReconcilePortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalEscalatedVerificationsSearch,
    setHeadOfTradeEscalatedApprovalsSearch,
    setAdminBrokerSearch,
    setAdminIntrumentListSearch,
    setAdminGropusAndPolicySearch,
    setAdminGropusAndPolicyPoliciesTabSearch,
    setAdminGropusAndPolicyUsersTabSearch,
    setEmployeeMyTradeApprovalsSearch,
    setLMPendingApprovalReportsSearch,
    setMyTradeApprovalReportLineManageSearch,
    setCODatewiseTransactionReportSearch,
    setAdminSessionWiseActivitySearch,
    setComplianceOfficerMyActionSearch,
    setCoOverdueVerificationReportSearch,
    //
    setUsersTabSearch,
    setPendingRequestsTabSearch,
    setRejectedRequestsTabSearch,
  } = useSearchBarContext();

  const {
    pageTypeForAdminGropusAndPolicy,
    pageTabesForAdminGropusAndPolicy,
    openNewFormForAdminGropusAndPolicy,
    manageUsersTab,
  } = useMyAdmin();

  // -------------------------
  // ✅ Local state
  // -------------------------
  const [searchMain, setSearchMain] = useState("");
  const [visible, setVisible] = useState(false);
  const [clear, setClear] = useState(false);

  const handleInputChange = (e) => {
    let { value } = e.target;

    if (
      selectedKey === "21" &&
      currentPath === "/PAD/admin-users/session-wise-activity"
    ) {
      // Allow only digits & dots
      value = value.replace(/[^0-9.]/g, "");

      // Prevent multiple dots together
      value = value.replace(/\.{2,}/g, ".");

      // Remove starting dot
      if (value.startsWith(".")) value = value.substring(1);

      // Split parts
      let parts = value.split(".");

      // Limit to 4 parts (IPv4)
      if (parts.length > 4) {
        parts = parts.slice(0, 4);
      }

      // Auto-insert a dot when block reaches 3 digits (and not last part)
      parts = parts.map((p, index) => {
        if (p.length > 3) p = p.substring(0, 3); // max 3 digits per block
        return p;
      });

      // Re-join
      value = parts.join(".");

      setSearchMain(value);
      return;
    }

    // Default behavior
    setSearchMain(value.trimStart());
  };

  // Reset on selectedKey change
  useEffect(() => {
    setSearchMain("");
  }, [selectedKey, activeTab, reconcileActiveTab, activeTabHCO]);

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

      case "3": // Employee → My History
        setEmployeeMyHistorySearch((prev) => ({
          ...prev,
          instrumentName: searchMain,
          requestID: "",
          quantity: 0,
          startDate: null,
          endDate: null,
          nature: "",
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

      case "5": // Employee
        // Employee → My Trade Approvals Report
        if (currentPath === "/PAD/reports/my-trade-approvals") {
          setEmployeeMyTradeApprovalsSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            quantity: 0,
            startDate: null,
            endDate: null,
            brokerIDs: [],
            pageNumber: 0,
            filterTrigger: true,
          }));
        } else if (currentPath === "/PAD/reports/my-transactions") {
          setEmployeeMyTransactionReportSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            quantity: 0,
            startDate: null,
            endDate: null,
            broker: "",
            actionStartDate: null,
            actionEndDate: null,
            actionBy: "",
            pageNumber: 0,
            filterTrigger: true,
          }));
        }
        setSearchMain("");
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

      case "7": // LineManager → My Actions
        setLineManagerMyActionSearch((prev) => ({
          ...prev,
          requestID: "",
          instrumentName: searchMain,
          requesterName: "",
          startDate: null,
          endDate: null,
          quantity: 0,
          pageNumber: 0,
          type: [],
          status: [],
          filterTrigger: true,
        }));

        setSearchMain("");
        break;

      case "8": // LineManager →Pending Request Reports
        if (currentPath === "/PAD/lm-reports/lm-pending-request") {
          setLMPendingApprovalReportsSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            requesterName: "",
            startDate: null,
            endDate: null,
            quantity: 0,
            pageNumber: 0,
            filterTrigger: true,
          }));
        } else if (currentPath === "/PAD/lm-reports/lm-tradeapproval-request") {
          setMyTradeApprovalReportLineManageSearch((prev) => ({
            ...prev,
            employeeName: searchMain,
            departmentName: "",
            filterTrigger: true,
          }));
        }
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

      case "10": // Compliance Officer → My Actions
        setComplianceOfficerMyActionSearch((prev) => ({
          ...prev,
          transactionID: "",
          instrumentName: searchMain,
          requesterName: "",
          startDate: null,
          endDate: null,
          quantity: 0,
          pageNumber: 0,
          type: [],
          status: [],
          filterTrigger: true,
        }));

        setSearchMain("");
        break;

      case "11": // Compliance Officer
        // reports date wise transaction report || co-overdue-verifications
        if (currentPath === "/PAD/co-reports/co-date-wise-transaction-report") {
          setCODatewiseTransactionReportSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            quantity: 0,
            startDate: null,
            endDate: null,
            employeeID: 0,
            employeeName: "",
            departmentName: "",
            pageNumber: 0,
            filterTrigger: true,
          }));
          setSearchMain("");
        } else if (currentPath === "/PAD/co-reports/co-overdue-verifications") {
          setCoOverdueVerificationReportSearch((prev) => ({
            ...prev,
            instrumentName: searchMain,
            requesterName: "",
            approvedQuantity: "",
            sharesTraded: "",
            startDate: null,
            endDate: null,
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

      case "18": // Admin Instrument List
        setAdminIntrumentListSearch((prev) => ({
          ...prev,
          instrumentName: searchMain,
          startDate: "",
          endDate: "",
          pageNumber: 0,
          pageSize: 10,
          filterTrigger: true,
        }));
        setSearchMain("");
        break;

      case "19": // Admin Brokers List
        setAdminBrokerSearch((prev) => ({
          ...prev,
          brokerName: searchMain,
          psxCode: "",
          pageNumber: 0,
          pageSize: 10,
          filterTrigger: true,
        }));
        setSearchMain("");
        break;

      case "20": // Admin groupe creat and  List
        if (
          openNewFormForAdminGropusAndPolicy &&
          pageTabesForAdminGropusAndPolicy === 1
        ) {
          console.log("searchMain", searchMain);
          setAdminGropusAndPolicyPoliciesTabSearch((prev) => ({
            ...prev,
            policyId: searchMain,
            scenario: "",
            duration: "",
            consequence: "",
            pageNumber: 0,
            pageSize: 10,
            filterTrigger: true,
          }));
        } else if (
          openNewFormForAdminGropusAndPolicy &&
          pageTabesForAdminGropusAndPolicy === 2
        ) {
          console.log("searchMain", searchMain);
          setAdminGropusAndPolicyUsersTabSearch((prev) => ({
            ...prev,
            employeeName: searchMain,
            emailAddress: "",
            designation: "",
            departmentName: "",
            employeeID: 0,
            filterTrigger: true,
            pageNumber: 0,
            pageSize: 10,
          }));
        } else {
          setAdminGropusAndPolicySearch((prev) => ({
            ...prev,
            policyName: searchMain,
            pageNumber: 0,
            pageSize: 10,
            filterTrigger: true,
          }));
        }

        setSearchMain("");
        break;

      case "21": // Admin Manage Users
        if (currentPath === "/PAD/admin-users/session-wise-activity") {
          setAdminSessionWiseActivitySearch((prev) => ({
            ...prev,
            ipAddress: searchMain,
            startDate: null,
            endDate: null,
            filterTrigger: true,
            pageNumber: 0,
            pageSize: 10,
          }));
        } else if (manageUsersTab === "0") {
          setUsersTabSearch((prev) => ({
            ...prev,
            employeeName: searchMain,
            employeeID: 0,
            emailAddress: "",
            departmentName: "",
            filterTrigger: true,
            pageNumber: 0,
            pageSize: 10,
          }));
        } else if (manageUsersTab === "1") {
          setPendingRequestsTabSearch((prev) => ({
            ...prev,
            employeeName: searchMain,
            employeeID: 0,
            emailAddress: "",
            departmentName: "",
            startDate: null,
            endDate: null,
            filterTrigger: true,
            pageNumber: 0,
            pageSize: 10,
          }));
        } else {
          setRejectedRequestsTabSearch((prev) => ({
            ...prev,
            employeeName: searchMain,
            emailAddress: "",
            departmentName: "",
            filterTrigger: true,
            pageNumber: 0,
            pageSize: 10,
          }));
        }
        setSearchMain("");
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
  // 🚫 FINAL FIX — HIDE SEARCH BAR ON SPECIFIC ROUTE
  // ----------------------------------------------------------------
  if (
    selectedKey === "5" &&
    (currentPath === "/PAD/reports/my-compliance-approvals" ||
      currentPath === "/PAD/reports/my-trade-approvals-standing")
  ) {
    return null; // ⛔ Hide entire search bar
  }

  // ----------------------------------------------------------------
  // ✅ RENDER
  // ----------------------------------------------------------------
  return (
    <Space.Compact className={styles.searchWrapper}>
      {/* 🔎 Main Search Input */}
      <Input
        placeholder={
          selectedKey === "19"
            ? "Broker name. Click the icon to view more options."
            : selectedKey === "20" && pageTabesForAdminGropusAndPolicy === 1
            ? "Search Scenario. Click the icon to view more options."
            : selectedKey === "20" && pageTabesForAdminGropusAndPolicy === 2
            ? "Employee name. Click the icon to view more options."
            : selectedKey === "20"
            ? "Policy Name. Click the icon to view more options."
            : (selectedKey === "21" &&
                currentPath !== "/PAD/admin-users/session-wise-activity") ||
              (selectedKey === "8" &&
                location.pathname ===
                  "/PAD/lm-reports/lm-tradeapproval-request")
            ? "Employee name. Click the icon to view more options."
            : selectedKey === "21" &&
              currentPath === "/PAD/admin-users/session-wise-activity"
            ? "Search"
            : "Instrument name. Click the icon to view more options."
        }
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
      {/* 🎛️ Popover Filter OR Simple Search Icon */}
      {!openNewFormForAdminGropusAndPolicy && selectedKey === "20" ? (
        // 🔹 Just a clickable search icon (no popover)
        <SearchOutlined
          onClick={handleSearchMain}
          className={styles.filterIcon}
          style={{
            fontSize: 40, // Increased from 20 → 28 for a noticeable size bump
            color: "#424242",
            cursor: "pointer",
            padding: "0px", // Slightly more padding
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      ) : (
        <Popover
          overlayClassName={
            collapsed ? styles.popoverContenCollapsed : styles.popoverContent
          }
          content={renderFilterContent(
            currentPath,
            selectedKey,
            setVisible,
            searchMain,
            setSearchMain,
            clear,
            setClear,
            openNewFormForAdminGropusAndPolicy,
            pageTabesForAdminGropusAndPolicy
          )}
          trigger="click"
          open={visible}
          onOpenChange={(newVisible) => {
            console.log("AdminPoliciesFilter");
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
      )}
    </Space.Compact>
  );
};

export default SearchWithPopoverOnly;
