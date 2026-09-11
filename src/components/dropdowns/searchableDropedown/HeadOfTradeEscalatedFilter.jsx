// src/pages/headOfTrade/escalated/HeadOfTradeEscalatedFilter.jsx

import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyAlphabets,
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

// 🔹 Initial default state
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  requesterName: "",
  lineManagerName: "",
  requestDateFrom: null,
  requestDateTo: null,
  escalatedDateFrom: null,
  escalatedDateTo: null,
  Quantity: null,
};

export const HeadOfTradeEscalatedFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  // Context states (Head of Trade Escalated Approvals)
  const {
    headOfTradeEscalatedApprovalsSearch,
    setHeadOfTradeEscalatedApprovalsSearch,
  } = useSearchBarContext();
  // Local form state
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  // -----------------------------------------------------
  // 🔹 EFFECTS
  // -----------------------------------------------------

  /**
   * Prefill instrument name if passed from parent (maininstrumentName).
   * Useful for quick search-to-filter transition.
   */
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        instrumentName: maininstrumentName,
      }));
      setClear(false); // Reset external clear flag
      setMaininstrumentName(""); // Clear parent’s prefill value
    }
  }, [maininstrumentName]);

  /**
   * Reset filters if `clear` flag is triggered externally.
   */
  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false); // Reset external clear flag
    }
  }, [clear]);

  // 🔹 Helpers
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  // 🔹 Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "requesterName" || name === "lineManagerName") {
      if (allowOnlyAlphabets(value)) {
        setFieldValue(name, removeFirstSpace(value));
      }
    } else if (name === "Quantity") {
      // FIXED (API_Changes/2026-09-11_hta_escalated_approvals_quantity_
      // nan_fe_notes.md): Quantity is displayed through
      // toLocaleString("en-US"), which inserts a thousands separator once
      // the value reaches 4 digits (e.g. "1,234") - but this branch used
      // to fall into the generic `else` below with no comma-stripping or
      // numeric validation at all, so typing a 5th digit appended it to
      // the already-comma-formatted text ("1,234" + "5" -> "1,2345"),
      // which Number() turns into NaN on the next render. Same
      // strip-commas + digits-only pattern already used by the sibling
      // Quantity handler on LM's "Trade Approval Requests" search.
      const rawValue = value.replace(/,/g, "");
      if (
        (rawValue === "" || allowOnlyNumbers(rawValue)) &&
        rawValue.length <= 12
      ) {
        setFieldValue(name, rawValue);
      }
    } else {
      setFieldValue(name, removeFirstSpace(value));
    }
  };

  /** Date change */
  const handleDateChange = (dates) => {
    setLocalState({
      ...localState,
      requestDateFrom: dates?.[0] || null,
      requestDateTo: dates?.[1] || null,
    });
  };

  /** Clear dates only */
  const handleClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      requestDateFrom: null,
      requestDateTo: null,
    }));
  };

  const handleEscalatedDateChange = (dates) => {
    setLocalState({
      ...localState,
      escalatedDateFrom: dates?.[0] || null,
      escalatedDateTo: dates?.[1] || null,
    });
  };

  /** Clear dates only */
  const handleClearEscalatedDates = () => {
    setLocalState((prev) => ({
      ...prev,
      escalatedDateFrom: null,
      escalatedDateTo: null,
    }));
  };

  /** Search click */
  const handleSearchClick = () => {
    const {
      instrumentName,
      requesterName,
      lineManagerName,
      requestDateFrom,
      requestDateTo,
      escalatedDateFrom,
      escalatedDateTo,
      Quantity,
    } = localState;

    const searchPayload = {
      ...headOfTradeEscalatedApprovalsSearch,
      instrumentName: instrumentName?.trim() || "",
      requesterName: requesterName?.trim() || "",
      lineManagerName: lineManagerName?.trim() || "",
      requestDateFrom: requestDateFrom || null,
      requestDateTo: requestDateTo || null,
      escalatedDateFrom: escalatedDateFrom || null,
      escalatedDateTo: escalatedDateTo || null,
      Quantity: Quantity ? Number(Quantity) : null,
      pageNumber: 0,
      filterTrigger: true,
    };

    setHeadOfTradeEscalatedApprovalsSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /** Reset click */
  const handleResetClick = () => {
    setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      lineManagerName: "",
      requestDateFrom: null,
      requestDateTo: null,
      escalatedDateFrom: null,
      escalatedDateTo: null,
      Quantity: null,
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
      {/* Requester Name + Line Manager Name */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12}>
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
        <Col xs={24} sm={24} md={12}>
          <TextField
            label="Line Manager Name"
            name="lineManagerName"
            value={localState.lineManagerName}
            onChange={handleInputChange}
            placeholder="Line Manager Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* Request Date Range + Escalated Date Range */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12}>
          <DateRangePicker
            label="Request Date Range"
            size="medium"
            value={[localState.requestDateFrom, localState.requestDateTo]}
            onChange={handleDateChange}
            onClear={handleClearDates}
          />
        </Col>

        <Col xs={24} sm={24} md={12}>
          <DateRangePicker
            label="Escalated Date Range"
            size="medium"
            value={[localState.escalatedDateFrom, localState.escalatedDateTo]}
            onChange={handleEscalatedDateChange}
            onClear={handleClearEscalatedDates}
          />
        </Col>
      </Row>

      {/* Instrument Name */}
      <Row gutter={[12, 12]} style={{ marginTop: "12px" }}>
        <Col xs={24} sm={24} md={12}>
          <TextField
            label="Requester Name"
            name="requesterName"
            value={localState.requesterName}
            onChange={handleInputChange}
            placeholder="Requester Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} sm={24} md={12}>
          <TextField
            label="Quantity"
            name="Quantity"
            value={
              localState.Quantity
                ? Number(localState.Quantity).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Quantity"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* Buttons */}
      <Row gutter={[12, 12]} justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              text="Reset"
              className="big-light-button"
              onClick={handleResetClick}
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
