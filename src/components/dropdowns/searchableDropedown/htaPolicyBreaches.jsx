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
  employeeName: "",
  departmentName: "",
  quantity: "",
  startDate: null,
  endDate: null,
};

export const HTAPolicyBreachesReportFilter = ({
  setVisible,
  clear,
  setClear,
  maininstrumentName,
  setMaininstrumentName,
}) => {
  /* ===========================================================================
   * 📌 Context
   * =========================================================================== */
  const { htaPolicyBreachesReportSearch, setHTAPolicyBreachesReportSearch } =
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

  /** 🔍 Search */
  const handleSearchClick = () => {
    const {
      instrumentName,
      employeeName,
      departmentName,
      quantity,
      startDate,
      endDate,
    } = localState;

    setHTAPolicyBreachesReportSearch({
      ...htaPolicyBreachesReportSearch,
      instrumentName: instrumentName?.trim() || "",
      employeeName: employeeName?.trim() || "",
      departmentName: departmentName?.trim() || "",
      quantity: quantity || "",
      startDate,
      endDate,
      pageNumber: 0,
      filterTrigger: true,
    });

    setVisible(false);
    setClear(false);
  };

  /** ♻️ Reset */
  const handleResetClick = () => {
    setHTAPolicyBreachesReportSearch({
      instrumentName: "",
      employeeID: "",
      employeeName: "",
      quantity: "",
      departmentName: "",
      startDate: null,
      endDate: null,
      type: [],
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
            label="Employee Name"
            name="employeeName"
            value={localState.employeeName}
            onChange={handleInputChange}
            placeholder="Employee Name"
            size="medium"
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Department Name"
            name="departmentName"
            value={localState.departmentName}
            onChange={handleInputChange}
            placeholder="Department Name"
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
            label="Transaction Date Range"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
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
