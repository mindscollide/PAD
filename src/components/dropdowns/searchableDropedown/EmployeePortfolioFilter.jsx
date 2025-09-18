import React, { useState } from "react";
import { Row, Col, Space, Checkbox, Select } from "antd";
import { Button, CommenSearchInput, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import styles from "./SearchWithPopoverOnly.module.css";

export const EmployeePortfolioFilter = ({
  handleSearch,
  activeTab,
  setVisible,
}) => {
  const { employeeBasedBrokersData } = useDashboardContext();

  // Local state
  const [localState, setLocalState] = useState({
    instrumentName: "",
    quantity: "",
    startDate: "",
    endDate: "",
    broker: [],
  });
  const [dirtyFields, setDirtyFields] = useState({});

  const {
    employeePortfolioSearch,
    setEmployeePortfolioSearch,
    resetEmployeePortfolioSearch,
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,
  } = useSearchBarContext();

  // Format broker options
  const brokerOptions = (employeeBasedBrokersData || []).map((broker) => ({
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Checkbox
          checked={(activeTab === "pending"
            ? employeePendingApprovalSearch?.broker
            : employeePortfolioSearch?.broker
          )?.includes(broker.brokerID)}
          style={{ marginRight: 8 }}
        />
        {broker.brokerName}
      </div>
    ),
    value: broker.brokerID,
    raw: broker,
  }));

  const resetLocalState = () => {
    setLocalState({ instrumentName: "", quantity: "", startDate: "" });
    setDirtyFields({});
  };

  const handleResetClick = () => {
    if (activeTab === "pending") {
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        instrumentName: "",
        quantity: 0,
        startDate: "",
        endDate: "",
        broker: [],
        pageNumber: 0,
        filterTrigger: true,
      }));
      // resetEmployeePendingApprovalSearch();
    } else {
      setEmployeePortfolioSearch((prev) => ({
        ...prev,
        instrumentName: "",
        quantity: 0,
        startDate: "",
        endDate: "",
        broker: [],
        pageNumber: 0,
        filterTrigger: true,
      }));
      // resetEmployeePortfolioSearch();
    }

    resetLocalState();
    setVisible(false);
  };

  // Handle broker selection
  const handleBrokerChange = (selectedIDs) => {
    if (activeTab === "pending") {
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        broker: selectedIDs,
      }));
    } else {
      setEmployeePortfolioSearch((prev) => ({
        ...prev,
        broker: selectedIDs,
      }));
    }
  };

  // Handle input changes
  const handleEmployeeApprovalInputChange = (e, setState) => {
    const { name, value } = e.target;

    if (name === "Quantity") {
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
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={
              activeTab === "pending"
                ? employeePendingApprovalSearch.instrumentName
                : employeePortfolioSearch.instrumentName
            }
            onChange={(e) =>
              handleEmployeeApprovalInputChange(
                e,
                activeTab === "pending"
                  ? setEmployeePendingApprovalSearch
                  : setEmployeePortfolioSearch
              )
            }
            placeholder="Instrument Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Quantity"
            name="Quantity"
            value={
              activeTab === "pending"
                ? employeePendingApprovalSearch.quantity === 0 ||
                  employeePendingApprovalSearch.quantity === "0"
                  ? ""
                  : employeePendingApprovalSearch.quantity
                : employeePortfolioSearch.quantity === 0 ||
                  employeePortfolioSearch.quantity === "0"
                ? ""
                : employeePortfolioSearch.quantity
            }
            onChange={(e) =>
              handleEmployeeApprovalInputChange(
                e,
                activeTab === "pending"
                  ? setEmployeePendingApprovalSearch
                  : setEmployeePortfolioSearch
              )
            }
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
            placeholder="Select"
            value={
              activeTab === "pending"
                ? employeePendingApprovalSearch?.broker
                : employeePortfolioSearch?.broker
            }
            onChange={handleBrokerChange}
            options={brokerOptions}
            maxTagCount={0}
            maxTagPlaceholder={(omittedValues) =>
              `${omittedValues.length} selected`
            }
            prefixCls="EquitiesBrokerSelectPrefix"
            optionLabelProp="label"
            optionRender={(option) => (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  className="custom-broker-option"
                  checked={(activeTab === "pending"
                    ? employeePendingApprovalSearch?.broker
                    : employeePortfolioSearch?.broker
                  )?.includes(option.value)}
                  style={{ marginRight: 8 }}
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
            value={
              activeTab === "pending"
                ? employeePendingApprovalSearch.startDate &&
                  employeePendingApprovalSearch.endDate
                  ? [
                      employeePendingApprovalSearch.startDate,
                      employeePendingApprovalSearch.endDate,
                    ]
                  : null
                : employeePortfolioSearch.startDate &&
                  employeePortfolioSearch.endDate
                ? [
                    employeePortfolioSearch.startDate,
                    employeePortfolioSearch.endDate,
                  ]
                : null
            }
            onChange={(dates) =>
              activeTab === "pending"
                ? setEmployeePendingApprovalSearch((prev) => ({
                    ...prev,
                    startDate: dates?.[0] || null,
                    endDate: dates?.[1] || null,
                  }))
                : setEmployeePortfolioSearch((prev) => ({
                    ...prev,
                    startDate: dates?.[0] || null,
                    endDate: dates?.[1] || null,
                  }))
            }
            onClear={() =>
              activeTab === "pending"
                ? setEmployeePendingApprovalSearch((prev) => ({
                    ...prev,
                    startDate: null,
                    endDate: null,
                  }))
                : setEmployeePortfolioSearch((prev) => ({
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
              text={"Reset"}
              className="big-light-button"
              onClick={handleResetClick}
            />
            <Button
              onClick={handleSearch}
              text={"Search"}
              className="big-dark-button"
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
