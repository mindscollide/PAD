import React, { useEffect, useState } from "react";
import { Row, Col, Space, Select, Checkbox } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";
import styles from "./SearchWithPopoverOnly.module.css";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { buildBrokerOptions } from "../../../common/funtions/brokersList";

// 🔹 Initial default state
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  startDate: null,
  endDate: null,
  quantity: 0,
  brokerIDs: [],
  actionStartDate: null,
  actionEndDate: null,
  actionBy: "",
};

export const EmployeeTransactionReportFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  // Contexts
  const {
    employeeMyTransactionReportSearch,
    setEmployeeMyTransactionReportSearch,
  } = useSearchBarContext();

  const { employeeBasedBrokersData } = useDashboardContext();

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

  /** Brokers dropdown */
  const brokerOptions = buildBrokerOptions(employeeBasedBrokersData);

  // 🔹 Handle selection
  const handleBrokerChange = (selectedIDs) => {
    setLocalState((prev) => ({ ...prev, brokerIDs: selectedIDs }));
  };

  /** Date change For Action Date Range */
  const handlerForActionDateChange = (dates) => {
    setLocalState({
      ...localState,
      actionStartDate: dates?.[0] || null,
      actionEndDate: dates?.[1] || null,
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

  /** Clearor Action Date Range dates only */
  const handlerActionRangeClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      actionStartDate: null,
      actionEndDate: null,
    }));
  };

  /** Search click */
  const handleSearchClick = () => {
    const {
      instrumentName,
      quantity,
      startDate,
      endDate,
      brokerIDs,
      actionStartDate,
      actionEndDate,
      actionBy,
    } = localState;

    const searchPayload = {
      ...employeeMyTransactionReportSearch,
      instrumentName: instrumentName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      brokerIDs: brokerIDs || [],
      actionStartDate: actionStartDate || null,
      actionEndDate: actionEndDate || null,
      actionBy: actionBy?.trim() || "",
      pageNumber: 0,
      filterTrigger: true,
    };

    setEmployeeMyTransactionReportSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /** Reset click */
  const handleResetClick = () => {
    setEmployeeMyTransactionReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      status: [],
      type: [],
      brokerIDs: [],
      actionBy: "",
      actionStartDate: null,
      actionEndDate: null,
      pageNumber: 0,
      pageSize: 10,
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
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Instrument Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Transaction date range"
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
        <Col span={12} className={styles.brokersOptionData}>
          <label className={styles.instrumentLabel}>Brokers</label>
          <Select
            mode="multiple"
            placeholder="Select Brokers"
            value={localState.brokerIDs}
            onChange={handleBrokerChange}
            options={brokerOptions}
            maxTagCount={0}
            maxTagPlaceholder={(omittedValues) =>
              `${omittedValues.length} selected`
            }
            prefixCls="EquitiesBrokerSelectPrefix"
            optionLabelProp="label"
            disabled={!brokerOptions || brokerOptions.length === 0}
            showSearch
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase()) ||
              option?.raw?.psxCode?.toLowerCase().includes(input.toLowerCase())
            }
            optionRender={(option) => (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={localState.brokerIDs.includes(option.value)} // ✅ sync with state
                  style={{ marginRight: 8 }}
                  className="custom-broker-option"
                />
                {option.data.raw.brokerName}
              </div>
            )}
          />
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Action date range"
            size="medium"
            value={[localState.actionStartDate, localState.actionEndDate]}
            onChange={handlerForActionDateChange}
            onClear={handlerActionRangeClearDates}
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Action By"
            name="actionBy"
            value={localState.actionBy}
            onChange={handleInputChange}
            placeholder="Action By"
            size="medium"
            classNames="Search-Field"
          />
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
