import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField, DateRangePicker } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

/**
 * 🔹 Initial local state
 * Mirrors global search state structure
 */
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  requesterName: "",
  complianceOfficerName: "",
  approvedQuantity: "",
  sharesTraded: "",
  startDate: null,
  endDate: null,
  fromDate: null,
  toDate: null,
  type: "",
  pageNumber: 0,
  pageSize: 10,
  filterTrigger: false,
};

export const HCOOverdueVerifications = ({
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

  /* =====================================================
   * 🔹 Effects
   * ===================================================== */

  /**
   * Populate Instrument Name when coming from outside
   */
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

  /**
   * Reset local state on clear trigger
   */
  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  /* =====================================================
   * 🔹 Handlers
   * ===================================================== */

  /**
   * Generic state setter
   */
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handle text & numeric input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/,/g, "");

    // Numeric fields
    if (["approvedQuantity", "sharesTraded"].includes(name)) {
      if (rawValue === "" || allowOnlyNumbers(rawValue)) {
        setFieldValue(name, rawValue);
      }
      return;
    }

    setFieldValue(name, removeFirstSpace(value));
  };

  /**
   * Transaction date range
   */
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

  /**
   * Escalated date range
   */
  const handleEscalatedDateChange = (dates) => {
    setLocalState((prev) => ({
      ...prev,
      fromDate: dates?.[0] || null,
      toDate: dates?.[1] || null,
    }));
  };

  const handleEscalatedClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      fromDate: null,
      toDate: null,
    }));
  };

  /**
   * Apply search filters
   */
  const handleSearchClick = () => {
    const {
      instrumentName,
      requesterName,
      complianceOfficerName,
      approvedQuantity,
      sharesTraded,
      startDate,
      endDate,
      fromDate,
      toDate,
    } = localState;

    setOverdueVerificationHCOReportSearch({
      ...OverdueVerificationHCOReportSearch,
      instrumentName: instrumentName.trim(),
      requesterName: requesterName.trim(),
      complianceOfficerName: complianceOfficerName.trim(),
      approvedQuantity: approvedQuantity ? Number(approvedQuantity) : 0,
      sharesTraded: sharesTraded ? Number(sharesTraded) : 0,
      startDate,
      endDate,
      fromDate,
      toDate,
      pageNumber: 0,
      filterTrigger: true,
    });

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  /**
   * Reset filters
   */
  const handleResetClick = () => {
    setOverdueVerificationHCOReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      complianceOfficerName: "",
      approvedQuantity: 0,
      sharesTraded: 0,
      startDate: null,
      endDate: null,
      fromDate: null,
      toDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  /* =====================================================
   * 🔹 Render
   * ===================================================== */

  return (
    <>
      {/* ROW 1 */}
      <Row gutter={[12, 12]}>
        <Col md={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Enter instrument name"
          />
        </Col>

        <Col md={12}>
          <TextField
            label="Requester Name"
            name="requesterName"
            value={localState.requesterName}
            onChange={handleInputChange}
            placeholder="Enter requester name"
          />
        </Col>
      </Row>

      {/* ROW 2 */}
      <Row gutter={[12, 12]}>
        <Col md={12}>
          <DateRangePicker
            label="Transaction Date"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
            format="YYYY-MM-DD"
          />
        </Col>

        <Col md={12}>
          <DateRangePicker
            label="Escalated Date"
            value={[localState.fromDate, localState.toDate]}
            onChange={handleEscalatedDateChange}
            onClear={handleEscalatedClearDates}
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>

      {/* ROW 3 */}
      <Row gutter={[12, 12]}>
        <Col md={12}>
          <TextField
            label="Shares Traded"
            name="sharesTraded"
            value={
              localState.sharesTraded
                ? Number(localState.sharesTraded).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
          />
        </Col>

        <Col md={12}>
          <TextField
            label="Approved Quantity"
            name="approvedQuantity"
            value={
              localState.approvedQuantity
                ? Number(localState.approvedQuantity).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
          />
        </Col>
      </Row>

      {/* ROW 4 */}
      <Row gutter={[12, 12]}>
        <Col md={12}>
          <TextField
            label="Compliance Officer Name"
            name="complianceOfficerName"
            value={localState.complianceOfficerName}
            onChange={handleInputChange}
            placeholder="Enter compliance officer name"
          />
        </Col>
      </Row>

      {/* ACTIONS */}
      <Row justify="end" style={{ marginTop: 16 }}>
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
      </Row>
    </>
  );
};
