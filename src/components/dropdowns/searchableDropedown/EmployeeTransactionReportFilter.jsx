import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";
import styles from "./SearchWithPopoverOnly.module.css";

// 🔹 Initial default state
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  startDate: null,
  endDate: null,
  quantity: 0,
  broker: "",
  actionStartDate: null,
  actionEndDate: null,
  actionBy: "",
};

export const EmployeeTransactionReportFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  // Contexts
  const {
    employeeMyTransactionReportSearch,
    setEmployeeMyTransactionReportSearch,
  } = useSearchBarContext();

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

  /** Date change For Action Date Range */
  const handlerForActionDateChange = (dates) => {
    setLocalState({
      ...localState,
      actionStartDate: dates?.[0] || null,
      actionEndDate: dates?.[1] || null,
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

  /** Clearor Action Date Range dates only */
  const handlerActionRangeClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      actionStartDate: null,
      actionEndDate: null,
    }));
  };

  /** Search click */
  const handleSearchClick = () => {
    const {
      instrumentName,
      quantity,
      startDate,
      endDate,
      broker,
      actionStartDate,
      actionEndDate,
      actionBy,
    } = localState;

    const searchPayload = {
      ...employeeMyTransactionReportSearch,
      instrumentName: instrumentName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      broker: broker?.trim() || "",
      actionStartDate: actionStartDate || null,
      actionEndDate: actionEndDate || null,
      actionBy: actionBy?.trim() || "",
      pageNumber: 0,
      filterTrigger: true,
    };

    setEmployeeMyTransactionReportSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /** Reset click */
  const handleResetClick = () => {
    setEmployeeMyTransactionReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      status: [],
      type: [],
      broker: "",
      actionBy: "",
      actionStartDate: null,
      actionEndDate: null,
      pageNumber: 0,
      pageSize: 10,
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
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Instrument Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Transaction date range"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
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
          <TextField
            label="Brokers"
            name="broker"
            value={localState.broker}
            onChange={handleInputChange}
            placeholder="Brokers"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Action date range"
            size="medium"
            value={[localState.actionStartDate, localState.actionEndDate]}
            onChange={handlerForActionDateChange}
            onClear={handlerActionRangeClearDates}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Action By"
            name="actionBy"
            value={localState.actionBy}
            onChange={handleInputChange}
            placeholder="Action By"
            size="medium"
            classNames="Search-Field"
          />
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
