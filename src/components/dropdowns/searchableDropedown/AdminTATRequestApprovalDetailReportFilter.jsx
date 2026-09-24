import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

/* =============================================================================
 * 🔹 Initial Local State
 * -----------------------------------------------------------------------------
 * Maintains filter input values locally before applying them
 * to the global search state.
 * =============================================================================
 */
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  quantity: "",
  startDate: null,
  endDate: null,
  actionStartDate: null,
  actionEndDate: null,
  actionBy: "",
  tat: "",
};

/* =============================================================================
 * 🔍 HTA TAT View Detail Filter
 * -----------------------------------------------------------------------------
 * Used for filtering HTA TAT View Detail data.
 * Supports text, numeric, and date range filters.
 * =============================================================================
 */
export const AdminTATRequestApprovalViewDetailFilter = ({
  setVisible,
  clear,
  setClear,
  maininstrumentName,
  setMaininstrumentName,
}) => {
  /* ===========================================================================
   * 📌 Context
   * ---------------------------------------------------------------------------
   * Global search state for HTA TAT View Details
   * ===========================================================================
   */
  const {
    HTATATViewDetailsSearch,
    setHTATATViewDetailsSearch,
    adminTATViewDetailsSearch,
    setAdminTATViewDetailsSearch,
  } = useSearchBarContext();

  /* ===========================================================================
   * 🧠 Local State
   * ---------------------------------------------------------------------------
   * Holds form values until user triggers Search
   * ===========================================================================
   */
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  /* ===========================================================================
   * 🔄 Effects
   * ===========================================================================
   */

  /**
   * Prefill Instrument Name when selected from outside
   */
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        instrumentName: maininstrumentName,
      }));
      setClear(false);
      setMaininstrumentName("");
    }
  }, [maininstrumentName]);

  /**
   * Handle external reset trigger
   */
  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  /* ===========================================================================
   * 🛠 Handlers
   * ===========================================================================
   */

  /**
   * Generic field setter
   */
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handle text and numeric input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/,/g, "");

    // Quantity: numbers only
    if (name === "quantity") {
      if (
        (rawValue === "" || allowOnlyNumbers(rawValue)) &&
        rawValue.length <= 12
      ) {
        setFieldValue("quantity", rawValue);
      }
    }

    // TAT: free text in the grid's own shape, e.g. "197 H, 40 M"
    // (API_Changes/2026-09-24_admin_tat_view_details_tat_search_format.md) -
    // only digits, H/M, comma and space are allowed. A bare number still
    // means total minutes server-side.
    else if (name === "tat") {
      if (/^[0-9hHmM, ]*$/.test(value) && value.length <= 20) {
        setFieldValue("tat", removeFirstSpace(value));
      }
    }

    // Other text inputs
    else {
      setFieldValue(name, removeFirstSpace(value));
    }
  };

  /**
   * Request date range handler
   */
  const handleDateChange = (dates) => {
    setLocalState((prev) => ({
      ...prev,
      startDate: dates?.[0] ?? null,
      endDate: dates?.[1] ?? null,
    }));
  };

  /**
   * Clear request date range
   */
  const handleClearDates = () => {
    setLocalState((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
    }));
  };

  /**
   * Action date range handler
   */
  const handleDateChangeAction = (dates) => {
    setLocalState((prev) => ({
      ...prev,
      actionStartDate: dates?.[0] ?? null,
      actionEndDate: dates?.[1] ?? null,
    }));
  };

  /**
   * Clear action date range
   */
  const handleClearDatesEscalated = () => {
    setLocalState((prev) => ({
      ...prev,
      actionStartDate: null,
      actionEndDate: null,
    }));
  };

  /**
   * 🔍 Apply filters
   * Pushes local state into global search context
   */
  const handleSearchClick = () => {
    const {
      instrumentName,
      quantity,
      actionBy,
      startDate,
      endDate,
      actionStartDate,
      actionEndDate,
      tat,
    } = localState;
    console.log("adminTATViewDetailsSearch", localState);

    setAdminTATViewDetailsSearch({
      ...adminTATViewDetailsSearch,
      instrumentName: instrumentName?.trim() || "",
      quantity: quantity ? Number(quantity) : 0,

      // ✅ Dates: pass as-is (null stays null)
      startDate,
      endDate,
      actionStartDate,
      actionEndDate,

      actionBy: actionBy?.trim() || "",
      tat: tat?.trim() || "",
      pageNumber: 1,
      filterTrigger: true,
    });

    setVisible(false);
    setClear(false);
  };

  /**
   * ♻️ Reset filters
   */
  const handleResetClick = () => {
    setAdminTATViewDetailsSearch({
      ...adminTATViewDetailsSearch,
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      actionStartDate: null,
      actionEndDate: null,
      actionBy: "",
      tat: "",
      type: [], // clear Type too, if that column exists here
      pageNumber: 1,
      pageSize: 10,
      filterTrigger: true, // ✅ add this
    });

    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /* ===========================================================================
   * 🖥 Render
   * ===========================================================================
   */
  return (
    <>
      {/* Instrument & Quantity */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Instrument Name"
            size="medium"
          />
        </Col>

        <Col xs={24} md={12}>
          <TextField
            label="Quantity"
            name="quantity"
            value={
              localState.quantity
                ? Number(localState.quantity).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Quantity"
            size="medium"
          />
        </Col>
      </Row>

      {/* Action By & TAT */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Action By"
            name="actionBy"
            value={localState.actionBy}
            onChange={handleInputChange}
            placeholder="Action By"
            size="medium"
          />
        </Col>

        <Col xs={24} md={12}>
          <TextField
            label="TAT"
            name="tat"
            value={localState.tat}
            onChange={handleInputChange}
            placeholder="e.g. 197 H, 40 M"
            size="medium"
          />
        </Col>
      </Row>

      {/* Date Ranges */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <DateRangePicker
            label="Initiated At Date Range"
            size="medium"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            onClear={handleClearDates}
          />
        </Col>

        <Col xs={24} md={12}>
          <DateRangePicker
            label="Action At Date Range"
            size="medium"
            value={[localState.actionStartDate, localState.actionEndDate]}
            onChange={handleDateChangeAction}
            onClear={handleClearDatesEscalated}
          />
        </Col>
      </Row>

      {/* Actions */}
      <Row justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              text="Reset"
              onClick={handleResetClick}
              className="big-light-button"
            />
            <Button
              text="Search"
              onClick={handleSearchClick}
              className="big-dark-button"
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
