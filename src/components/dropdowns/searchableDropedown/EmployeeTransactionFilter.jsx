import React from "react";
import { Row, Col, Space } from "antd";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";

export const EmployeeTransactionFilter = ({ handleSearch }) => {
  /**
   * useSidebarContext its state handler for this sidebar.
   * - collapsed for check if its open and closed side abr
   * - selectedKey is for which tab or route is open
   */
  const { collapsed, selectedKey } = useSidebarContext();

  /**
   * SearchBarContext its state handler for this function.
   * - instrumentName for instruments of dropdown menu
   * - quantity for quantity of dropdown menu
   * - date for date of dropdown menu
   * - mainInstrumentName for main search bar input
   * - instrumentName and this mainInstrumentName contain same data but issue is we have to handel both diferently
   * - resetEmployeeMyTransactionSearch is to reset all their state to its initial
   */

  const {
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch,
    resetEmployeeMyTransactionSearch,
  } = useSearchBarContext();
  /**
   * Handles input change for approval filters.
   * - Allows only numeric input for "Quantity"
   * - Removes leading space for text fields
   */
  const handleEmployeeApprovalInputChange = (e, setState) => {
    const { name, value } = e.target;
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

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={employeeMyTransactionSearch.instrumentName}
            onChange={(e) =>
              handleEmployeeApprovalInputChange(
                e,
                setEmployeeMyTransactionSearch
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
            value={employeeMyTransactionSearch.quantity}
            onChange={(e) =>
              handleEmployeeApprovalInputChange(
                e,
                setEmployeeMyTransactionSearch
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
          <DateRangePicker
            label="Date Range"
            size="medium"
            value={
              employeeMyTransactionSearch.startDate &&
              employeeMyTransactionSearch.endDate
                ? [
                    employeeMyTransactionSearch.startDate,
                    employeeMyTransactionSearch.endDate,
                  ]
                : null
            }
            onChange={(dates) =>
              setEmployeeMyTransactionSearch((prev) => ({
                ...prev,
                startDate: dates?.[0] || null,
                endDate: dates?.[1] || null,
              }))
            }
            onClear={() =>
              setEmployeeMyTransactionSearch((prev) => ({
                ...prev,
                startDate: null,
                endDate: null,
              }))
            }
          />
        </Col>
      </Row>
      <Row gutter={[12, 12]} justify="end">
        <Col>
          <Space>
            <Button
              onClick={resetEmployeeMyTransactionSearch}
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
