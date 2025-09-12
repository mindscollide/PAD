import React, { useMemo, useState } from "react";
import { Row, Col, Space, Select, Checkbox } from "antd";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../commen/funtions/rejex";

export const EmployeeTransactionFilter = ({
  handleSearch,
  setVisible,
  activeTab,
}) => {
  console.log("Checker Search Coming");
  /**
   * useSidebarContext its state handler for this sidebar.
   * - collapsed for check if its open and closed side abr
   * - selectedKey is for which tab or route is open
   */
  const { collapsed, selectedKey } = useSidebarContext();
  console.log(selectedKey, "selectedKeyselectedKey6677");

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

  // 🔹 Local form state
  const [localState, setLocalState] = useState({
    instrumentName: "",
    quantity: "",
    startDate: null,
    endDate: null,
  });

  // 🔹 Track touched fields
  const [dirtyFields, setDirtyFields] = useState({});

  // 🔹 Helper: update state & mark dirty
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
    setDirtyFields((prev) => ({ ...prev, [field]: true }));
  };

  /**
   * Handles input change for approval filters.
   * - Allows only numeric input for "Quantity"
   * - Removes leading space for text fields
   */
  // 🔹 Update the local state
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
  // 🔹 Handle date range change
  const handleDateChange = (dates) => {
    setFieldValue("startDate", dates?.[0] || null);
    setFieldValue("endDate", dates?.[1] || null);
  };

  // ✅ Memoized values
  const instrumentNameValue = useMemo(() => {
    return dirtyFields.instrumentName
      ? localState.instrumentName
      : employeeMyTransactionSearch.instrumentName || "";
  }, [
    dirtyFields.instrumentName,
    localState.instrumentName,
    employeeMyTransactionSearch.instrumentName,
  ]);

  const quantityValue = useMemo(() => {
    return dirtyFields.quantity
      ? localState.quantity
      : employeeMyTransactionSearch.quantity?.toString() || "";
  }, [
    dirtyFields.quantity,
    localState.quantity,
    employeeMyTransactionSearch.quantity,
  ]);

  const dateRangeValue = useMemo(() => {
    if (dirtyFields.startDate || dirtyFields.endDate) {
      return localState.startDate && localState.endDate
        ? [localState.startDate, localState.endDate]
        : null;
    }
    return employeeMyTransactionSearch.startDate &&
      employeeMyTransactionSearch.endDate
      ? [
          employeeMyTransactionSearch.startDate,
          employeeMyTransactionSearch.endDate,
        ]
      : null;
  }, [
    dirtyFields.startDate,
    dirtyFields.endDate,
    localState.startDate,
    localState.endDate,
    employeeMyTransactionSearch.startDate,
    employeeMyTransactionSearch.endDate,
  ]);

  // 🔹 Handle search button click
  // 🔹 Search
  const handleSearchClick = async () => {
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
          : null,
      }),
      ...(dirtyFields.endDate && {
        endDate: localState.endDate
          ? localState.endDate.format("YYYY-MM-DD")
          : null,
      }),
      pageNumber: 0,
    };

    await setEmployeeMyTransactionSearch(finalSearch);
    handleSearch(finalSearch);
  };

  // 🔹 Reset
  const handleResetClick = () => {
    setEmployeeMyTransactionSearch((prev) => ({
      ...prev,
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      tableFilterTrigger: true,
    }));

    resetLocalState();
    setVisible(false);
  };

  /** Reset local state + dirty flags */
  const resetLocalState = () => {
    setLocalState({
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
    });
    setDirtyFields({});
  };

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
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Date Range"
            size="medium"
            value={dateRangeValue}
            onChange={handleDateChange}
            onClear={() =>
              setLocalState((prev) => ({
                ...prev,
                startDate: null,
                endDate: null,
              }))
            }
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
