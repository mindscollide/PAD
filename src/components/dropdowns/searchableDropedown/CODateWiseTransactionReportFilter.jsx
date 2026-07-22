import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

// 🔹 Initial state matching your global state structure
// (startDate/endDate deliberately excluded — that's controlled by the
// DateRangePicker on COdataWiseTransactionsReports, not this filter panel)
const INITIAL_LOCAL_STATE = {
  employeeID: "",
  employeeName: "",
  departmentName: "",
  instrumentName: "",
  quantity: "",
  type: [],
  status: [],
};

export const CODateWiseTransactionReportFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const {
    coDatewiseTransactionReportSearch,
    setCODatewiseTransactionReportSearch,
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
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "quantity":
      case "employeeID": {
        const rawValue = value.replace(/,/g, "");
        if (
          (rawValue === "" || allowOnlyNumbers(rawValue)) &&
          rawValue.length <= 12
        ) {
          setFieldValue(name, rawValue);
        }
        break;
      }

      default:
        setFieldValue(name, removeFirstSpace(value));
    }
  };

  const handleSearchClick = () => {
    const {
      employeeID,
      employeeName,
      departmentName,
      instrumentName,
      quantity,
    } = localState;

    // Spreading coDatewiseTransactionReportSearch first means whatever
    // startDate/endDate is currently set via the report page's
    // DateRangePicker carries through untouched — this filter no longer
    // owns or overwrites the date range.
    const searchPayload = {
      ...coDatewiseTransactionReportSearch,
      employeeID: employeeID ? Number(employeeID) : 0,
      employeeName: employeeName?.trim() || "",
      departmentName: departmentName?.trim() || "",
      instrumentName: instrumentName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      pageNumber: 0,
      filterTrigger: true,
    };

    setCODatewiseTransactionReportSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  const handleResetClick = () => {
    // NOTE: startDate/endDate intentionally left out — Reset only clears
    // the fields this panel owns, not the date range from the separate picker.
    setCODatewiseTransactionReportSearch((prev) => ({
      ...prev,
      employeeID: 0,
      employeeName: "",
      departmentName: "",
      instrumentName: "",
      quantity: "",
      type: [],
      status: [],
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
      {/* ROW 1: Employee ID & Employee Name */}
      <Row gutter={[12, 12]}>
        {/* <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Employee ID"
            name="employeeID"
            value={localState.employeeID}
            onChange={handleInputChange}
            placeholder="Employee ID"
            size="medium"
            classNames="Search-Field"
          />
        </Col> */}
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

      {/* ROW 2: Department & Instrument */}
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
      </Row>

      {/* ROW 3: Quantity (Date Range moved out — now controlled from the report page header) */}

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
