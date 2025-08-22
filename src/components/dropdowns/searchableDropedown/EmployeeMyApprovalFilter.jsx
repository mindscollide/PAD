import React, { useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import CustomDatePicker from "../../dateSelector/datePicker/datePicker";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";

/**
 * EmployeeMyApprovalFilter
 * -------------------------
 * Filters data based on user input: instrument name, quantity, and start date.
 * Syncs input with both local state (for UI) and global state (for logic).
 *
 * @param {Function} handleSearch - Function to call when the "Search" button is clicked.
 */
export const EmployeeMyApprovalFilter = ({ handleSearch }) => {
  const {
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    resetEmployeeMyApprovalSearch,
  } = useSearchBarContext();

  // 🔹 Local state for form inputs
  const [localState, setLocalState] = useState({
    instrumentName: "",
    quantity: "",
    startDate: "",
  });

  // 🔹 Track which fields the user has interacted with
  const [dirtyFields, setDirtyFields] = useState({
    instrumentName: false,
    quantity: false,
    startDate: false,
  });

  /**
   * Return the display value for a given field:
   * - If dirty: use local input
   * - If not: fallback to global state
   */
  const getFieldValue = (field) => {
    return dirtyFields[field]
      ? localState[field]
      : employeeMyApprovalSearch[field] || "";
  };

  /**
   * Handle text input change (instrument name & quantity)
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
   * Handle date selection or clearing
   */
  const handleDateChange = (date) => {
    setLocalState((prev) => ({ ...prev, startDate: date }));
    setDirtyFields((prev) => ({ ...prev, startDate: true }));
  };

  /**
   * Handle search click:
   * - Merge local values (only if dirty) into global state
   * - If input is cleared, reflect that in global state
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
      pageNumber: 0,
    };

    // 🔸 Only update touched fields, preserve others in global state
    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      ...finalSearch,
    }));

    // 🔸 Clear local state and dirty flags after search
    setLocalState({ instrumentName: "", quantity: "", startDate: "" });
    setDirtyFields({
      instrumentName: false,
      quantity: false,
      startDate: false,
    });

    // 🔸 Trigger parent-level search logic
    handleSearch();
  };

  /**
   * Handle reset click:
   * - Clears all local & global filter fields
   * - Triggers a re-render via tableFilterTrigger if needed
   */
  const handleResetClick = () => {
    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      instrumentName: "",
      quantity: 0,
      startDate: "",
      pageNumber: 0,
      tableFilterTrigger: true, // optional: to notify table to refetch/reset
    }));

    // Reset local state and dirty flags
    setLocalState({ instrumentName: "", quantity: "", startDate: "" });
    setDirtyFields({
      instrumentName: false,
      quantity: false,
      startDate: false,
    });
  };

  return (
    <>
      {/* 🔸 First Row: Instrument Name & Quantity */}
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

        <Col xs={24} sm={24} md={12} lg={12} style={{ marginTop: "6px" }}>
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

      {/* 🔸 Second Row: Date Picker */}
      <Row gutter={[12, 12]}>
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

      {/* 🔸 Third Row: Action Buttons */}
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
