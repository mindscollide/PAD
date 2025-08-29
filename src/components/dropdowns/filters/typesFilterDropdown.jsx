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
  const { setIsEmployeeMyApproval } = useMyApproval();

  console.log(addApprovalRequestData, "CheckerDataCheckerData");

  const { callApi } = useApi();
  const typeOptions = getTypeOptions(addApprovalRequestData);
  console.log(typeOptions, "typeOptions");

  const toggleSelection = (type) => {
    setTempSelected((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  const handleOk = async () => {
    setState((prev) => ({
      ...prev,
      type: tempSelected,
    }));
    console.log("hello test", tempSelected);
    let newdata = tempSelected;
    console.log("hello test", newdata);
    await apiCallType({
      selectedKey,
      newdata,
      addApprovalRequestData,
      state,
      callApi,
      showNotification,
      showLoader,
      navigate,
      setIsEmployeeMyApproval,
    });

    confirm(); // close dropdown
  };

  const handleReset = async () => {
    let newdata = [];
    console.log("hello test", newdata);
    await apiCallType({
      selectedKey,
      newdata,
      addApprovalRequestData,
      state,
      callApi,
      showNotification,
      showLoader,
      navigate,
      setIsEmployeeMyApproval,
    });
    setTempSelected([]);
    setState((prev) => ({
      ...prev,
      type: [],
    }));
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
