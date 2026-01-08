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
  requesterName: "",
  quantity: 0,
  startDate: null,
  endDate: null,
  escalatedStartDate: null,
  escalatedEndDate: null,
};

export const HTAPendingRequestFilter = ({
  setVisible,
  clear,
  setClear,
  maininstrumentName,
  setMaininstrumentName,
}) => {
  /* ===========================================================================
   * 📌 Context
   * =========================================================================== */
  const {
    hTAPendingApprovalReportsSearch,
    setHTAPendingApprovalReportsSearch,
  } = useSearchBarContext();

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
      requesterName,
      quantity,
      startDate,
      endDate,
      escalatedStartDate,
      escalatedEndDate,
    } = localState;

    setHTAPendingApprovalReportsSearch({
      ...hTAPendingApprovalReportsSearch,
      instrumentName: instrumentName?.trim() || "",
      requesterName: requesterName?.trim() || "",
      quantity: quantity || "",
      startDate,
      endDate,
      escalatedStartDate,
      escalatedEndDate,
      pageNumber: 0,
      filterTrigger: true,
    });

    setVisible(false);
    setClear(false);
  };

  /** ♻️ Reset */
  const handleResetClick = () => {
    setHTAPendingApprovalReportsSearch({
      instrumentName: "",
      requesterName: "",
      lineManagerName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      escalatedStartDate: null,
      escalatedEndDate: null,
      type: [],
      status: [],
      pageSize: 10,
      pageNumber: 0,
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
            label="Requester Name"
            name="requesterName"
            value={localState.requesterName}
            onChange={handleInputChange}
            placeholder="Requester Name"
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
