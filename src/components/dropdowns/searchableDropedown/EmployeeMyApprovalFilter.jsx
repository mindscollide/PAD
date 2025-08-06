import React, { useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import CustomDatePicker from "../../dateSelector/datePicker/datePicker";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";

export const EmployeeMyApprovalFilter = ({ handleSearch }) => {
  const {
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    resetEmployeeMyApprovalSearch,
  } = useSearchBarContext();

  // Local input state
  const [localState, setLocalState] = useState({
    instrumentName: "",
    quantity: "",
    startDate: "",
  });

  // Tracks if the user has interacted with a field
  const [dirtyFields, setDirtyFields] = useState({
    instrumentName: false,
    quantity: false,
    startDate: false,
  });

  /**
   * Returns the display value for an input field.
   * If user hasn't touched the field, fallback to global value.
   */
  const getFieldValue = (field) => {
    return dirtyFields[field]
      ? localState[field]
      : employeeMyApprovalSearch[field] || "";
  };

  /**
   * Handles input change for instrumentName and quantity
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "Quantity") {
      if (value === "" || allowOnlyNumbers(value)) {
        setLocalState((prev) => ({ ...prev, quantity: value }));
        setDirtyFields((prev) => ({ ...prev, quantity: true }));
      }
    } else {
      setLocalState((prev) => ({
        ...prev,
        [name]: removeFirstSpace(value),
      }));
      setDirtyFields((prev) => ({ ...prev, [name]: true }));
    }
  };

  /**
   * Handles date changes
   */
  const handleDateChange = (date) => {
    setLocalState((prev) => ({ ...prev, startDate: date }));
    setDirtyFields((prev) => ({ ...prev, startDate: true }));
  };

  /**
   * Constructs the final search payload by:
   * - Using local value if dirty
   * - Otherwise, using global value
   * - BUT, if local value is empty and dirty, send empty instead of fallback
   */
  const handleSearchClick = () => {
    const finalSearch = {
      ...(dirtyFields.instrumentName && {
        instrumentName: localState.instrumentName,
      }),
      ...(dirtyFields.quantity && {
        quantity: localState.quantity !== "" ? Number(localState.quantity) : 0,
      }),
      ...(dirtyFields.startDate && {
        startDate: localState.startDate,
      }),
    };

    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      ...finalSearch, // only updates touched keys
    }));

    // Optionally reset dirty and local state
    setLocalState({ instrumentName: "", quantity: "", startDate: "" });
    setDirtyFields({
      instrumentName: false,
      quantity: false,
      startDate: false,
    });

    // Trigger parent search function
    handleSearch();
  };

  /**
   * Resets both local and global state
   */
  const handleResetClick = () => {
    resetEmployeeMyApprovalSearch();

    setLocalState({ instrumentName: "", quantity: "", startDate: "" });
    setDirtyFields({
      instrumentName: false,
      quantity: false,
      startDate: false,
    });
  };

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={getFieldValue("instrumentName")}
            onChange={handleInputChange}
            placeholder="Instrument Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Quantity"
            name="Quantity"
            value={getFieldValue("quantity")}
            onChange={handleInputChange}
            placeholder="Quantity"
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
            value={getFieldValue("startDate")}
            onChange={handleDateChange}
            onClear={() => handleDateChange("")}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]} justify="end" style={{ marginTop: 16 }}>
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
