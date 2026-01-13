import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

/* =============================================================================
 * 🔹 Initial Local State (Fully Aligned with Global State)
 * =============================================================================
 */
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  employeeID: 0,
  startDate: "",
  endDate: "",
  actionStartDate: "",
  actionEndDate: "",
  actionBy: "",
  tat: "",
};

export const HTATATViewDetailFilter = ({
  setVisible,
  clear,
  setClear,
  maininstrumentName,
  setMaininstrumentName,
}) => {
  /* ===========================================================================
   * 📌 Context
   * =========================================================================== */
  const { htaTATViewDetailsSearch, setHTATATViewDetailsSearch } =
    useSearchBarContext();

  /* ===========================================================================
   * 🧠 Local State
   * =========================================================================== */
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  /* ===========================================================================
   * 🔄 Effects
   * =========================================================================== */

  // Prefill Instrument Name
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        instrumentName: maininstrumentName,
      }));
      setClear(false);
      setMaininstrumentName("");
    }
  }, [maininstrumentName]);

  // External Clear
  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  /* ===========================================================================
   * 🛠 Handlers
   * =========================================================================== */

  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  /** Input change */
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

  /** Date range */
  const handleDateChange = (dates) => {
    setLocalState((prev) => ({
      ...prev,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    }));
  };

  /** Clear dates */
  const handleClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
    }));
  };

  /** Date range */
  const handleDateChangeEscalated = (dates) => {
    setLocalState((prev) => ({
      ...prev,
      escalatedStartDate: dates?.[0] || null,
      escalatedEndDate: dates?.[1] || null,
    }));
  };

  /** Clear dates */
  const handleClearDatesEscalated = () => {
    setLocalState((prev) => ({
      ...prev,
      escalatedStartDate: null,
      escalatedEndDate: null,
    }));
  };

  /** 🔍 Search */
  const handleSearchClick = () => {
    const {
      instrumentName,
      employeeID,
      actionBy,
      startDate,
      endDate,
      actionStartDate,
      actionEndDate,
    } = localState;

    setHTATATViewDetailsSearch({
      ...htaTATViewDetailsSearch,
      instrumentName: instrumentName?.trim() || "",
      employeeID: 0,
      actionBy: "",
      tat: "",
      startDate,
      endDate,
      actionStartDate,
      actionEndDate,
      pageNumber: 0,
      filterTrigger: true,
    });

    setVisible(false);
    setClear(false);
  };

  /** ♻️ Reset */
  const handleResetClick = () => {
    setHTATATViewDetailsSearch({
      instrumentName: "",
      employeeID: 0,
      startDate: "",
      endDate: "",
      actionStartDate: "",
      actionEndDate: "",
      actionBy: "",
      tat: "",
      pageNumber: 0,
      pageSize: 10,
      filterTrigger: true,
    });

    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /* ===========================================================================
   * 🖥 Render
   * =========================================================================== */
  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Instrument Name"
            size="medium"
          />
        </Col>

        <Col xs={24} md={12}>
          <TextField
            label="Quantity"
            name="quantity"
            value={
              localState.quantity
                ? Number(localState.quantity).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Quantity"
            size="medium"
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <DateRangePicker
            label="Request Date Range"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
          />
        </Col>
        <Col xs={24} md={12}>
          <DateRangePicker
            label="Escalated Date Range"
            size="medium"
            value={[localState.escalatedStartDate, localState.escalatedEndDate]}
            onChange={handleDateChangeEscalated}
            onClear={handleClearDatesEscalated}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Action By"
            name="actionBy "
            value={
              localState.actionBy
                ? Number(localState.actionBy).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Action By"
            size="medium"
          />
        </Col>
        <Col xs={24} md={12}>
          <TextField
            label="TAT"
            name="tat"
            value={
              localState.tat
                ? Number(localState.tat).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="TAT"
            size="medium"
          />
        </Col>
      </Row>

      <Row justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              text="Reset"
              onClick={handleResetClick}
              className="big-light-button"
            />
            <Button
              text="Search"
              onClick={handleSearchClick}
              className="big-dark-button"
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
