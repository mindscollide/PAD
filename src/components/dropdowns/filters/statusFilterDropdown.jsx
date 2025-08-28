// components/dropdowns/filters/statusFilterDropdown.jsx
import React, { useEffect, useState } from "react";
import styles from "./filter.module.css";
import { Button, CheckBox } from "../..";
// import { statusOptions } from "./utills"; // your predefined status list
import { Row, Col, Divider } from "antd";
import { apiCallStatus, emaStatusOptions, emtStatusOptions } from "./utils";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useApi } from "../../../context/ApiContext";
import { useGlobalLoader } from "../../../context/LoaderContext";
import useNotification from "antd/es/notification/useNotification";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useNavigate } from "react-router-dom";
import { useDashboardContext } from "../../../context/dashboardContaxt";

/**
 * Dropdown for selecting status filters with local state management.
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
  const { addApprovalRequestData } = useDashboardContext();
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const { setIsEmployeeMyApproval } = useMyApproval();
  const [filterOption, setFilterOptions] = useState([]);

  const toggleSelection = (status) => {
    setTempSelected((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };

  useEffect(() => {
    switch (selectedKey) {
      case "1":
        setFilterOptions(emaStatusOptions);
        break;
      case "2":
        setFilterOptions(emtStatusOptions);
        break;
      case "4":
        setFilterOptions(emtStatusOptions);
        break;
      case "6":
        setFilterOptions(emtStatusOptions);
        break;
      default:
        setFilterOptions([]);
    }
  }, [selectedKey]);

  const handleOk = async () => {
    setState((prev) => ({
      ...prev,
      status: tempSelected,
    }));
    let newdata = tempSelected;
    console.log("hello test", newdata);
    await apiCallStatus({
      selectedKey,
      newdata,
      state,
      addApprovalRequestData,
      callApi,
      showNotification,
      showLoader,
      navigate,
      setIsEmployeeMyApproval,
    });
    setOpenState(false);

    confirm(); // close dropdown
  };

  const handleReset = async () => {
    let newdata = [];
    console.log("hello test", newdata);
    await apiCallStatus({
      selectedKey,
      newdata,
      state,
      addApprovalRequestData,
      callApi,
      showNotification,
      showLoader,
      navigate,
      setIsEmployeeMyApproval,
    });
    setTempSelected([]);
    setState((prev) => ({
      ...prev,
      status: [],
    }));
    clearFilters?.();
    setOpenState(false);
    confirm(); // close dropdown
  };

  return (
    <div className={styles.dropdownContainer}>
      <div className={styles.checkboxList}>
        {filterOption?.map((status, index) => (
          <>
            <CheckBox
              key={status}
              value={status}
              label={status}
              checked={tempSelected.includes(status)}
              onChange={() => toggleSelection(status)}
            />
            {filterOption?.length - 1 !== index && (
              <Divider className={styles.divider} />
            )}
          </>
        ))}
      </div>

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
