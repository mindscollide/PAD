import React, { useState, useEffect } from "react";
import styles from "./filter.module.css";
import { Button, CheckBox } from "../..";
import { typeOptions } from "./utills";
import { Row, Col, Divider } from "antd";

/**
 * Dropdown for selecting types with local state management.
 */
const TypeFilterDropdown = ({
  confirm,
  clearFilters,
  setState,
  tempSelected,
  setTempSelected,
}) => {
  const toggleSelection = (type) => {
    setTempSelected((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  const handleOk = () => {
    setState((prev) => ({
      ...prev,
      type: tempSelected,
    }));
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
