// components/dropdowns/filters/statusFilterDropdown.jsx

import React, { useEffect, useState } from "react";
import styles from "./filter.module.css";
import { Button, CheckBox } from "../..";
import { Row, Col, Divider } from "antd";
import {
  apiCallStatus,
  emaStatusOptions,
  emtStatusOptions,
  emtStatusOptionsForPendingApproval,
} from "./utils";

// Context imports
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useApi } from "../../../context/ApiContext";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useLocation, useNavigate } from "react-router-dom";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { useTransaction } from "../../../context/myTransaction";

/**
 * StatusFilterDropdown Component
 *
 * A dropdown component that allows users to filter approvals based on status.
 * Options are dynamically chosen depending on the `selectedKey` from the sidebar.
 * It integrates with global contexts for API calls, loader, notifications, and approvals state.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.confirm - Function to confirm selection (closes dropdown).
 * @param {Function} props.clearFilters - Function to clear selected filters.
 * @param {Function} props.setOpenState - State setter to control dropdown visibility.
 * @param {Object} props.state - Parent filter state object.
 * @param {Function} props.setState - State setter for parent filter state.
 * @param {Array} props.tempSelected - Temporary list of selected statuses.
 * @param {Function} props.setTempSelected - Setter for temporary selected statuses.
 *
 * @returns {JSX.Element} Rendered Status Filter Dropdown
 */
const StatusFilterDropdown = ({
  confirm,
  clearFilters,
  setOpenState,
  state,
  setState,
  tempSelected,
  setTempSelected,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedKey } = useSidebarContext();
  const { addApprovalRequestData } = useDashboardContext();
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const { setIsEmployeeMyApproval, setLineManagerApproval } = useMyApproval();

  const { setEmployeeTransactionsData } = useTransaction();
  const [filterOption, setFilterOptions] = useState([]);
  // Reset local state on route change
  // useEffect(() => {
  //   setTempSelected([]);
  //   setFilterOptions([]);
  // }, [location.pathname]);
  /**
   * Toggles the selection state of a status option.
   * @param {string} status - The status being toggled.
   */
  const toggleSelection = (status) => {
    setTempSelected(
      (prev) =>
        prev.includes(status)
          ? prev.filter((item) => item !== status) // Remove if already selected
          : [...prev, status] // Add if not selected
    );
  };

  /**
   * Updates available filter options based on sidebar selection.
   */
  useEffect(() => {
    switch (selectedKey) {
      case "1":
        setFilterOptions(emaStatusOptions);
        break;
      case "2":
        // setFilterOptions(emaStatusOptions);
        setFilterOptions(emtStatusOptions);
        break;
      case "4":
        setFilterOptions(emtStatusOptionsForPendingApproval);
        break;
      case "6":
        setFilterOptions(emaStatusOptions);
        break;
      default:
        setFilterOptions([]);
    }
  }, [selectedKey]);

  /**
   * Handles confirmation of selected statuses.
   * Updates parent state and triggers API call.
   */
  const handleOk = async () => {
    // we handle employe profolio from here
    if (selectedKey === "4") {
      setState((prev) => ({
        ...prev,
        status: tempSelected,
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        status: tempSelected,
        pageSize:10, // Pagination: size of page
        pageNumber: 0,
      }));

      await apiCallStatus({
        selectedKey,
        newdata: tempSelected,
        state,
        addApprovalRequestData,
        callApi,
        showNotification,
        showLoader,
        navigate,
        setIsEmployeeMyApproval,
        setEmployeeTransactionsData,
        setLineManagerApproval,
      });
    }
    setOpenState(false);
    confirm(); // Close dropdown
  };

  /**
   * Resets filter selections and clears parent state.
   * Also triggers API call with empty filter.
   */
  const handleReset = async () => {
    // we handle employe profolio from here
    if (selectedKey === "4") {
      setState((prev) => ({
        ...prev,
        status: [],
        pageSize: 0,
        pageNumber: 10,
        filterTrigger: true,
      }));
    } else {
      await apiCallStatus({
        selectedKey,
        newdata: [],
        state,
        addApprovalRequestData,
        callApi,
        showNotification,
        showLoader,
        navigate,
        setIsEmployeeMyApproval,
        setEmployeeTransactionsData,
        setLineManagerApproval,
      });

      setState((prev) => ({
        ...prev,
        status: [],
        pageSize: 0,
        pageNumber: 10,
      }));
    }
    setTempSelected([]);
    clearFilters?.();
    setOpenState(false);
    confirm(); // Close dropdown
  };
  console.log("selected tempSelected",tempSelected)

  return (
    <div className={styles.dropdownContainer}>
      {/* Checkbox List */}
      <div className={styles.checkboxList}>
        {filterOption?.map((status, index) => (
          <React.Fragment key={status}>
            <CheckBox
              value={status}
              label={status}
              checked={tempSelected.includes(status)}
              onChange={() => toggleSelection(status)}
            />
            {filterOption.length - 1 !== index && (
              <Divider className={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonGroup}>
        <Row gutter={10}>
          <Col>
            <Button
              className="small-light-button"
              text="Reset"
              onClick={handleReset}
            />
          </Col>
          <Col>
            <Button
              className="small-dark-button"
              text="Ok"
              onClick={handleOk}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default StatusFilterDropdown;
