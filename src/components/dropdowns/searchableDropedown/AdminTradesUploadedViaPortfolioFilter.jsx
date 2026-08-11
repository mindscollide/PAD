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
  employeeName: "",
  quantity: 0,
  startDate: null,
  endDate: null,
  pageNumber: 0,
  pageSize: 10,
  filterTrigger: false,
};

// Type/Status are filtered via their own table column-header dropdowns
// (TypeColumnTitle/StatusColumnTitle), same split already used by
// Policy Breaches / Date-wise Transaction Report - this popover only
// covers the plain text/date/quantity fields.
export const AdminTradesUploadedViaPortfolioFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const {
    adminTradesUploadedviaPortfolioReportSearch,
    setAdminTradesUploadedviaPortfolioReportSearch,
  } = useSearchBarContext();

  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

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

  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/,/g, "");

    if (name === "quantity") {
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
    setLocalState((prev) => ({ ...prev, startDate: null, endDate: null }));
  };

  const handleSearchClick = () => {
    const { instrumentName, employeeName, quantity, startDate, endDate } =
      localState;

    const searchPayload = {
      ...adminTradesUploadedviaPortfolioReportSearch,
      instrumentName: instrumentName?.trim() || "",
      employeeName: employeeName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      pageNumber: 0,
      filterTrigger: true,
    };

    setAdminTradesUploadedviaPortfolioReportSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  const handleResetClick = () => {
    setAdminTradesUploadedviaPortfolioReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      employeeName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

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
          <TextField
            label="Employee Name"
            name="employeeName"
            value={localState.employeeName}
            onChange={handleInputChange}
            placeholder="Employee Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
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
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Uploaded Date"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>

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
