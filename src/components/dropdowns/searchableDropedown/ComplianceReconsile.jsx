// src/pages/compliance/reconcile/ComplianceReconcileFilter.jsx

import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyAlphabets,
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";
import { useReconcileContext } from "../../../context/reconsileContax";

// 🔹 Initial state
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  quantity: 0,
  startDate: null,
  endDate: null,
  requesterName: "",
};

export const ComplianceReconcileFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  // Context states (Compliance Reconcile)
  const {
    setComplianceOfficerReconcileTransactionsSearch,
    complianceOfficerReconcileTransactionsSearch,
    setComplianceOfficerReconcilePortfolioSearch,
    complianceOfficerReconcilePortfolioSearch,
  } = useSearchBarContext();

  const { activeTab } = useReconcileContext(); // Transactions / Portfolio

  const isTransactions = activeTab === "transactions";

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

  // 🔹 Date change
  const handleDateChange = (dates) => {
    setLocalState((prev) => ({
      ...prev,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    }));
  };

  // 🔹 Clear only dates
  const handleClearDates = () => {
    setLocalState((prev) => ({ ...prev, startDate: null, endDate: null }));
  };

  // 🔹 Search click
  const handleSearchClick = () => {
    const { instrumentName, quantity, startDate, endDate, requesterName } =
      localState;

    const searchPayload = {
      ...(isTransactions
        ? complianceOfficerReconcileTransactionsSearch
        : complianceOfficerReconcilePortfolioSearch),
      instrumentName: instrumentName?.trim() || "",
      requesterName: requesterName.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      pageNumber: 0,
      filterTrigger: true,
    };

    if (isTransactions) {
      setComplianceOfficerReconcileTransactionsSearch(searchPayload);
    } else {
      setComplianceOfficerReconcilePortfolioSearch(searchPayload);
    }

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false); // Reset external clear flag
    setVisible(false);
  };

  // 🔹 Reset click
  const handleResetClick = () => {
    const resetPayload = {
      ...(isTransactions
        ? complianceOfficerReconcileTransactionsSearch
        : complianceOfficerReconcilePortfolioSearch),
      instrumentName: "",
      requesterName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    };

    if (isTransactions) {
      setComplianceOfficerReconcileTransactionsSearch(resetPayload);
    } else {
      setComplianceOfficerReconcilePortfolioSearch(resetPayload);
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

      {/* Requester Name + Date Range */}
      <Row gutter={[12, 12]}>
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
          <DateRangePicker
            label="Date Range"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
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
