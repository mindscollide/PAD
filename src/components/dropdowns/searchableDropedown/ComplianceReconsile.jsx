// src/pages/compliance/reconcile/ComplianceReconcileFilter.jsx

import React, { useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";

export const ComplianceReconcileFilter = ({
  handleSearch,
  activeTab,
  setVisible,
}) => {
  // Local state (for inputs before pushing into context)
  const [localState, setLocalState] = useState({
    instrumentName: "",
    requesterName: "",
    quantity: "",
    startDate: "",
    endDate: "",
  });

  // Context states (Compliance Reconcile)
  const {
    complianceOfficerReconcileTransactionsSearch,
    setComplianceOfficerReconcileTransactionsSearch,
    resetComplianceOfficerReconcileTransactionsSearch,
    complianceOfficerReconcilePortfolioSearch,
    setComplianceOfficerReconcilePortfolioSearch,
    resetComplianceOfficerReconcilePortfoliosSearch,
  } = useSearchBarContext();

  // Reset local state
  const resetLocalState = () => {
    setLocalState({
      instrumentName: "",
      requesterName: "",
      quantity: "",
      startDate: "",
      endDate: "",
    });
  };

  // Reset handler
  const handleResetClick = () => {
    if (activeTab === "transactions") {
      setComplianceOfficerReconcileTransactionsSearch((prev) => ({
        ...prev,
        instrumentName: "",
        requesterName: "",
        quantity: 0,
        startDate: "",
        endDate: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
      // resetComplianceOfficerReconcileTransactionsSearch();
    } else {
      setComplianceOfficerReconcilePortfolioSearch((prev) => ({
        ...prev,
        instrumentName: "",
        requesterName: "",
        quantity: 0,
        startDate: "",
        endDate: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
      // resetComplianceOfficerReconcilePortfoliosSearch();
    }

    resetLocalState();
    setVisible(false);
  };

  // Handle text input changes
  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      if (value === "" || allowOnlyNumbers(value)) {
        setState((prev) => ({ ...prev, quantity: value }));
      }
      return;
    }

    setState((prev) => ({
      ...prev,
      [name]: removeFirstSpace(value),
    }));
  };

  return (
    <>
      {/* Instrument Name + Quantity */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={
              activeTab === "transactions"
                ? complianceOfficerReconcileTransactionsSearch.instrumentName
                : complianceOfficerReconcilePortfolioSearch.instrumentName
            }
            onChange={(e) =>
              handleInputChange(
                e,
                activeTab === "transactions"
                  ? setComplianceOfficerReconcileTransactionsSearch
                  : setComplianceOfficerReconcilePortfolioSearch
              )
            }
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
              activeTab === "transactions"
                ? complianceOfficerReconcileTransactionsSearch.quantity || ""
                : complianceOfficerReconcilePortfolioSearch.quantity || ""
            }
            onChange={(e) =>
              handleInputChange(
                e,
                activeTab === "transactions"
                  ? setComplianceOfficerReconcileTransactionsSearch
                  : setComplianceOfficerReconcilePortfolioSearch
              )
            }
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
            value={
              activeTab === "transactions"
                ? complianceOfficerReconcileTransactionsSearch.requesterName
                : complianceOfficerReconcilePortfolioSearch.requesterName
            }
            onChange={(e) =>
              handleInputChange(
                e,
                activeTab === "transactions"
                  ? setComplianceOfficerReconcileTransactionsSearch
                  : setComplianceOfficerReconcilePortfolioSearch
              )
            }
            placeholder="Requester Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} sm={24} md={12}>
          <DateRangePicker
            label="Date Range"
            size="medium"
            value={
              activeTab === "transactions"
                ? complianceOfficerReconcileTransactionsSearch.startDate &&
                  complianceOfficerReconcileTransactionsSearch.endDate
                  ? [
                      complianceOfficerReconcileTransactionsSearch.startDate,
                      complianceOfficerReconcileTransactionsSearch.endDate,
                    ]
                  : null
                : complianceOfficerReconcilePortfolioSearch.startDate &&
                  complianceOfficerReconcilePortfolioSearch.endDate
                ? [
                    complianceOfficerReconcilePortfolioSearch.startDate,
                    complianceOfficerReconcilePortfolioSearch.endDate,
                  ]
                : null
            }
            onChange={(dates) =>
              activeTab === "transactions"
                ? setComplianceOfficerReconcileTransactionsSearch((prev) => ({
                    ...prev,
                    startDate: dates?.[0] || null,
                    endDate: dates?.[1] || null,
                  }))
                : setComplianceOfficerReconcilePortfolioSearch((prev) => ({
                    ...prev,
                    startDate: dates?.[0] || null,
                    endDate: dates?.[1] || null,
                  }))
            }
            onClear={() =>
              activeTab === "transactions"
                ? setComplianceOfficerReconcileTransactionsSearch((prev) => ({
                    ...prev,
                    startDate: null,
                    endDate: null,
                  }))
                : setComplianceOfficerReconcilePortfolioSearch((prev) => ({
                    ...prev,
                    startDate: null,
                    endDate: null,
                  }))
            }
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
              onClick={handleSearch}
              text="Search"
              className="big-dark-button"
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
