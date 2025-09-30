// src/pages/hca/reconcile/HcaReconcileFilter.jsx

import React, { useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";

export const HcaReconcileFilter = ({ handleSearch, activeTab, setVisible }) => {
  // Local state (for inputs before pushing into context)
  const [localStateEscalated, setLocalStateEscalated] = useState({
    instrumentName: "",
    requesterName: "",
    quantity: 0,
    requestDateFrom: null,
    requestDateTo: null,
    escalatedDateFrom: null,
    escalatedDateTo: null,
  });
  const [localStatePortfolio, setLocalStatePortfolio] = useState({
    instrumentName: "",
    requesterName: "",
    quantity: 0,
    requestDateFrom: null,
    requestDateTo: null,
  });

  // Context states (HCA Reconcile)
  const {
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    resetHeadOfComplianceApprovalPortfolioSearch,
    headOfComplianceApprovalEscalatedVerificationsSearch,
    setHeadOfComplianceApprovalEscalatedVerificationsSearch,
    resetHeadOfComplianceApprovalEscalatedVerificationsSearch,
  } = useSearchBarContext();

  // Reset local state
  const resetLocalState = () => {
    if (activeTab === "escalated") {
      setLocalStateEscalated({
        instrumentName: "",
        requesterName: "",
        quantity: "",
        requestDateFrom: null,
        requestDateTo: null,
        escalatedDateFrom: null,
        escalatedDateTo: null,
      });
    } else {
      setLocalStatePortfolio({
        instrumentName: "",
        requesterName: "",
        quantity: "",
        requestDateFrom: null,
        requestDateTo: null,
      });
    }
  };

  // Reset handler
  const handleResetClick = () => {
    if (activeTab === "escalated") {
      setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
        ...prev,
        instrumentName: "",
        requesterName: "",
        quantity: 0,
        requestDateFrom: "",
        requestDateTo: "",
        escalatedDateFrom: "",
        escalatedDateTo: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (activeTab === "portfolio") {
      setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
        ...prev,
        instrumentName: "",
        requesterName: "",
        quantity: 0,
        requestDateFrom: "",
        requestDateTo: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
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

  // Get current search state and setter based on active tab
  const getSearchState = () => {
    if (activeTab === "escalated") {
      return [
        headOfComplianceApprovalEscalatedVerificationsSearch,
        setHeadOfComplianceApprovalEscalatedVerificationsSearch,
      ];
    } else if (activeTab === "portfolio") {
      return [
        headOfComplianceApprovalPortfolioSearch,
        setHeadOfComplianceApprovalPortfolioSearch,
      ];
    }
  };

  const [searchState, setSearchState] = getSearchState();

  return (
    <>
      {/* Instrument Name + Quantity */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={searchState.instrumentName}
            onChange={(e) => handleInputChange(e, setSearchState)}
            placeholder="Instrument Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} sm={24} md={12}>
          <TextField
            label="Quantity"
            name="quantity"
            value={searchState.quantity || ""}
            onChange={(e) => handleInputChange(e, setSearchState)}
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
            value={searchState.requesterName}
            onChange={(e) => handleInputChange(e, setSearchState)}
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
              searchState.requestDateFrom && searchState.requestDateTo
                ? [searchState.requestDateFrom, searchState.requestDateTo]
                : null
            }
            onChange={(dates) =>
              setSearchState((prev) => ({
                ...prev,
                requestDateFrom: dates?.[0] || null,
                requestDateTo: dates?.[1] || null,
              }))
            }
            onClear={() =>
              setSearchState((prev) => ({
                ...prev,
                requestDateFrom: null,
                requestDateTo: null,
              }))
            }
          />
        </Col>
      </Row>

      {/* Escalation Date Range (only for escalated tab) */}
      {activeTab === "escalated" && (
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={24} md={12}>
            <DateRangePicker
              label="Escalation Date Range"
              size="medium"
              value={
                searchState.escalatedDateFrom && searchState.escalatedDateTo
                  ? [
                      searchState.escalatedDateFrom,
                      searchState.escalatedDateTo,
                    ]
                  : null
              }
              onChange={(dates) =>
                setSearchState((prev) => ({
                  ...prev,
                  escalatedDateFrom: dates?.[0] || null,
                  escalatedDateTo: dates?.[1] || null,
                }))
              }
              onClear={() =>
                setSearchState((prev) => ({
                  ...prev,
                  escalatedDateFrom: null,
                  escalatedDateTo: null,
                }))
              }
            />
          </Col>
        </Row>
      )}

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
