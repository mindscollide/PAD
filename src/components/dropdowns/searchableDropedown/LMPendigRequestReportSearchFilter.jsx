import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

const INITIAL_LOCAL_STATE = {
  requesterName: "",
  instrumentName: "",
  quantity: "",
  startDate: null,
  endDate: null,
};

export const LMPendigRequestReportSearchFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const { lMPendingApprovalReportsSearch, setLMPendingApprovalReportsSearch } =
    useSearchBarContext();

  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  /* ----------------------------------
   🔹 EFFECTS
  ---------------------------------- */

  // Prefill instrument name from parent
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        instrumentName: maininstrumentName,
      }));
      setMaininstrumentName("");
      setClear(false);
    }
  }, [maininstrumentName]);

  // External clear trigger
  useEffect(() => {
    if (clear) {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  /* ----------------------------------
   🔹 HANDLERS
  ---------------------------------- */

  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      const raw = value.replace(/,/g, "");
      if (
        (raw === "" || allowOnlyNumbers(raw)) &&
        raw.length <= 12
      ) {
        setFieldValue("quantity", raw);
      }
    } else {
      setFieldValue(name, removeFirstSpace(value));
    }
  };

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

  const handleSearchClick = () => {
    const { requesterName, instrumentName, quantity, startDate, endDate } =
      localState;

    setLMPendingApprovalReportsSearch({
      ...lMPendingApprovalReportsSearch,
      requesterName: requesterName?.trim() || "",
      instrumentName: instrumentName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate,
      endDate,
      pageNumber: 0,
      filterTrigger: true,
    });

    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  const handleResetClick = () => {
    setLMPendingApprovalReportsSearch((prev) => ({
      ...prev,
      requesterName: "",
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));

    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /* ----------------------------------
   🔹 RENDER
  ---------------------------------- */

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
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

        <Col xs={24} md={12}>
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
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} md={12}>
          <DateRangePicker
            label="Date Range"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
          />
        </Col>
      </Row>

      <Row justify="end" style={{ marginTop: 16 }}>
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
