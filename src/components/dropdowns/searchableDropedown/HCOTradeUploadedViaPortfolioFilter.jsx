import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField, DateRangePicker } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

// 🔹 Initial state (SOURCE OF TRUTH)
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  employeeName: "",
  quantity: "",
  startDate: null,
  endDate: null,
  pageNumber: 0,
  pageSize: 10,
  filterTrigger: false,
};

export const HCOTradeUploadedViaPortfolioFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const {
    hcoTradesUploadViaPortfolioSearch,
    setHCOTradesUploadViaPortfolioSearch,
  } = useSearchBarContext();

  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  // -----------------------------------------------------
  // 🔹 Effects
  // -----------------------------------------------------

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

  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  // -----------------------------------------------------
  // 🔹 Handlers
  // -----------------------------------------------------

  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Quantity → numbers only
    if (name === "quantity") {
      const rawValue = value.replace(/,/g, "");
      if (rawValue === "" || allowOnlyNumbers(rawValue)) {
        setFieldValue(name, rawValue);
      }
      return;
    }

    setFieldValue(name, removeFirstSpace(value));
  };

  const handleDateChange = (dates) => {
    setLocalState((prev) => ({
      ...prev,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    }));
  };

  const handleClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
    }));
  };

  const handleSearchClick = () => {
    const { instrumentName, employeeName, quantity, startDate, endDate } =
      localState;

    setHCOTradesUploadViaPortfolioSearch({
      ...hcoTradesUploadViaPortfolioSearch,
      instrumentName: instrumentName.trim(),
      employeeName: employeeName.trim(),
      quantity: quantity ? Number(quantity) : "",
      startDate,
      endDate,
      pageNumber: 0,
      filterTrigger: true,
    });

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  const handleResetClick = () => {
    setHCOTradesUploadViaPortfolioSearch((prev) => ({
      ...prev,
      instrumentName: "",
      employeeName: "",
      quantity: "",
      startDate: null,
      endDate: null,
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
      {/* ROW 1 */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Enter instrument name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} md={12}>
          <TextField
            label="Employee Name"
            name="employeeName"
            value={localState.employeeName}
            onChange={handleInputChange}
            placeholder="Enter employee name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ROW 2 */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <DateRangePicker
            label="Upload Date"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
            format="YYYY-MM-DD"
          />
        </Col>

        <Col xs={24} md={12}>
          <TextField
            label="Quantity"
            name="quantity"
            value={
              localState.quantity !== ""
                ? Number(localState.quantity).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Enter quantity"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ACTIONS */}
      <Row gutter={[12, 12]} justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              onClick={handleResetClick}
              text="Reset"
              className="big-light-button"
            />
            <Button
              onClick={handleSearchClick}
              text="Search"
              className="big-dark-button"
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
