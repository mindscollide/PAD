import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField, DateRangePicker } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";

// 🔹 Initial default state for local filters
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  quantity: 0,
  startDate: null,
  endDate: null,
};

/**
 * EmployeeMyApprovalFilter Component
 *
 * Provides filtering options for employee approval records.
 * Allows filtering by:
 *   - Instrument Name (string, trims leading spaces)
 *   - Quantity (numbers only)
 *   - Date Range (startDate, endDate in YYYY-MM-DD format)
 *
 * Includes Reset and Search actions, with clean state handling.
 *
 * @param {Object} props
 * @param {Function} props.setVisible - Controls visibility of the filter panel
 * @param {string} props.maininstrumentName - Pre-filled instrument name (e.g., from parent search)
 * @param {Function} props.setMaininstrumentName - Setter to clear/reset pre-filled instrument name
 * @param {boolean} props.clear - Flag to trigger filter reset externally
 * @param {Function} props.setClear - Setter to clear the `clear` flag after reset
 */
export const EmployeeMyApprovalFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  // 🔹 CONTEXT (Global search state from context provider)
  const { employeeMyApprovalSearch, setEmployeeMyApprovalSearch } =
    useSearchBarContext();

  // 🔹 LOCAL STATE (Holds temporary filter values inside the popup)
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
  // 🔹 HANDLERS
  // -----------------------------------------------------

  /**
   * Update a specific field in localState
   */
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handle input changes for text/number fields.
   * - Quantity: Only allows numbers
   * - Instrument Name: Removes leading spaces
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "quantity": {
        // Remove commas before validation
        const rawValue = value.replace(/,/g, "");

        // ✅ Allow only numbers + max 12 digits
        if (
          (rawValue === "" || allowOnlyNumbers(rawValue)) &&
          rawValue.length <= 12
        ) {
          setFieldValue("quantity", rawValue); // keep raw digits in state
        }
        break;
      }

      case "instrumentName":
        setFieldValue("instrumentName", removeFirstSpace(value));
        break;

      default:
        setFieldValue(name, removeFirstSpace(value));
    }
  };

  /**
   * Handle date range change (startDate, endDate)
   */
  const handleDateChange = (dates) => {
    setLocalState({
      ...localState,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    });
  };

  /**
   * Clear only the date range fields
   */
  const handleClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
    }));
  };

  /**
   * Execute search with current localState values.
   * Builds a payload and updates global search context.
   * Closes popup after applying.
   */
  const handleSearchClick = () => {
    const { instrumentName, quantity, startDate, endDate } = localState;

    const searchPayload = {
      ...employeeMyApprovalSearch, // Preserve other filters
      instrumentName: instrumentName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      pageNumber: 0, // Reset pagination
      filterTrigger: true, // Extra flag for triggering search
    };

    // Reset local + global state and close panel
    setEmployeeMyApprovalSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  /**
   * Reset all filters to initial state.
   * Updates global search state, clears local form, and closes popup.
   */
  const handleResetClick = () => {
    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  // -----------------------------------------------------
  // 🔹 RENDER
  // -----------------------------------------------------
  return (
    <>
      {/* ROW 1: Instrument Name & Date Range */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Enter instrument name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={12} style={{ marginTop: "6px" }}>
          <DateRangePicker
            label="Date Range"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>

      {/* ROW 2: Quantity */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Quantity"
            name="quantity"
            value={
              localState.quantity
                ? Number(localState.quantity).toLocaleString("en-US") // 👈 formatted for display
                : ""
            }
            onChange={handleInputChange}
            placeholder="Enter quantity"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ACTION ROW: Reset & Search */}
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
