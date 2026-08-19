import React, { useEffect, useState } from "react";
import { Row, Col, Space, Select } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";
import styles from "./SearchWithPopoverOnly.module.css";

// 🔹 Initial default state
const INITIAL_LOCAL_STATE = {
  requestID: "",
  instrumentName: "",
  quantity: 0,
  startDate: null,
  endDate: null,
  nature: "",
};
const { Option } = Select;
export const EmployeeHistoryFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  // Contexts
  const { employeeMyHistorySearch, setEmployeeMyHistorySearch } =
    useSearchBarContext();

  // Local form state
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  // -----------------------------------------------------
  // 🔹 EFFECTS
  // -----------------------------------------------------

  /**
   * Prefill instrument name if passed from parent (maininstrumentName).
   * Useful for quick search-to-filter transition.
   */
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        instrumentName: maininstrumentName,
      }));
      setClear(false); // Reset external clear flag
      setMaininstrumentName(""); // Clear parent’s prefill value
    }
  }, [maininstrumentName]);

  /**
   * Reset filters if `clear` flag is triggered externally.
   */
  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false); // Reset external clear flag
    }
  }, [clear]);

  // -----------------------------------------------------
  // 🔹 Handlers
  // -----------------------------------------------------

  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  /** Input change handler */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      const rawValue = value.replace(/,/g, "");
      if (
        (rawValue === "" || allowOnlyNumbers(rawValue)) &&
        rawValue.length <= 12
      ) {
        setFieldValue("quantity", rawValue);
      }
    } else {
      setFieldValue(name, removeFirstSpace(value));
    }
  };

  /** Date change */
  const handleDateChange = (dates) => {
    setLocalState({
      ...localState,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    });
  };

  /** Clear dates only */
  const handleClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
    }));
  };

  /** Search click */
  const handleSearchClick = () => {
    const {
      requestID,
      instrumentName,
      quantity,
      startDate,
      endDate,
      nature,
    } = localState;

    const searchPayload = {
      ...employeeMyHistorySearch,
      requestID: requestID?.trim() || "",
      instrumentName: instrumentName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      nature: nature?.trim() || "",
      pageNumber: 0,
      filterTrigger: true,
    };

    setEmployeeMyHistorySearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /** Reset click */
  const handleResetClick = () => {
    setEmployeeMyHistorySearch((prev) => ({
      ...prev,
      requestID: "",
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      nature: "",
      pageNumber: 0,
      filterTrigger: true,
    }));

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  // -----------------------------------------------------
  // 🔹 Render
  // -----------------------------------------------------

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Request ID"
            name="requestID"
            value={localState.requestID}
            onChange={handleInputChange}
            placeholder="Request ID"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Instrument Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Quantity"
            name="quantity" // 👈 should be lowercase to match handler
            value={
              localState.quantity
                ? Number(localState.quantity).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Quantity"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Date Range"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
          />
        </Col>
      </Row>
      {/* Nature - CHANGED (2026-08-18): was a free-text field, but Nature
      is now a fixed two-value vocabulary
      (API_Changes/2026-08-18_employee_my_history_nature_vocabulary.md) -
      the backend does exact string matching and silently returns zero
      rows for anything else, so free text was a trap. Same labeled
      Select pattern already used for this exact purpose elsewhere
      (searchableDropedown/HOCMyAction.jsx's own Nature filter) - single
      -select here since this endpoint's Nature request field is one
      string, not an array. */}
      <Row gutter={[12, 12]} className={styles.bottomGap}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <label className={styles["typeAndStatusLabel"]}>Nature</label>
          <Select
            allowClear
            placeholder="Select Nature"
            size="middle"
            className={styles.statusSelectClass}
            value={localState.nature || undefined}
            onChange={(value) => setFieldValue("nature", value || "")}
            style={{ width: "100%" }}
          >
            <Option value="Approval">Approval</Option>
            <Option value="Verification">Verification</Option>
          </Select>
        </Col>
      </Row>
      <Row gutter={[12, 12]} justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              onClick={handleResetClick}
              text={"Reset"}
              className="big-light-button"
            />
            <Button
              onClick={handleSearchClick}
              text={"Search"}
              className="big-dark-button"
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
