import React, { useEffect, useState } from "react";
import { Row, Col, Space, Select } from "antd";
import { Button, TextField, DateRangePicker } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { removeFirstSpace } from "../../../common/funtions/rejex";
import styles from "./SearchWithPopoverOnly.module.css";

// 🔹 Initial Local State (Updated)
const INITIAL_LOCAL_STATE = {
  transactionID: "",
  instrumentName: "",
  requesterName: "",
  startDate: null,
  endDate: null,
  quantity: 0,
  status: [],
  type: [],
};

export const HOCMyAction = ({
  setVisible,
  clear,
  setClear,
  maininstrumentName,
  setMaininstrumentName,
}) => {
  const { headOfComplianceMyActionSearch, setHeadOfComplianceMyActionSearch } =
    useSearchBarContext();

  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  const { Option } = Select;
  // Prefill
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

  // Reset when clear triggered
  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  // 🔹 Helpers
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "quantity": {
        // Remove commas
        const rawValue = value.replace(/,/g, "");

        // Allow only numbers up to 12 digits
        if (
          (rawValue === "" || /^[0-9]+$/.test(rawValue)) &&
          rawValue.length <= 12
        ) {
          setFieldValue(name, rawValue); // store unformatted value
        }
        break;
      }

      default:
        setFieldValue(name, removeFirstSpace(value));
    }
  };

  const handleDateChange = (value) => {
    setLocalState((prev) => ({
      ...prev,
      startDate: value?.[0] || null,
      endDate: value?.[1] || null,
    }));
  };

  // 🔹 Search
  const handleSearchClick = () => {
    const {
      requestID,
      instrumentName,
      requesterName,
      startDate,
      endDate,
      quantity,
      status,
      type,
    } = localState;

    const searchPayload = {
      ...headOfComplianceMyActionSearch,
      requestID: requestID?.trim() || "",
      instrumentName: instrumentName?.trim() || "",
      requesterName: requesterName?.trim() || "",
      startDate,
      endDate,
      quantity: quantity || 0,
      status: status || [],
      type: type || [],
      filterTrigger: true,
      pageNumber: 0,
      pageSize: 10,
    };

    setHeadOfComplianceMyActionSearch(searchPayload);

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  // 🔹 Reset
  const handleResetClick = () => {
    const resetPayload = {
      ...headOfComplianceMyActionSearch,
      requestID: "",
      instrumentName: "",
      requesterName: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      status: [],
      type: [],
      filterTrigger: true,
      pageNumber: 0,
      pageSize: 10,
    };

    setHeadOfComplianceMyActionSearch(resetPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  return (
    <>
      {/* First Row */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Transaction ID"
            name="requestID"
            value={localState.requestID}
            onChange={handleInputChange}
            placeholder="Transaction ID"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
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

      {/* Second Row */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
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

        <Col xs={24} sm={24} md={12} lg={12}>
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

      <Row gutter={[12, 12]} className={styles.bottomGap}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <label className={styles["typeAndStatusLabel"]}>Status</label>
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Status"
            size="middle"
            value={localState.status}
            onChange={(values) => setFieldValue("status", values)}
            className={styles.statusSelectClass}
            style={{ width: "100%" }}
          >
            <Option value={1}>Pending</Option>
            <Option value={2}>Resubmit</Option>
            <Option value={3}>Approved</Option>
            <Option value={4}>Declined</Option>
            <Option value={5}>Traded</Option>
            <Option value={6}>Not-Traded</Option>
            <Option value={7}>Compliant</Option>
            <Option value={8}>Non-Compliant</Option>
          </Select>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <label className={styles["typeAndStatusLabel"]}>Type</label>
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Type"
            size="middle"
            className={styles.statusSelectClass}
            value={localState.type}
            onChange={(values) => setFieldValue("type", values)}
            style={{ width: "100%" }}
          >
            <Option value={1}>Buy</Option>
            <Option value={2}>Sell</Option>
          </Select>
        </Col>
      </Row>
      {/* Date Range */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24}>
          <DateRangePicker
            label="Date Range"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
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
              text="Search"
              className="big-dark-button"
              onClick={handleSearchClick}
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
