import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyAlphabets,
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

// 🔹 Initial default state for local filters
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  requesterName: "",
  quantity: 0,
  startDate: null,
  endDate: null,
};

export const LineManagerApprovalFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const { lineManagerApprovalSearch, setLineManagerApprovalSearch } =
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
      case "requesterName": {
        if (allowOnlyAlphabets(value)) {
          setFieldValue(name, removeFirstSpace(value));
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
    const { instrumentName, requesterName, quantity, startDate, endDate } =
      localState;

    const searchPayload = {
      ...lineManagerApprovalSearch, // Preserve other filters
      instrumentName: instrumentName?.trim() || "",
      requesterName: requesterName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,
      startDate: startDate || null,
      endDate: endDate || null,
      pageNumber: 0, // Reset pagination
      filterTrigger: true, // Extra flag for triggering search
    };

    // Reset local + global state and close panel
    setLineManagerApprovalSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  /**
   * Reset all filters to initial state.
   * Updates global search state, clears local form, and closes popup.
   */
  const handleResetClick = () => {
    setLineManagerApprovalSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
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
          <TextField
            label="Requester Name"
            name="requesterName"
            value={localState.requesterName}
            onChange={handleInputChange}
            placeholder="Requester Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>
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
            placeholder="Quantity"
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
