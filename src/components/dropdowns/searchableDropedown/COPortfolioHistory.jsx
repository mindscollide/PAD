import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField, DateRangePicker } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

// 🔹 Initial state matching your global state structure
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  departmentName: "",
  requesterName: "",
  quantity: "",
  pageNumber: 0,
  pageSize: 10,
  filterTrigger: false,
};

export const COPortfolioHisttory = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const { coPortfolioHistoryReportSearch, setCoPortfolioHistoryReportSearch } =
    useSearchBarContext();

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
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Remove commas first
    const rawValue = value.replace(/,/g, "");

    if (name === "quantity") {
      // Allow empty or numbers only
      if (rawValue === "" || allowOnlyNumbers(rawValue)) {
        setFieldValue(name, rawValue);
      }
      return;
    }

    setFieldValue(name, removeFirstSpace(value));
  };

  const handleSearchClick = () => {
    const { instrumentName, requesterName, departmentName, quantity } =
      localState;

    const searchPayload = {
      ...coPortfolioHistoryReportSearch,
      instrumentName: instrumentName?.trim() || "",
      requesterName: requesterName?.trim() || "",
      departmentName: departmentName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      filterTrigger: true,
      pageNumber: 0,
      pageSize: 10,
    };

    setCoPortfolioHistoryReportSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  const handleResetClick = () => {
    setCoPortfolioHistoryReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      departmentName: "",
      quantity: "",
      filterTrigger: true,
      pageNumber: 0,
      pageSize: 10,
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
      {/* ROW 1: Department & Instrument */}
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
          <TextField
            label="Employee Name"
            name="employeeName"
            value={localState.requesterName}
            onChange={handleInputChange}
            placeholder="Requester Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ROW 2: Quantity & Date Range */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Department Name"
            name="departmentName"
            value={localState.departmentName}
            onChange={handleInputChange}
            placeholder="Department Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Quantity"
            name="quantity"
            value={
              localState.quantity !== "" && !isNaN(localState.quantity)
                ? Number(localState.quantity).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Quantity"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ACTION ROW */}
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
