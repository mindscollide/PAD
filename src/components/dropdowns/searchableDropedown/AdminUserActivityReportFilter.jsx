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
  employeeName: "",
  ipAddress: 0,
  startDate: null,
  endDate: null,
  pageNumber: 0,
  pageSize: 10,
  filterTrigger: false,
};

export const AdminUserActivityReportFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const { userActivityReportAdmin, setUserActivityReportAdmin } =
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

    if (name === "ipAddress") {
      // Allow empty or numbers only
      if (rawValue === "" || allowOnlyNumbers(rawValue)) {
        setFieldValue(name, rawValue);
      }
      return;
    }

    setFieldValue(name, removeFirstSpace(value));
  };

  const handleDateChange = (dates) => {
    setLocalState({
      ...localState,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    });
  };

  const handleClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
    }));
  };

  const handleSearchClick = () => {
    const { employeeName, ipAddress, startDate, endDate } = localState;

    const searchPayload = {
      ...userActivityReportAdmin,
      employeeName: employeeName?.trim() || "",
      ipAddress: ipAddress ? Number(ipAddress) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      pageNumber: 0,
      filterTrigger: true,
    };

    setUserActivityReportAdmin(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  const handleResetClick = () => {
    setUserActivityReportAdmin((prev) => ({
      ...prev,
      employeeName: "",
      ipAddress: 0,
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
      {/* ROW 1: Department & Instrument */}
      <Row gutter={[12, 12]}>
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

        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="IP Address"
            name="ipAddress"
            value={
              localState.ipAddress !== "" && !isNaN(localState.ipAddress)
                ? Number(localState.ipAddress).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="IP Address"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ROW 2: Quantity & Date Range */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Login Date"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
            format="YYYY-MM-DD"
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
