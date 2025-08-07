import React, { useState, useEffect } from "react";
import styles from "./filter.module.css";
import { Button, CheckBox } from "../..";
import { apiCallType, mapBuySellToIds, typeOptions } from "./utils";
import { Row, Col, Divider } from "antd";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useNavigate } from "react-router-dom";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useNotification } from "../../NotificationProvider/NotificationProvider";
import { useMyApproval } from "../../../context/myApprovalContaxt";

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
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const { setIsEmployeeMyApproval } = useMyApproval();

  const { callApi } = useApi();

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
    <div className={styles.dropdownContainer}>
      <div className={styles.checkboxList}>
        {typeOptions.map((type, index) => (
          <>
            <CheckBox
              key={type}
              value={type}
              label={type}
              checked={tempSelected.includes(type)}
              onChange={() => toggleSelection(type)}
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

export default TypeFilterDropdown;
