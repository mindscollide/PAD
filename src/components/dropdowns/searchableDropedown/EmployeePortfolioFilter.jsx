import React, { useEffect, useState } from "react";
import { Row, Col, Space, Checkbox, Select } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import styles from "./SearchWithPopoverOnly.module.css";
import { usePortfolioContext } from "../../../context/portfolioContax";
import { buildBrokerOptions } from "../../../common/funtions/brokersList";

// 🔹 Initial state
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  quantity: 0,
  startDate: null,
  endDate: null,
  brokerIDs: [],
};

export const EmployeePortfolioFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const { employeeBasedBrokersData } = useDashboardContext();
  const { activeTab } = usePortfolioContext(); // "portfolio" | "pending"

  const {
    setEmployeePortfolioSearch,
    employeePortfolioSearch,
    setEmployeePendingApprovalSearch,
    employeePendingApprovalSearch,
  } = useSearchBarContext();

  // Local state
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

  // 🔹 Brokers dropdown
  const brokerOptions = buildBrokerOptions(employeeBasedBrokersData);

  const handleBrokerChange = (selectedIDs) => {
    setLocalState((prev) => ({ ...prev, brokerIDs: selectedIDs }));
  };

  // 🔹 Search click
  const handleSearchClick = () => {
    const { instrumentName, quantity, startDate, endDate, brokerIDs } =
      localState;

    const searchPayload = {
      ...(activeTab === "pending"
        ? employeePendingApprovalSearch
        : employeePortfolioSearch),
      instrumentName: instrumentName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      brokerIDs: brokerIDs || [],
      pageNumber: 0,
      filterTrigger: true,
    };

    if (activeTab === "pending") {
      setEmployeePendingApprovalSearch(searchPayload);
    } else {
      setEmployeePortfolioSearch(searchPayload);
    }

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false); // Reset external clear flag
    setVisible(false);
  };

  // 🔹 Reset click
  const handleResetClick = () => {
    const resetPayload = {
      ...(activeTab === "pending"
        ? employeePendingApprovalSearch
        : employeePortfolioSearch),
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      brokerIDs: [],
      pageNumber: 0,
      filterTrigger: true,
    };

    if (activeTab === "pending") {
      setEmployeePendingApprovalSearch(resetPayload);
    } else {
      setEmployeePortfolioSearch(resetPayload);
    }

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false); // Reset external clear flag
    setVisible(false);
  };

  return (
    <>
      {/* Instrument Name + Quantity */}
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
      </Row>

      {/* Brokers + Date Range */}
      <Row gutter={[12, 12]}>
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
                  checked={localState.brokerIDs.includes(option.value)}
                  style={{ marginRight: 8 }}
                  className="custom-broker-option"
                />
                {option.data.raw.brokerName}
              </div>
            )}
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

      {/* Buttons */}
      <Row gutter={[12, 12]} justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              text={"Reset"}
              className="big-light-button"
              onClick={handleResetClick}
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
