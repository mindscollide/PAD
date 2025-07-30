// components/dropdowns/filters/statusFilterDropdown.jsx
import React, { useEffect, useState } from "react";
import styles from "./filter.module.css";
import { Button, CheckBox } from "../..";
// import { statusOptions } from "./utills"; // your predefined status list
import { Row, Col, Divider } from "antd";
import { emaStatusOptions, emtStatusOptions } from "./utills";
import { useSidebarContext } from "../../../context/sidebarContaxt";

/**
 * Dropdown for selecting status filters with local state management.
 */
const StatusFilterDropdown = ({
  confirm,
  clearFilters,
  setState,
  tempSelected,
  setTempSelected,
}) => {
  const { selectedKey } = useSidebarContext();
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
      default:
        setFilterOptions([]);
    }
  }, [selectedKey]);

  const handleOk = () => {
    setState((prev) => ({
      ...prev,
      status: tempSelected,
    }));
    confirm(); // close dropdown
  };

  const handleReset = () => {
    setTempSelected([]);
    setState((prev) => ({
      ...prev,
      status: [],
    }));
    clearFilters?.();
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
