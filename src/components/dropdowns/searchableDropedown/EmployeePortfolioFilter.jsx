import React from "react";
import { Row, Col, Space } from "antd";
import { Button, CommenSearchInput, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";
import { useDashboardContext } from "../../../context/dashboardContaxt";

export const EmployeePortfolioFilter = ({ handleSearch, activeTab }) => {
  const { employeeBasedBrokersData } = useDashboardContext();
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

  const brokerOptions = employeeBasedBrokersData?.map((broker) => ({
    value: broker.brokerID, // store ID
    label: broker.brokerName, // show name
    brokerID: broker.brokerID, // keep full info if you need it later
    brokerName: broker.brokerName,
  }));
  console.log("employeeBasedBrokersData", employeeBasedBrokersData);
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
        <Col xs={24} sm={24} md={12} lg={12}>
          <CommenSearchInput
            label="Broker"
            name="broker"
            value={
              activeTab === "pending"
                ? employeePendingApprovalSearch.broker
                : employeePortfolioSearch.broker
            }
            options={brokerOptions}
            onChange={(e) =>
              handleEmployeeApprovalInputChange(
                e,
                activeTab === "pending"
                  ? setEmployeePendingApprovalSearch
                  : setEmployeePortfolioSearch
              )
            }
            placeholder="Select a Broker"
            className={"input-dropdown-search"} // or just "custom-dropdown" for global CSS
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
              onClick={
                activeTab === "pending"
                  ? resetEmployeePendingApprovalSearch
                  : resetEmployeePortfolioSearch
              }
              text={"Reset"}
              className="big-light-button"
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
