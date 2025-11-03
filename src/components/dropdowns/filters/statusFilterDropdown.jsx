// components/dropdowns/filters/statusFilterDropdown.jsx

import React, { useEffect, useState } from "react";
import styles from "./filter.module.css";
import { Button, CheckBox } from "../..";
import { Row, Col, Divider } from "antd";
import {
  adminBrokersStatus,
  apiCallStatus,
  emaStatusOptions,
  emtStatusOptions,
  emtStatusOptionsForPendingApproval,
  escalated,
} from "./utils";

// Context imports
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useApi } from "../../../context/ApiContext";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useNavigate } from "react-router-dom";
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
  const { selectedKey } = useSidebarContext();
  const { assetTypeListingData } = useDashboardContext();
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
      case "6":
        setFilterOptions(emaStatusOptions);
        break;
      case "4":
        setFilterOptions(emtStatusOptionsForPendingApproval);
        break;
      case "12":
        setFilterOptions(escalated);
        break;
      case "2":
      case "9":
      case "15":
        setFilterOptions(emtStatusOptions);
        break;
      case "19":
      case "18":
        console.log("adminIntrumentListSearch");
        setFilterOptions(adminBrokersStatus);
        break;

      default:
        setFilterOptions([]);
    }
  }, [selectedKey]);
  console.log("adminIntrumentListSearch", state);

  /**
   * Handles confirmation of selected statuses.
   * Updates parent state and triggers API call.
   */
  const handleOk = async () => {
    switch (selectedKey) {
      case "1":
      case "2":
      case "4":
      case "6":
      case "9":
      case "12":
      case "15":
      case "19":
      case "18":
        console.log("adminIntrumentListSearch");
        setState((prev) => ({
          ...prev,
          status: tempSelected,
          pageNumber: 0,
          filterTrigger: true,
        }));
        break;

      default:
        setState((prev) => ({
          ...prev,
          status: tempSelected,
          pageSize: 10, // Pagination: size of page
          pageNumber: 0,
        }));

        await apiCallStatus({
          selectedKey,
          newdata: tempSelected,
          state,
          assetTypeListingData,
          callApi,
          showNotification,
          showLoader,
          navigate,
          setIsEmployeeMyApproval,
          setEmployeeTransactionsData,
          setLineManagerApproval,
        });
        break;
    }

    // 🔹 Common cleanup
    setOpenState(false);
    confirm(); // Close dropdown
  };

  /**
   * Resets filter selections and clears parent state.
   * Also triggers API call with empty filter.
   */
  const handleReset = async () => {
    switch (selectedKey) {
      case "1":
      case "2":
      case "4":
      case "6":
      case "9":
      case "12":
      case "15":
      case "18":
      case "19":
        console.log("adminIntrumentListSearch");
        setState((prev) => ({
          ...prev,
          status: [],
          pageNumber: 0,
          filterTrigger: true,
        }));
        break;

      default:
        await apiCallStatus({
          selectedKey,
          newdata: [],
          state,
          assetTypeListingData,
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
          pageSize: 10,
          pageNumber: 0,
        }));
        break;
    }

    // 🔹 Common cleanup
    setTempSelected([]);
    clearFilters?.();
    setOpenState(false);
    confirm(); // Close dropdown
  };

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
