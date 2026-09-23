import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";

// 🔹 Initial local filters
const INITIAL_LOCAL_STATE = {
  ipAddress: "",
  startDate: null,
  endDate: null,
};

export const AdminSessionWiseActivityFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const { setAdminSessionWiseActivitySearch, adminSessionWiseActivitySearch } =
    useSearchBarContext();

  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  // -----------------------------------------------------
  // 🔹 Reset local form when external clear is triggered
  // -----------------------------------------------------
  /**
   * Prefill instrument name if passed from parent (maininstrumentName).
   * Useful for quick search-to-filter transition.
   */
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        ipAddress: maininstrumentName,
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
  // 🔹 IP Input Handler (auto-format IP)
  // -----------------------------------------------------
  const handleIPChange = (e) => {
    let { value } = e.target;

    // Allow digits & dots
    value = value.replace(/[^0-9.]/g, "");

    // Prevent multiple dots
    value = value.replace(/\.{2,}/g, ".");

    // Remove starting dot
    if (value.startsWith(".")) value = value.substring(1);

    // Limit blocks (0–255)
    let parts = value.split(".");
    if (parts.length > 4) parts = parts.slice(0, 4);

    parts = parts.map((part) => part.slice(0, 3)); // max 3 digits each

    value = parts.join(".");

    setLocalState((prev) => ({ ...prev, ipAddress: value }));
  };

  // -----------------------------------------------------
  // 🔹 Date Range Handler
  // -----------------------------------------------------
  const handleDateChange = (dates) => {
    setLocalState((prev) => ({
      ...prev,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    }));
  };

  // -----------------------------------------------------
  // 🔹 Search Handler
  // -----------------------------------------------------
  const handleSearchClick = () => {
    const { ipAddress, startDate, endDate } = localState;

    const searchPayload = {
      ...adminSessionWiseActivitySearch,
      ipAddress: ipAddress || "",
      startDate: startDate || null,
      endDate: endDate || null,
      pageNumber: 0,
      filterTrigger: true,
    };
    console.log("handleSearchClick", searchPayload);
    setAdminSessionWiseActivitySearch(searchPayload);
    setVisible(false);
  };

  // -----------------------------------------------------
  // 🔹 Reset Handler
  // -----------------------------------------------------
  const handleResetClick = () => {
    const resetPayload = {
      ...adminSessionWiseActivitySearch,
      ipAddress: "",
      startDate: "",
      endDate: "",
      pageNumber: 0,
      filterTrigger: true,
    };

    setAdminSessionWiseActivitySearch(resetPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
  };

  return (
    <>
      {/* IP Address */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="IP Address"
            name="ipAddress"
            value={localState.ipAddress}
            onChange={handleIPChange}
            placeholder="Enter IP Address"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        {/* Date Range */}
        <Col xs={24} sm={24} md={12} lg={12}>
          <DateRangePicker
            label="Login Date Range"
            value={[localState.startDate, localState.endDate]}
            onChange={handleDateChange}
            placeholder="Select Date Range"
            size="medium"
          />
        </Col>
      </Row>

      {/* Buttons */}
      <Row gutter={[12, 12]} justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              text={"Reset"}
              className="big-light-button"
              onClick={handleResetClick}
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
