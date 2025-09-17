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
import { removeFirstSpace } from "../../../commen/funtions/rejex";

/**
 * SearchWithPopoverOnly
 * ----------------------
 * A search input with an attached popover filter for refining search results.
 *
 * Features:
 * - Main search input bound to different context states (depends on `selectedKey`).
 * - Popover filter with extra options (date, quantity, etc.).
 * - Automatically adapts styling when sidebar is collapsed.
 * - Triggers search handlers on Enter key or filter submission.
 */
const SearchWithPopoverOnly = () => {
  /** Sidebar context → provides collapse state and active tab key */
  const { collapsed, selectedKey } = useSidebarContext();

  /** Local state → controls filter popover visibility */
  const [visible, setVisible] = useState(false);

  /** Portfolio context → tells if we're in portfolio or pending approval tab */
  const { activeTab } = usePortfolioContext();

  /** Search context → provides search state + setters for different modules */
  const {
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    resetEmployeeMyApprovalSearch,

    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch,
    resetEmployeeMyTransactionSearch,

    employeePortfolioSearch,
    setEmployeePortfolioSearch,
    resetEmployeePortfolioSearch,

    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,

    lineManagerApprovalSearch,
    setLineManagerApprovalSearch,
  } = useSearchBarContext();

  /**
   * Runs when filter options inside popover are applied.
   * Resets pagination and triggers table filter refresh.
   */
  const handleSearch = () => {
    switch (selectedKey) {
      case "1": // Employee My Approval
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          mainInstrumentName: "",
          pageNumber: 0,
          tableFilterTrigger: true,
        }));
        break;

      case "2": // Employee My Transaction
        setEmployeeMyTransactionSearch((prev) => ({
          ...prev,
          mainInstrumentName: "",
          pageNumber: 0,
          tableFilterTrigger: true,
        }));
        break;

      case "4": // Employee Portfolio / Pending Approval
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
            pageNumber: 0,
            filterTrigger: true,
          }));
        }
        break;

      case "5":
      case "6": // Line Manager Approval
        setLineManagerApprovalSearch((prev) => ({
          ...prev,
          tableFilterTrigger: true,
        }));
        break;

      default: // fallback → Employee My Approval
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          filterTrigger: true,
        }));
        break;
    }

    setVisible(false); // Close popover after applying filters
  };

  /**
   * Runs when user presses Enter in the main search input.
   * Triggers search based only on input (ignores popover filters).
   */
  const handleSearchMain = () => {
    switch (selectedKey) {
      case "1": // Employee My Approval
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          instrumentName: "",
          quantity: 0,
          startDate: null,
          pageNumber: 0,
          tableFilterTrigger: true,
        }));
        break;

      case "2": // Employee My Transaction
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

      case "4": // Employee Portfolio / Pending Approval
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

      default: // fallback
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          filterTrigger: true,
        }));
    }
  };

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
          employeeMyApprovalSearch,
          employeeMyTransactionSearch,
          employeePortfolioSearch,
          employeePendingApprovalSearch,
          lineManagerApprovalSearch
        )}
        onChange={(e) => {
          const value = removeFirstSpace(e.target.value); // ✅ strip leading space
          handleMainInstrumentChange(
            selectedKey,
            activeTab,
            value,
            setEmployeeMyApprovalSearch,
            setEmployeeMyTransactionSearch,
            setEmployeePortfolioSearch,
            setEmployeePendingApprovalSearch,
            setLineManagerApprovalSearch
          );
        }}
        style={{
          borderStartEndRadius: 0,
          borderEndEndRadius: 0,
          borderRight: "none", // merges visually with filter icon
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !visible) {
            handleSearchMain(); // only trigger if popover is closed
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
          handleSearch,
          setVisible
        )}
        trigger="click"
        open={visible}
        onOpenChange={(newVisible) => {
          setVisible(newVisible);

          if (newVisible) {
            // Reset filters when opening popover
            handleSearchMainInputReset({
              selectedKey,
              activeTab,
              setEmployeeMyApprovalSearch,
              setEmployeeMyTransactionSearch,
              setEmployeePortfolioSearch,
              setEmployeePendingApprovalSearch,
              setLineManagerApprovalSearch,
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
