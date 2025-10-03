import React, { useMemo, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField, DateRangePicker } from "../.."; // ✅ Import DateRangePicker directly
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";

export const EmployeeMyApprovalFilter = ({ handleSearch, setVisible }) => {
  const { employeeMyApprovalSearch, setEmployeeMyApprovalSearch } =
    useSearchBarContext();

  /**
   * 🔹 Local state holds temporary filter values before search
   * - instrumentName: string
   * - quantity: string
   */
  const [localState, setLocalState] = useState({
    instrumentName: "",
    quantity: "",
    dateRange: null,
  });

  // 🔹 Track touched fields
  const [dirtyFields, setDirtyFields] = useState({});

  // 🔹 Helper to update field + mark dirty
  const setFieldValue = (field, value) => {
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

  /** Handle Search */
  const handleSearchClick = () => {
    setEmployeeMyApprovalSearch((prev) => {
      const finalSearch = {
        ...prev,
        ...(dirtyFields.instrumentName && {
          instrumentName: localState.instrumentName,
        }),
        ...(dirtyFields.quantity && {
          quantity:
            localState.quantity !== "" ? Number(localState.quantity) : 0,
        }),
        ...(dirtyFields.dateRange && {
          startDate: localState.dateRange?.[0]
            ? localState.dateRange[0].format("YYYY-MM-DD")
            : null,
          endDate: localState.dateRange?.[1]
            ? localState.dateRange[1].format("YYYY-MM-DD")
            : null,
        }),
        pageNumber: 0,
      };
      console.log("finalSearch", finalSearch);
      handleSearch(finalSearch);
      return finalSearch;
    });
  };

  /** Reset filters */
  const handleResetClick = () => {
    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      pageNumber: 0,
      tableFilterTrigger: true,
    }));
    resetLocalState();
    setVisible(false);
  };

  /** Reset local state + dirty flags */
  const resetLocalState = () => {
    setLocalState({ instrumentName: "", quantity: "", dateRange: null });
    setDirtyFields({});
  };

  /** Handle Date Range change */
  const handleDateChange = (dates) => {
    console.log("dateRange", dates);

    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    }));
  };

  // ✅ Memoized values
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

  return (
    <>
      {/* 🔸 First Row: Instrument Name & Date Range */}
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
          <DateRangePicker
            label="Date Range"
            size="medium"
            value={[
              employeeMyApprovalSearch.startDate || null,
              employeeMyApprovalSearch.endDate || null,
            ]}
            onChange={(dates) => handleDateChange(dates)}
            onClear={() =>
              setEmployeeMyApprovalSearch((prev) => ({
                ...prev,
                startDate: null,
                endDate: null,
              }))
            }
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
