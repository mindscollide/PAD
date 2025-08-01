import React, { useState, useEffect } from "react";
import styles from "./filter.module.css";
import { Button, CheckBox } from "../..";
import { mapBuySellToIds, typeOptions } from "./utills";
import { Row, Col, Divider } from "antd";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { SearchTadeApprovals } from "../../../api/myApprovalApi";
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

  const apiCall = async (selectedKey, statusTypeIds) => {
    switch (selectedKey) {
      case "1":
        console.log("handleOk", statusTypeIds);

        let requestdata = {
          InstrumentName: state.instrumentName || state.mainInstrumentName,
          StartDate: state.date || "",
          Quantity: state.quantity || 0,
          StatusIds: state.status || [],
          TypeIds: statusTypeIds || [],
          PageNumber: state.pageNumber || 1,
          Length: state.pageSize || 10,
        };
        console.log("handleOk", requestdata);
        showLoader(true);

        const data = await SearchTadeApprovals({
          callApi,
          showNotification,
          showLoader,
          requestdata, // ✅ pass filters
          navigate,
        });
        console.log("handleOk", data);
        setIsEmployeeMyApproval(data);

        break;

      case "2":
        // callFixedIncomeAPI();
        break;

      case "3":
        // callCommoditiesAPI();
        break;

      default:
        console.warn("No matching key for API call");
        break;
    }
  };
  const handleOk = () => {
    const statusTypeIds = mapBuySellToIds(tempSelected);

    setState((prev) => ({
      ...prev,
      type: tempSelected,
    }));
    console.log("handleOk", statusTypeIds);
    apiCall(selectedKey, statusTypeIds);
    confirm(); // close dropdown
  };

  const handleReset = () => {
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
