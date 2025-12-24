import React, { useEffect, useState } from "react";
import { Row, Col, Space, Select } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";
import styles from "./SearchWithPopoverOnly.module.css";
const { Option } = Select;
// 🔹 Initial default state
const INITIAL_LOCAL_STATE = {
  approvalID: "",
  instrumentName: "",
  requesterName: "",
  quantity: 0,
  startDate: null,
  endDate: null,
  status: [],
  type: [],
};

export const LineManagerMyPendingRequestReports = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  // Contexts
  const { lineManagerApprovalSearch, setLineManagerApprovalSearch } =
    useSearchBarContext();

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

  // -----------------------------------------------------
  // 🔹 Handlers
  // -----------------------------------------------------

  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  /** Input change handler */
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

  /** Date change */
  const handleDateChange = (dates) => {
    setLocalState({
      ...localState,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    });
  };

  /** Clear dates only */
  const handleClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
    }));
  };

  /** Search click */
  const handleSearchClick = () => {
    const {
      requestID,
      instrumentName,
      requesterName,
      quantity,
      startDate,
      endDate,
      status,
      type,
    } = localState;

    const searchPayload = {
      ...lineManagerApprovalSearch,
      requestID: requestID?.trim() || "",
      instrumentName: instrumentName?.trim() || "",
      requesterName: requesterName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || [],
      type: type || [],
      pageNumber: 0,
      filterTrigger: true,
    };

    setLineManagerApprovalSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /** Reset click */
  const handleResetClick = () => {
    setLineManagerApprovalSearch((prev) => ({
      ...prev,
      requestID: "",
      instrumentName: "",
      requesterName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      status: [],
      type: [],
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
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Request ID"
            name="requestID"
            value={localState.requestID}
            onChange={handleInputChange}
            placeholder="Request ID"
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
          <DateRangePicker
            label="Date Range"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
          />
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Quantity"
            name="quantity" // 👈 should be lowercase to match handler
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
        <Col xs={24} sm={24} md={12} lg={12}>
          <div className={styles["search-field-wrapper"]}>
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
          </div>
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <div className={styles["search-field-wrapper"]}>
            <label className={styles["typeAndStatusLabel"]}>Status</label>
            <Select
              mode="multiple"
              allowClear
              placeholder="Select Status"
              className={styles.statusSelectClass}
              size="middle"
              value={localState.status}
              onChange={(values) => setFieldValue("status", values)}
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
          </div>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          {/* <TextField
                  label="Type"
                  name="type"
                  value={localState.type}
                  onChange={handleInputChange}
                  placeholder="Type"
                  size="medium"
                  classNames="Search-Field"
                /> */}
        </Col>
      </Row>
      <Row gutter={[12, 12]} justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              onClick={handleResetClick}
              text={"Reset"}
              className="big-light-button"
            />
            <Button
              onClick={handleSearchClick}
              text={"Search"}
              className="big-dark-button"
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
