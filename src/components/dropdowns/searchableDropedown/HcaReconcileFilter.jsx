// src/pages/hca/reconcile/HcaReconcileFilter.jsx

import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyAlphabets,
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";
import { useReconcileContext } from "../../../context/reconsileContax";
// 🔹 Initial default state
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  requesterName: "",
  quantity: 0,
  requestDateFrom: null,
  requestDateTo: null,
  escalatedDateFrom: null,
  escalatedDateTo: null,
};

export const HcaReconcileFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const { activeTabHCO } = useReconcileContext(); // Transactions / Portfolio

  // Local state (for inputs before pushing into context)
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);
  const isEscalatedVerification = activeTabHCO === "escalated";

  // Context states (HCA Reconcile)
  const {
    headOfComplianceApprovalEscalatedVerificationsSearch,
    setHeadOfComplianceApprovalEscalatedVerificationsSearch,
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
  } = useSearchBarContext();

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
    setLocalState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  // 🔹 Input change handler
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
    } else if (name === "requesterName") {
      if (allowOnlyAlphabets(value)) {
        setFieldValue(name, removeFirstSpace(value));
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

  // 🔹 Search click
  const handleSearchClick = () => {
    const {
      instrumentName,
      requesterName,
      quantity,
      requestDateFrom,
      requestDateTo,
      escalatedDateFrom,
      escalatedDateTo,
    } = localState;

    const searchPayload = {
      ...(isEscalatedVerification
        ? headOfComplianceApprovalEscalatedVerificationsSearch
        : headOfComplianceApprovalPortfolioSearch),
      instrumentName: instrumentName?.trim() || "",
      requesterName: requesterName.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      requestDateFrom: requestDateFrom || null,
      requestDateTo: requestDateTo || null,
      escalatedDateFrom: escalatedDateFrom || null,
      escalatedDateTo: escalatedDateTo || null,
      pageNumber: 0,
      filterTrigger: true,
    };

    if (isEscalatedVerification) {
      setHeadOfComplianceApprovalEscalatedVerificationsSearch(searchPayload);
    } else {
      setHeadOfComplianceApprovalPortfolioSearch(searchPayload);
    }

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false); // Reset external clear flag
    setVisible(false);
  };

  // 🔹 Reset click
  const handleResetClick = () => {
    const resetPayload = {
      ...(isEscalatedVerification
        ? headOfComplianceApprovalEscalatedVerificationsSearch
        : headOfComplianceApprovalPortfolioSearch),
      instrumentName: "",
      requesterName: "",
      quantity: 0,
      requestDateFrom: null,
      requestDateTo: null,
      escalatedDateFrom: null,
      escalatedDateTo: null,
      pageNumber: 0,
      filterTrigger: true,
    };

    if (isEscalatedVerification) {
      setHeadOfComplianceApprovalEscalatedVerificationsSearch(resetPayload);
    } else {
      setHeadOfComplianceApprovalPortfolioSearch(resetPayload);
    }

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false); // Reset external clear flag
    setVisible(false);
  };

  return (
    <>
      {/* Instrument Name + Quantity */}
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
            label="Requester Name"
            name="requesterName"
            value={localState.requesterName}
            onChange={handleInputChange}
            placeholder="Requester Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* Requester Name + Date Range */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12}>
          <DateRangePicker
            label="Transaction Date Range"
            size="medium"
            value={[localState.requestDateFrom, localState.requestDateTo]}
            onChange={handleDateChange}
            onClear={handleClearDates}
          />
        </Col>
        <Col xs={24} sm={24} md={12}>
          <DateRangePicker
            label="Escalation Date Range"
            size="medium"
            value={[localState.escalatedDateFrom, localState.escalatedDateTo]}
            onChange={handleEscalatedDateChange}
            onClear={handleClearEscalatedDates}
          />
        </Col>
      </Row>

      {/* Escalation Date Range (only for escalated tab) */}
      <Row gutter={[12, 12]} style={{ marginTop: "12px" }}>
        <Col xs={24} sm={24} md={12}>
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
