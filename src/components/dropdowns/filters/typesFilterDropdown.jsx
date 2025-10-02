import React, { useState, useEffect } from "react";
import styles from "./filter.module.css";
import { Button, CheckBox } from "../..";
import { apiCallType, getTypeOptions } from "./utils";
import { Row, Col, Divider } from "antd";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useNavigate } from "react-router-dom";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useNotification } from "../../NotificationProvider/NotificationProvider";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { useTransaction } from "../../../context/myTransaction";

/**
 * Dropdown for selecting types with local state management.
 */
const TypeFilterDropdown = ({
  confirm,
  clearFilters,
  state,
  setState,
  tempSelected,
  setTempSelected,
}) => {
  const navigate = useNavigate();
  const { selectedKey } = useSidebarContext();
  const { addApprovalRequestData } = useDashboardContext();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const { setIsEmployeeMyApproval, setLineManagerApproval } = useMyApproval();

  const { setEmployeeTransactionsData } = useTransaction();

  const { callApi } = useApi();
  const typeOptions = getTypeOptions(addApprovalRequestData);
  const toggleSelection = (type) => {
    setTempSelected((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  const handleOk = async () => {
    let newdata = tempSelected;
    // we handle employe profolio from here
    if (selectedKey === "4") {
      setState((prev) => ({
        ...prev,
        type: tempSelected,
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (selectedKey === "9") {
      setState((prev) => ({
        ...prev,
        type: tempSelected,
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (selectedKey === "12") {
      setState((prev) => ({
        ...prev,
        type: tempSelected,
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (selectedKey === "1") {
      setState((prev) => ({
        ...prev,
        type: tempSelected,
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        type: tempSelected,
        pageNumber: 0,
      }));
      await apiCallType({
        selectedKey,
        newdata,
        addApprovalRequestData,
        state,
        callApi,
        showNotification,
        showLoader,
        navigate,
        setEmployeeTransactionsData,
        setIsEmployeeMyApproval,
        setLineManagerApproval,
      });
    }

    confirm(); // close dropdown
  };

  const handleReset = async () => {
    let newdata = [];
    // we handle employe profolio from here
    if (selectedKey === "4") {
      setState((prev) => ({
        ...prev,
        type: [],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (selectedKey === "9") {
      setState((prev) => ({
        ...prev,
        type: [],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (selectedKey === "12") {
      setState((prev) => ({
        ...prev,
        type: [],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (selectedKey === "15") {
      setState((prev) => ({
        ...prev,
        type: [],
        pageNumber: 0,
        filterTrigger: true,
      }));
    }else if (selectedKey === "1") {
      setState((prev) => ({
        ...prev,
        type: [],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      await apiCallType({
        selectedKey,
        newdata,
        addApprovalRequestData,
        state,
        callApi,
        showNotification,
        showLoader,
        navigate,
        setEmployeeTransactionsData,
        setIsEmployeeMyApproval,
        setLineManagerApproval,
      });
      setState((prev) => ({
        ...prev,
        type: [],
        pageNumber: 0,
      }));
    }
    setTempSelected([]);
    clearFilters?.();
    confirm(); // close dropdown
  };

  return (
    <div className={styles.dropdownContainerForType}>
      <div className={styles.checkboxList}>
        {typeOptions.map((type, index) => (
          <>
            <CheckBox
              key={type.assetTypeID}
              value={type.label}
              label={type.label}
              checked={tempSelected.includes(type.label)}
              onChange={() => toggleSelection(type.label)}
            />
            {typeOptions.length - 1 !== index && (
              <Divider className={styles.divider} />
            )}
          </>
        ))}
      </div>

      <div className={styles.buttonGroup}>
        <Row gutter={10}>
          <Col>
            <Button
              className="small-light-button-For-Types"
              text="Reset"
              onClick={handleReset}
            />
          </Col>
          <Col>
            <Button
              className="small-dark-button-For-Types"
              text="Ok"
              onClick={handleOk}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TypeFilterDropdown;
