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

  // for employeeBroker state to show data in dropdown
  const [selectedBrokers, setSelectedBrokers] = useState([]);
  const [localState, setLocalState] = useState({
    instrumentName: "",
    quantity: "",
    startDate: "",
    endDate: "",
    broker: [],
  });
  const [dirtyFields, setDirtyFields] = useState({});

  /**
   * SearchBarContext its state handler for this function.
   * - instrumentShortName for instruments of dropdown menu
   * - quantity for quantity of dropdown menu
   * - date for date of dropdown menu
   * - mainInstrumentShortName for main search bar input
   * - instrumentName and this mainInstrumentName contain same data but issue is we have to handel both diferently
   * - resetEmployeePortfolioSearch is to reset all their state to its initial
   */

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
          checked={selectedBrokers.some((b) => b.brokerID === broker.brokerID)}
          style={{ marginRight: 8 }}
        />
        {broker.brokerName}
      </div>
    ),
    value: broker.brokerID,
    raw: broker, // keep full broker data for later use
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
    }

    resetLocalState();
    setVisible(false);
  };
  // OnChange Handle when user selects/deselects brokers
  const handleBrokerChange = (selectedIDs) => {
    const selectedData = brokerOptions
      .filter((item) => selectedIDs.includes(item.value))
      .map((item) => item.raw);
    const brokerIDs = selectedData.map((b) => b.brokerID);
    if (activeTab === "pending") {
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        broker: brokerIDs, // <-- saves array of IDs
      }));
    } else {
      setEmployeePortfolioSearch((prev) => ({
        ...prev,
        broker: brokerIDs, // <-- saves array of IDs
      }));
    }
    // ✅ Save into state

    // setSelectedBrokers(selectedData);
  };

  /**
   * Handles input change for approval filters.
   * - Allows only numeric input for "Quantity"
   * - Removes leading space for text fields
   */
  const handleEmployeeApprovalInputChange = (e, setState) => {
    const { name, value } = e.target;
    console.log("handleEmployeeApprovalInputChange", name);
    // Handle numeric validation for Quantity
    if (name === "Quantity") {
      if (value === "" || allowOnlyNumbers(value)) {
        setState((prev) => ({ ...prev, quantity: value }));
      }
      return;
    }

    // General handler
    setState((prev) => ({
      ...prev,
      [name]: removeFirstSpace(value),
    }));
  };

  // const brokerOptions = employeeBasedBrokersData?.map((broker) => ({
  //   value: broker.brokerID, // store ID
  //   label: broker.brokerName, // show name
  //   brokerID: broker.brokerID, // keep full info if you need it later
  //   brokerName: broker.brokerName,
  // }));

  return (
    <>
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
                ? employeePendingApprovalSearch.quantity
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
      <Row gutter={[12, 12]}>
        <Col span={12} className={styles.brokersOptionData}>
          <label className={styles.instrumentLabel}>Brokers</label>
          <Select
            mode="multiple"
            placeholder="Select"
            value={
              activeTab === "pending"
                ? employeePendingApprovalSearch?.broker
                : employeePortfolioSearch
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
                  checked={
                    activeTab === "pending"
                      ? employeePendingApprovalSearch?.broker?.includes(
                          option.value
                        )
                      : employeePortfolioSearch?.broker?.includes(option.value)
                  }
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
