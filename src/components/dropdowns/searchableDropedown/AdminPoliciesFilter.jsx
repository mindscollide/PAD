import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { removeFirstSpace } from "../../../common/funtions/rejex";

// 🔹 Initial State
const INITIAL_LOCAL_STATE = {
  policyId: null,
  scenario: "",
  consequence: "",
};

export const AdminPoliciesFilter = ({
  setVisible,
  clear,
  setClear,
  maininstrumentName,
  setMaininstrumentName,
}) => {
  const {
    adminGropusAndPolicyPoliciesTabSearch,
    setAdminGropusAndPolicyPoliciesTabSearch,
  } = useSearchBarContext();

  // Local state
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  // -----------------------------------------------------
  // 🔹 EFFECTS
  // -----------------------------------------------------

  /**
   * Prefill Policy ID if passed from parent (mainPolicyId).
   * Useful for quick search-to-filter transition.
   */
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        policyId: maininstrumentName,
      }));
      setClear(false);
      setMaininstrumentName("");
    }
  }, [maininstrumentName]);

  /**
   * Reset filters if `clear` flag is triggered externally.
   */
  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  // 🔹 Helpers
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  // 🔹 Input Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFieldValue(name, removeFirstSpace(value));
  };

  // 🔹 Search Click
  const handleSearchClick = () => {
    const { policyId, scenario, consequence } = localState;
    console.log("policyId", policyId);
    const searchPayload = {
      ...adminGropusAndPolicyPoliciesTabSearch,
      policyId: policyId?.trim() || null,
      scenario: scenario?.trim() || "",
      consequence: consequence?.trim() || "",
      pageNumber: 0,
      filterTrigger: true,
    };
    console.log("policyId", policyId);
    console.log("policyId", searchPayload);
    setAdminGropusAndPolicyPoliciesTabSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  // 🔹 Reset Click
  const handleResetClick = () => {
    const resetPayload = {
      ...adminGropusAndPolicyPoliciesTabSearch,
      policyId: null,
      scenario: "",
      consequence: "",
      pageNumber: 0,
      filterTrigger: true,
    };

    setAdminGropusAndPolicyPoliciesTabSearch(resetPayload);

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  return (
    <>
      {/* Text Fields */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Policy ID"
            name="policyId"
            value={localState.policyId !== null ? localState.policyId : ""}
            onChange={handleInputChange}
            placeholder="Policy ID"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Scenario"
            name="scenario"
            value={localState.scenario}
            onChange={handleInputChange}
            placeholder="Scenario"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={24} lg={24}>
          <TextField
            label="Consequence"
            name="consequence"
            value={localState.consequence}
            onChange={handleInputChange}
            placeholder="Consequence"
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
