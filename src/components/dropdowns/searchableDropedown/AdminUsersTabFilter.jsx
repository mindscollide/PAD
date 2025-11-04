import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { removeFirstSpace } from "../../../common/funtions/rejex";
import { useMyAdmin } from "../../../context/AdminContext";

const INITIAL_LOCAL_STATE = {
  employeeName: "",
  employeeID: "",
  emailAddress: "",
  departmentName: "",
  dateRange: null,
};

export const AdminUsersTabFilter = ({ setVisible, clear, setClear }) => {
  const { setAdminUserSearch, adminUserSearch } = useSearchBarContext();
  const { manageUsersTab } = useMyAdmin();

  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  // -----------------------------------------------------
  // 🔹 EFFECTS
  // -----------------------------------------------------

  useEffect(() => {
    if (clear) {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  // -----------------------------------------------------
  // 🔹 HELPERS
  // -----------------------------------------------------
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFieldValue(name, removeFirstSpace(value));
  };

  // -----------------------------------------------------
  // 🔹 ACTIONS
  // -----------------------------------------------------
  const handleSearchClick = () => {
    const payload = {
      ...adminUserSearch,
      employeeName: localState.employeeName?.trim() || "",
      employeeID: localState.employeeID?.trim() || "",
      emailAddress: localState.emailAddress?.trim() || "",
      departmentName: localState.departmentName?.trim() || "",
      dateRange: localState.dateRange || null,
      pageNumber: 0,
      filterTrigger: true,
    };

    setAdminUserSearch(payload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  const handleResetClick = () => {
    const resetPayload = {
      ...adminUserSearch,
      employeeName: "",
      employeeID: "",
      emailAddress: "",
      departmentName: "",
      dateRange: null,
      pageNumber: 0,
      filterTrigger: true,
    };

    setAdminUserSearch(resetPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  // -----------------------------------------------------
  // 🔹 CONDITIONAL RENDERING OF FIELDS
  // -----------------------------------------------------
  const renderFields = () => {
    switch (manageUsersTab) {
      case "0":
        // Employee Name, Employee ID, Email Address
        return (
          <>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
              <TextField
                label="Employee ID"
                name="employeeID"
                value={localState.employeeID}
                onChange={handleInputChange}
                placeholder="Employee ID"
                size="medium"
                classNames="Search-Field"
              />
            </Col>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
              <TextField
                label="Department Name"
                name="departmentName"
                value={localState.departmentName}
                onChange={handleInputChange}
                placeholder="Department Name"
                size="medium"
                classNames="Search-Field"
              />
            </Col>
          </>
        );

      case "1":
        // Employee Name, Employee ID, Email Address, Department Name, Date Range
        return (
          <>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
              <TextField
                label="Employee ID"
                name="employeeID"
                value={localState.employeeID}
                onChange={handleInputChange}
                placeholder="Employee ID"
                size="medium"
                classNames="Search-Field"
              />
            </Col>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
              <TextField
                label="Department Name"
                name="departmentName"
                value={localState.departmentName}
                onChange={handleInputChange}
                placeholder="Department Name"
                size="medium"
                classNames="Search-Field"
              />
            </Col>
            <Col xs={24} md={12}>
              <DateRangePicker
                label="Date Range"
                value={localState.dateRange}
                onChange={(val) => setFieldValue("dateRange", val)}
                classNames="Search-Field"
              />
            </Col>
          </>
        );

      case "2":
        // Employee Name, Email Address, Department Name
        return (
          <>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
              <TextField
                label="Department Name"
                name="departmentName"
                value={localState.departmentName}
                onChange={handleInputChange}
                placeholder="Department Name"
                size="medium"
                classNames="Search-Field"
              />
            </Col>
          </>
        );

      default:
        return null;
    }
  };

  // -----------------------------------------------------
  // 🔹 RENDER
  // -----------------------------------------------------
  return (
    <>
      <Row gutter={[12, 12]}>{renderFields()}</Row>

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
