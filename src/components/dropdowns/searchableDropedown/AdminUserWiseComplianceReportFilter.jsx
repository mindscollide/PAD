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
  requesterName: "",
  approvedQuantity: "",
  sharesTraded: "",
  startDate: null,
  endDate: null,
  type: "",
  pageNumber: 0,
  pageSize: 10,
  filterTrigger: false,
};

export const AdminUserWiseComplianceReportFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const {
    OverdueVerificationHCOReportSearch,
    setOverdueVerificationHCOReportSearch,
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

    // Remove commas first
    const rawValue = value.replace(/,/g, "");

    if (name === "approvedQuantity" || name === "sharesTraded") {
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
    const {
      instrumentName,
      requesterName,
      approvedQuantity,
      sharesTraded,
      startDate,
      endDate,
    } = localState;

    const searchPayload = {
      ...OverdueVerificationHCOReportSearch,
      instrumentName: instrumentName?.trim() || "",
      requesterName: requesterName?.trim() || "",
      approvedQuantity: approvedQuantity ? Number(approvedQuantity) : 0,
      sharesTraded: sharesTraded ? Number(sharesTraded) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      pageNumber: 0,
      filterTrigger: true,
    };

    setOverdueVerificationHCOReportSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  const handleResetClick = () => {
    setOverdueVerificationHCOReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      approvedQuantity: "",
      sharesTraded: "",
      startDate: null,
      endDate: null,
      type: "",
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
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Enter instrument name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Requester Name"
            name="requesterName"
            value={localState.requesterName}
            onChange={handleInputChange}
            placeholder="Enter requester name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ROW 2: Quantity & Date Range */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Transaction Date"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
            format="YYYY-MM-DD"
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Approved Quantity"
            name="approvedQuantity"
            value={
              localState.approvedQuantity !== "" &&
              !isNaN(localState.approvedQuantity)
                ? Number(localState.approvedQuantity).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Approved Quantity"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ROW 3: Employee ID & Employee Name */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Shares Traded"
            name="sharesTraded"
            value={
              localState.sharesTraded !== "" && !isNaN(localState.sharesTraded)
                ? Number(localState.sharesTraded).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Shares Traded"
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
