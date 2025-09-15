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

export const LineManagerApprovalFilter = ({ handleSearch, setVisible }) => {
  const { lineManagerApprovalSearch, setLineManagerApprovalSearch } =
    useSearchBarContext();

  // 🔹 Local form state
  const [localState, setLocalState] = useState({
    instrumentName: "",
    requesterName: "",
    startDate: "",
  });
  /**
   * useSidebarContext its state handler for this sidebar.
   * - collapsed for check if its open and closed side abr
   * - selectedKey is for which tab or route is open
   */

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "Quantity") {
      if (value === "" || allowOnlyNumbers(value)) {
        setFieldValue("quantity", value);
      }
    } else {
      setFieldValue(name, removeFirstSpace(value));
    }
  };

  /** Handle date selection */
  const handleSearchClick = async () => {
    console.log("Checke Seletc");
    const finalSearch = {
      ...(dirtyFields.instrumentName && {
        instrumentName: localState.instrumentName,
      }),
      ...(dirtyFields.requesterName && {
        requesterName: localState.requesterName,
      }),
      ...(dirtyFields.startDate && {
        startDate: localState.startDate
          ? localState.startDate.format("YYYY-MM-DD")
          : "",
      }),
      pageNumber: 0,
    };

    await setLineManagerApprovalSearch(finalSearch);
    console.log("Checke Seletc", finalSearch);
    handleSearch(finalSearch);

    // 🚫 don’t reset here, let Reset button handle it
  };

  /** Reset filters */
  const handleResetClick = () => {
    console.log("Checke Seletc");
    setLineManagerApprovalSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      startDate: "",
      pageNumber: 0,
      tableFilterTrigger: true,
    }));
    resetLocalState();
    setVisible(false);
  };

  /** Reset local state + dirty flags */
  const resetLocalState = () => {
    setLocalState({ instrumentName: "", requesterName: "", startDate: "" });
    setDirtyFields({});
  };

  const handleDateChange = (date, fieldName) => {
    setFieldValue(fieldName, date); // keep moment | null in state
  };

  // ✅ Memoized values (only recompute when needed)
  const instrumentNameValue = useMemo(() => {
    return dirtyFields.instrumentName
      ? localState.instrumentName
      : lineManagerApprovalSearch.instrumentName || "";
  }, [
    dirtyFields.instrumentName,
    localState.instrumentName,
    lineManagerApprovalSearch.instrumentName,
  ]);

  const requesterValue = useMemo(() => {
    return dirtyFields.requesterName
      ? localState.requesterName
      : lineManagerApprovalSearch.requesterName?.toString() || "";
  }, [
    dirtyFields.requesterName,
    localState.requesterName,
    lineManagerApprovalSearch.requesterName,
  ]);

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

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={instrumentNameValue}
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
            value={requesterValue}
            onChange={handleInputChange}
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
