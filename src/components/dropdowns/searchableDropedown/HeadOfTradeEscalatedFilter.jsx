// src/pages/headOfTrade/escalated/HeadOfTradeEscalatedFilter.jsx

import React, { useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { removeFirstSpace } from "../../../commen/funtions/rejex";

export const HeadOfTradeEscalatedFilter = ({ handleSearch, setVisible }) => {
  // Local state
  const [localState, setLocalState] = useState({
    requesterName: "",
    lineManagerName: "",
    instrumentName: "",
    requestStartDate: "",
    requestEndDate: "",
    escalatedStartDate: "",
    escalatedEndDate: "",
  });

  // Context states (Head of Trade Escalated Approvals)
  const {
    headOfTradeEscalatedApprovalsSearch,
    setHeadOfTradeEscalatedApprovalsSearch,
    resetHeadOfTradeEscalatedApprovalsSearch,
  } = useSearchBarContext();

  // Reset local state
  const resetLocalState = () => {
    setLocalState({
      requesterName: "",
      lineManagerName: "",
      instrumentName: "",
      requestStartDate: "",
      requestEndDate: "",
      escalatedStartDate: "",
      escalatedEndDate: "",
    });
  };

  // Reset handler
  const handleResetClick = () => {
    setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
      ...prev,
      requesterName: "",
      lineManagerName: "",
      instrumentName: "",
      requestStartDate: "",
      requestEndDate: "",
      escalatedStartDate: "",
      escalatedEndDate: "",
      pageNumber: 0,
      filterTrigger: true,
    }));

    // resetHeadOfTradeEscalatedApprovalsSearch(); // optional

    resetLocalState();
    setVisible(false);
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
      ...prev,
      [name]: removeFirstSpace(value),
    }));
  };

  return (
    <>
      {/* Requester Name + Line Manager Name */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12}>
          <TextField
            label="Requester Name"
            name="requesterName"
            value={headOfTradeEscalatedApprovalsSearch.requesterName}
            onChange={handleInputChange}
            placeholder="Requester Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12}>
          <TextField
            label="Line Manager Name"
            name="lineManagerName"
            value={headOfTradeEscalatedApprovalsSearch.lineManagerName}
            onChange={handleInputChange}
            placeholder="Line Manager Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* Instrument Name */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={headOfTradeEscalatedApprovalsSearch.instrumentName}
            onChange={handleInputChange}
            placeholder="Instrument Name"
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
            value={
              headOfTradeEscalatedApprovalsSearch.requestStartDate &&
              headOfTradeEscalatedApprovalsSearch.requestEndDate
                ? [
                    headOfTradeEscalatedApprovalsSearch.requestStartDate,
                    headOfTradeEscalatedApprovalsSearch.requestEndDate,
                  ]
                : null
            }
            onChange={(dates) =>
              setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
                ...prev,
                requestStartDate: dates?.[0] || null,
                requestEndDate: dates?.[1] || null,
              }))
            }
            onClear={() =>
              setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
                ...prev,
                requestStartDate: null,
                requestEndDate: null,
              }))
            }
          />
        </Col>

        <Col xs={24} sm={24} md={12}>
          <DateRangePicker
            label="Escalated Date Range"
            size="medium"
            value={
              headOfTradeEscalatedApprovalsSearch.escalatedStartDate &&
              headOfTradeEscalatedApprovalsSearch.escalatedEndDate
                ? [
                    headOfTradeEscalatedApprovalsSearch.escalatedStartDate,
                    headOfTradeEscalatedApprovalsSearch.escalatedEndDate,
                  ]
                : null
            }
            onChange={(dates) =>
              setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
                ...prev,
                escalatedStartDate: dates?.[0] || null,
                escalatedEndDate: dates?.[1] || null,
              }))
            }
            onClear={() =>
              setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
                ...prev,
                escalatedStartDate: null,
                escalatedEndDate: null,
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
