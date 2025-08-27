import React, { useMemo, useState } from "react";
import { Row, Col, Space } from "antd";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";
import moment from "moment";
import CustomDatePicker from "../../dateSelector/datePicker/datePicker";

export const LineManagerApprovalFilter = ({ handleSearch }) => {
  console.log("Checker Search Coming");
  /**
   * useSidebarContext its state handler for this sidebar.
   * - collapsed for check if its open and closed side abr
   * - selectedKey is for which tab or route is open
   */
  const { collapsed, selectedKey } = useSidebarContext();

  // 🔹 Local form state
  const [localState, setLocalState] = useState({
    instrumentName: "",
    quantity: "",
    startDate: "",
  });

  // 🔹 Track touched fields
  const [dirtyFields, setDirtyFields] = useState({});

  /**
   * SearchBarContext its state handler for this function.
   * - instrumentName for instruments of dropdown menu
   * - quantity for quantity of dropdown menu
   * - date for date of dropdown menu
   * - mainInstrumentName for main search bar input
   * - instrumentName and this mainInstrumentName contain same data but issue is we have to handel both diferently
   * - resetLineManagerApprovalSearch is to reset all their state to its initial
   */

  const {
    lineManagerApprovalSearch,
    setLineManagerApprovalSearch,
    resetLineManagerApprovalSearch,
  } = useSearchBarContext();
  /**
   * Handles input change for approval filters.
   * - Allows only numeric input for "Quantity"
   * - Removes leading space for text fields
   */

  // 🔹 Helper to update field + mark dirty
  const setFieldValue = (field, value) => {
    console.log("handleDateChange", field, value);

    setLocalState((prev) => ({ ...prev, [field]: value }));

    setDirtyFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleDateChange = (date, fieldName) => {
    setFieldValue(fieldName, date); // keep moment | null in state
  };

  const startDateValue = useMemo(() => {
    if (dirtyFields.startDate) {
      return localState.startDate; // already a moment | null
    }
    return lineManagerApprovalSearch.startDate
      ? moment(lineManagerApprovalSearch.startDate, "YYYY-MM-DD")
      : null;
  }, [
    dirtyFields.startDate,
    localState.startDate,
    lineManagerApprovalSearch.startDate,
  ]);

  const handleLManagerApprovalInputChange = (e, setState) => {
    const { name, value } = e.target;

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
            value={lineManagerApprovalSearch.instrumentName}
            onChange={(e) =>
              handleLManagerApprovalInputChange(e, setLineManagerApprovalSearch)
            }
            placeholder="Instrument Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Requester Name"
            name="quantity"
            value={lineManagerApprovalSearch.quantity}
            onChange={(e) =>
              handleLManagerApprovalInputChange(e, setLineManagerApprovalSearch)
            }
            placeholder="Requester Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <CustomDatePicker
            label="Date"
            name="startDate"
            size="medium"
            value={startDateValue}
            onChange={(date) => handleDateChange(date, "startDate")}
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>
      <Row gutter={[12, 12]} justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              onClick={resetLineManagerApprovalSearch}
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
