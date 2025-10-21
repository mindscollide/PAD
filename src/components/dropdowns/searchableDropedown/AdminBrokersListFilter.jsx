import React, { useEffect, useState } from "react";
import { Row, Col, Space, Checkbox, Select } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { removeFirstSpace } from "../../../common/funtions/rejex";

// 🔹 Initial state
const INITIAL_LOCAL_STATE = {
  brokerName: "",
  psxCode: "",
};

export const AdminBrokersListFiletr = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const { setAdminBrokerSearch, adminBrokerSearch } = useSearchBarContext();

  // Local state
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
        brokerName: maininstrumentName,
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

  // 🔹 Helpers
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  // 🔹 Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFieldValue(name, removeFirstSpace(value));
  };

  // 🔹 Search click
  const handleSearchClick = () => {
    const { brokerName, psxCode } = localState;
    const searchPayload = {
      ...adminBrokerSearch,
      brokerName: brokerName?.trim() || "",
      psxCode: psxCode?.trim() || "",
      pageNumber: 0,
      filterTrigger: true,
    };

    setAdminBrokerSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false); // Reset external clear flag
    setVisible(false);
  };

  // 🔹 Reset click
  const handleResetClick = () => {
    const resetPayload = {
      ...adminBrokerSearch,
      brokerName: "",
      psxCode: "",
      pageNumber: 0,
      filterTrigger: true,
    };

    setAdminBrokerSearch(resetPayload);

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false); // Reset external clear flag
    setVisible(false);
  };

  return (
    <>
      {/* Instrument Name + Quantity */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Broker Name"
            name="brokerName"
            value={localState.brokerName}
            onChange={handleInputChange}
            placeholder="Broker Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="PSX Code"
            name="psxCode"
            value={localState.psxCode}
            onChange={handleInputChange}
            placeholder="PSX Code"
            size="medium"
            classNames="Search-Field"
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
