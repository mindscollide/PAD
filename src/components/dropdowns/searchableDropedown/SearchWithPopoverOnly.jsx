import React, { useState } from "react";
import { Input, Popover, Space } from "antd";

// Assets
import SearchFilterIcon from "../../../assets/img/search-filter-icon.png";

// Components and Utilities
import {
  getMainSearchInputValueByKey,
  handleMainInstrumentChange,
  handleSearchMainInputReset,
  renderFilterContent,
} from "./utill";
import styles from "./SearchWithPopoverOnly.module.css";

// Contexts
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { usePortfolioContext } from "../../../context/portfolioContax";

/**
 * SearchWithPopoverOnly
 * ----------------------
 * A search input component with a popover filter for refining results.
 *
 * Features:
 * - Search input tied to `employeeMyApprovalSearch.mainInstrumentName`
 * - Dynamic styling based on sidebar collapse state
 * - Filter icon triggers popover containing additional filter options
 * - Controlled via `useSearchBarContext` and `useSidebarContext`
 */
const SearchWithPopoverOnly = () => {
  /**
   * useSidebarContext its state handler for this sidebar.
   * - collapsed for check if its open and closed side abr
   * - selectedKey is for which tab or route is open
   */
  const { collapsed, selectedKey } = useSidebarContext();

  // Local state to control popover visibility
  const [visible, setVisible] = useState(false);

  /**
   * SearchBarContext its state handler for this function.
   * - instrumentName for instruments of dropdown menu
   * - quantity for quantity of dropdown menu
   * - date for date of dropdown menu
   * - mainInstrumentName for main search bar input
   * - instrumentName and this mainInstrumentName contain same data but issue is we have to handel both diferently
   * - resetEmployeeMyApprovalSearch is to reset all their state to its initial
   */
  const {
    // for employee my approval
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    resetEmployeeMyApprovalSearch,

    // for employee my transaction
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch,
    resetEmployeeMyTransactionSearch,

    // for employee portfolio
    employeePortfolioSearch,
    setEmployeePortfolioSearch,
    resetEmployeePortfolioSearch,

    // for employee portfolio
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,
  } = useSearchBarContext();
  const { activeTab } = usePortfolioContext();

  const dropdownOptions = [
    { value: "1", label: "Jack" },
    { value: "2", label: "Lucy" },
    { value: "3", label: "Tom" },
  ];
  /**
   * Handles execution of the search logic when filters are applied.
   */
  const handleSearch = () => {
    switch (selectedKey) {
      case "1":
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          filterTrigger: true,
        }));
        break;
      case "2":
        setEmployeeMyTransactionSearch((prev) => ({
          ...prev,
          filterTrigger: true,
        }));
        break;
      case "4":
        switch (activeTab) {
          case "portfolio":
            setEmployeePortfolioSearch((prev) => ({
              ...prev,
              filterTrigger: true,
            }));
            break;
          case "pending":
            setEmployeePendingApprovalSearch((prev) => ({
              ...prev,
              filterTrigger: true,
            }));
            break;
          default:
            setEmployeePortfolioSearch((prev) => ({
              ...prev,
              filterTrigger: true,
            }));
        }

        break;
      default:
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          filterTrigger: true,
        }));
    }

    setVisible(false);
    // Trigger fetch or filter logic here
  };

  const handleSearchMain = () => {
    switch (selectedKey) {
      case "1":
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          filterTrigger: true,
        }));
        break;
      case "2":
        setEmployeeMyTransactionSearch((prev) => ({
          ...prev,
          filterTrigger: true,
        }));
        break;
      case "4":
        switch (activeTab) {
          case "portfolio":
            setEmployeePortfolioSearch((prev) => ({
              ...prev,
              filterTrigger: true,
            }));
            break;
          case "pending":
            setEmployeePendingApprovalSearch((prev) => ({
              ...prev,
              filterTrigger: true,
            }));

            break;
          default:
            setEmployeePortfolioSearch((prev) => ({
              ...prev,
              filterTrigger: true,
            }));
        }

        break;
      default:
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          filterTrigger: true,
        }));
    }
  };

  return (
    <Space.Compact className={styles.searchWrapper}>
      {/* Main Search Input */}
      <Input
        placeholder="Search on Instrument"
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
          employeePendingApprovalSearch
        )}
        onChange={(e) =>
          handleMainInstrumentChange(
            selectedKey,
            activeTab,
            e.target.value,
            setEmployeeMyApprovalSearch,
            setEmployeeMyTransactionSearch,
            setEmployeePortfolioSearch,
            setEmployeePendingApprovalSearch
          )
        }
        style={{
          borderStartEndRadius: 0,
          borderEndEndRadius: 0,
          borderRight: "none", // Removes right border to blend with icon
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !visible) {
            handleSearchMain(); // only triggers when popover is NOT open
          }
        }}
      />

      {/* Popover Filter Trigger */}
      <Popover
        overlayClassName={
          collapsed ? styles.popoverContenCollapsed : styles.popoverContent
        }
        content={renderFilterContent(
          selectedKey,
          activeTab,
          handleSearch,
          dropdownOptions
        )}
        trigger="click"
        open={visible}
        onOpenChange={(newVisible) => {
          setVisible(newVisible);

          if (newVisible) {
            handleSearchMainInputReset({
              selectedKey,
              activeTab,
              setEmployeeMyApprovalSearch,
              setEmployeeMyTransactionSearch,
              setEmployeePortfolioSearch,
              setEmployeePendingApprovalSearch,
            });
          }
        }}
        placement="bottomRight"
        getPopupContainer={(triggerNode) =>
          triggerNode.parentElement || document.body
        }
      >
        <img
          src={SearchFilterIcon}
          alt="filter"
          className={styles.filterIcon}
        />
      </Popover>
    </Space.Compact>
  );
};

export default SearchWithPopoverOnly;
