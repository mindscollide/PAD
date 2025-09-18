import React, { useMemo, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import CustomDatePicker from "../../dateSelector/datePicker/datePicker";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";
import moment from "moment";

export const EmployeeMyApprovalFilter = ({ handleSearch, setVisible }) => {
  const { employeeMyApprovalSearch, setEmployeeMyApprovalSearch } =
    useSearchBarContext();

  // 🔹 Local form state
  const [localState, setLocalState] = useState({
    instrumentName: "",
    quantity: "",
    startDate: "",
  });

  console.log(localState.startDate, "chekcejcehevhjvadatdad");

  // 🔹 Track touched fields
  const [dirtyFields, setDirtyFields] = useState({});

  // 🔹 Helper to update field + mark dirty
  const setFieldValue = (field, value) => {
    console.log("handleDateChange", field, value);

    setLocalState((prev) => ({ ...prev, [field]: value }));

    setDirtyFields((prev) => ({ ...prev, [field]: true }));
  };

  /** Handle text input (instrumentName, quantity) */
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
      ...(dirtyFields.quantity && {
        quantity: localState.quantity !== "" ? Number(localState.quantity) : 0,
      }),
      ...(dirtyFields.startDate && {
        startDate: localState.startDate
          ? localState.startDate.format("YYYY-MM-DD")
          : "",
      }),
      pageNumber: 0,
    };

    await setEmployeeMyApprovalSearch(finalSearch);
    console.log("Checke Seletc", finalSearch);
    handleSearch(finalSearch);

    // 🚫 don’t reset here, let Reset button handle it
  };

  /** Reset filters */
  const handleResetClick = () => {
    console.log("Checke Seletc");
    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      instrumentName: "",
      quantity: 0,
      startDate: "",
      pageNumber: 0,
      tableFilterTrigger: true,
    }));
    resetLocalState();
    setVisible(false);
  };

  /** Reset local state + dirty flags */
  const resetLocalState = () => {
    setLocalState({ instrumentName: "", quantity: "", startDate: "" });
    setDirtyFields({});
  };
  const handleDateChange = (date, fieldName) => {
    setFieldValue(fieldName, date); // keep moment | null in state
  };
  // ✅ Memoized values (only recompute when needed)
  const instrumentNameValue = useMemo(() => {
    return dirtyFields.instrumentName
      ? localState.instrumentName
      : employeeMyApprovalSearch.instrumentName || "";
  }, [
    dirtyFields.instrumentName,
    localState.instrumentName,
    employeeMyApprovalSearch.instrumentName,
  ]);

  const quantityValue = useMemo(() => {
    return dirtyFields.quantity
      ? localState.quantity
      : employeeMyApprovalSearch.quantity?.toString() || "";
  }, [
    dirtyFields.quantity,
    localState.quantity,
    employeeMyApprovalSearch.quantity,
  ]);

  const startDateValue = useMemo(() => {
    if (dirtyFields.startDate) {
      return localState.startDate; // already a moment | null
    }
    return employeeMyApprovalSearch.startDate
      ? moment(employeeMyApprovalSearch.startDate, "YYYY-MM-DD")
      : null;
  }, [
    dirtyFields.startDate,
    localState.startDate,
    employeeMyApprovalSearch.startDate,
  ]);
  console.log("quantityValue", quantityValue);
  return (
    <>
      {/* 🔸 First Row: Instrument Name & Date */}
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

        <Col xs={24} sm={24} md={12} lg={12} style={{ marginTop: "6px" }}>
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

      {/* 🔸 Second Row: Quantity */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Quantity"
            name="Quantity"
            value={
              quantityValue === 0 || quantityValue === "0" ? "" : quantityValue
            }
            onChange={handleInputChange}
            placeholder="Quantity"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* 🔸 Third Row: Actions */}
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
