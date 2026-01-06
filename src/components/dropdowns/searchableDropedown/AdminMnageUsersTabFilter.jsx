import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, DateRangePicker, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { removeFirstSpace } from "../../../common/funtions/rejex";
import { useMyAdmin } from "../../../context/AdminContext";
import { useNotification } from "../../NotificationProvider/NotificationProvider";

// -----------------------------------------------------
// 🔹 INITIAL STATES
// -----------------------------------------------------
const INITIAL_LOCAL_USER_STATE = {
  employeeName: "",
  employeeID: "",
  emailAddress: "",
  departmentName: "",
};

const INITIAL_LOCAL_PENDING_STATE = {
  employeeName: "",
  employeeID: "",
  emailAddress: "",
  departmentName: "",
  startDate: null,
  endDate: null,
};

const INITIAL_LOCAL_REJECTED_STATE = {
  employeeName: "",
  emailAddress: "",
  departmentName: "",
};

export const AdminUsersTabFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const {
    setUsersTabSearch,
    setPendingRequestsTabSearch,
    setRejectedRequestsTabSearch,
  } = useSearchBarContext();

  const { manageUsersTab } = useMyAdmin();
  const { showNotification } = useNotification();

  // -----------------------------------------------------
  // 🔹 STATE
  // -----------------------------------------------------
  const [emailError, setEmailError] = useState("");

  // -----------------------------------------------------
  // 🔹 PICK INITIAL STATE BASED ON TAB
  // -----------------------------------------------------
  const getInitialState = () => {
    switch (manageUsersTab) {
      case "0":
        return INITIAL_LOCAL_USER_STATE;
      case "1":
        return INITIAL_LOCAL_PENDING_STATE;
      case "2":
        return INITIAL_LOCAL_REJECTED_STATE;
      default:
        return INITIAL_LOCAL_USER_STATE;
    }
  };

  const [localState, setLocalState] = useState(getInitialState());

  // -----------------------------------------------------
  // 🔹 EFFECTS
  // -----------------------------------------------------
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        employeeName: maininstrumentName, // ✅ was brokerName before
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
      setLocalState(getInitialState());
      setClear(false); // Reset external clear flag
    }
  }, [clear, manageUsersTab]);

  // -----------------------------------------------------
  // 🔹 HELPERS
  // -----------------------------------------------------
  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFieldValue(name, removeFirstSpace(value));

    // Clear email error while typing
    if (name === "emailAddress") {
      setEmailError("");
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return "Invalid Email Format";
    }
    return "";
  };

  const handleEmailBlur = (e) => {
    const email = e.target.value.trim();
    const error = validateEmail(email);
    setEmailError(error);
  };

  // -----------------------------------------------------
  // 🔹 ACTIONS
  // -----------------------------------------------------
  const handleSearchClick = () => {
    const email = localState.emailAddress?.trim();
    const error = validateEmail(email);

    if (error) {
      setEmailError(error);
      showNotification({
        type: "error",
        title: "Error",
        description: error,
      });
      return;
    }

    const payload = {
      ...localState,
      pageNumber: 0,
      filterTrigger: true,
    };

    if (manageUsersTab === "0") setUsersTabSearch(payload);
    else if (manageUsersTab === "1") setPendingRequestsTabSearch(payload);
    else if (manageUsersTab === "2") setRejectedRequestsTabSearch(payload);

    setVisible(false);
  };

  const handleResetClick = () => {
    const payloadUsersTabSearch = {
      employeeName: "",
      employeeID: "",
      emailAddress: "",
      departmentName: "",
      pageNumber: 0,
      pageSize: 10,
      filterTrigger: true,
    };
    const payloadPendingRequestsTabSearch = {
      employeeName: "",
      employeeID: "",
      emailAddress: "",
      departmentName: "",
      startDate: null,
      endDate: null,
      pageNumber: 0,
      pageSize: 10,
      filterTrigger: true,
    };
    const payloadRejectedRequestsTabSearch = {
      employeeName: "",
      emailAddress: "",
      departmentName: "",
      pageNumber: 0,
      pageSize: 10,
      filterTrigger: true,
    };
    setEmailError("");
    if (manageUsersTab === "0") setUsersTabSearch(payloadUsersTabSearch);
    else if (manageUsersTab === "1")
      setPendingRequestsTabSearch(payloadPendingRequestsTabSearch);
    else if (manageUsersTab === "2")
      setRejectedRequestsTabSearch(payloadRejectedRequestsTabSearch);
    setLocalState(getInitialState());
    setClear(false);
    setVisible(false);
  };

  // -----------------------------------------------------
  // 🔹 CONDITIONAL RENDERING OF FIELDS
  // -----------------------------------------------------
  const renderFields = () => {
    switch (manageUsersTab) {
      case "0":
        return (
          <>
            <Col xs={24} md={12}>
              <TextField
                label="Employee Name"
                name="employeeName"
                value={localState.employeeName}
                onChange={handleInputChange}
                placeholder="Employee Name"
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
                classNames="Search-Field"
              />
            </Col>
            <Col xs={24} md={12}>
              <TextField
                label="Email Address"
                name="emailAddress"
                value={localState.emailAddress}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                placeholder="Email Address"
                classNames="Search-Field"
                error={!!emailError}
                helperText={emailError}
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
        return (
          <>
            <Col xs={24} md={12}>
              <TextField
                label="Employee Name"
                name="employeeName"
                value={localState.employeeName}
                onChange={handleInputChange}
                placeholder="Employee Name"
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
                classNames="Search-Field"
              />
            </Col>
            <Col xs={24} md={12}>
              <DateRangePicker
                label="Date Range"
                value={[localState.startDate, localState.endDate]}
                onChange={(dates) =>
                  setLocalState((prev) => ({
                    ...prev,
                    startDate: dates?.[0] || null,
                    endDate: dates?.[1] || null,
                  }))
                }
                classNames="Search-Field"
              />
            </Col>
          </>
        );

      case "2":
        return (
          <>
            <Col xs={24} md={12}>
              <TextField
                label="Employee Name"
                name="employeeName"
                value={localState.employeeName}
                onChange={handleInputChange}
                placeholder="Employee Name"
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
              disabled={!!localState.emailAddress && !!emailError}
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
