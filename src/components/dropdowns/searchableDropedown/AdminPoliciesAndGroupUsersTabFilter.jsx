import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { removeFirstSpace } from "../../../common/funtions/rejex";
import { useNotification } from "../../NotificationProvider/NotificationProvider";

// 🔹 Initial Local State
const INITIAL_LOCAL_STATE = {
  employeeName: "",
  designation: "",
  departmentName: "",
  emailAddress: "",
};

export const AdminPoliciesAndGroupUsersTabFilter = ({
  setVisible,
  clear,
  setClear,
  maininstrumentName,
  setMaininstrumentName,
}) => {
  const {
    adminGropusAndPolicyUsersTabSearch,
    setAdminGropusAndPolicyUsersTabSearch,
  } = useSearchBarContext();
  const { showNotification } = useNotification();

  // Local State for Inputs
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  // -----------------------------------------------------
  // 🔹 EFFECTS
  // -----------------------------------------------------
  console.log("searchMain", maininstrumentName);
  // Prefill from global search if exists
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        employeeName: maininstrumentName,
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

  // -----------------------------------------------------
  // 🔹 Handlers
  // -----------------------------------------------------

  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFieldValue(name, removeFirstSpace(value));
  };

  // 🔹 Search Click
  const handleSearchClick = () => {
    const { employeeName, designation, departmentName, emailAddress } =
      localState;
    const email = emailAddress?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ✅ If email is filled but invalid → stop search
    if (email && !emailRegex.test(email)) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return; // ❌ stop execution
    }
    const searchPayload = {
      ...adminGropusAndPolicyUsersTabSearch,
      employeeName: employeeName?.trim() || "",
      designation: designation?.trim() || "",
      departmentName: departmentName?.trim() || "",
      emailAddress: emailAddress?.trim() || "",
      employeeID: 0,
      filterTrigger: true,
      pageNumber: 0,
      pageSize: 10,
    };

    setAdminGropusAndPolicyUsersTabSearch(searchPayload);

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  // 🔹 Reset Click
  const handleResetClick = () => {
    const resetPayload = {
      ...adminGropusAndPolicyUsersTabSearch,
      employeeName: "",
      designation: "",
      departmentName: "",
      emailAddress: "",
      employeeID: 0,
      filterTrigger: true,
      pageNumber: 0,
      pageSize: 10,
    };

    setAdminGropusAndPolicyUsersTabSearch(resetPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  // -----------------------------------------------------
  // 🔹 RENDER
  // -----------------------------------------------------
  return (
    <>
      {/* First Row */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Employee Name"
            name="employeeName"
            value={localState.employeeName}
            onChange={handleInputChange}
            placeholder="Employee Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Designation"
            name="designation"
            value={localState.designation}
            onChange={handleInputChange}
            placeholder="Designation"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* Second Row */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Department"
            name="departmentName"
            value={localState.departmentName}
            onChange={handleInputChange}
            placeholder="Department"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <TextField
            label="Email Address"
            name="emailAddress"
            value={localState.emailAddress}
            onChange={handleInputChange}
            placeholder="Email Address"
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
              text="Reset"
              className="big-light-button"
              onClick={handleResetClick}
            />
            <Button
              text="Search"
              className="big-dark-button"
              onClick={handleSearchClick}
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
