import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField, DateRangePicker } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";
import { useLocation } from "react-router-dom";

// 🔹 Initial state matching your global state structure
const INITIAL_LOCAL_STATE = {
  employeeName: "",
  departmentName: "",
  pageNumber: 0,
  pageSize: 10,
  filterTrigger: false,
};

export const AdminUserWiseComplianceReportFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const {
    userActivityComplianceReportAdmin,
    setUserActivityComplianceReportAdmin,
    adminTradeApprovalRequestReportSearch,
    setAdminTradeApprovalRequestReportSearch,
    adminTATApprovalRequestReportSearch,
    setAdminTATApprovalRequestReportSearch,
  } = useSearchBarContext();
  const location = useLocation();
  const currentPath = location.pathname;
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  // -----------------------------------------------------
  // 🔹 Effects
  // -----------------------------------------------------

  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        instrumentName: maininstrumentName,
      }));
      setClear(false);
      setMaininstrumentName("");
    }
  }, [maininstrumentName]);

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

    // Remove commas first
    const rawValue = value.replace(/,/g, "");

    if (name === "approvedQuantity" || name === "sharesTraded") {
      // Allow empty or numbers only
      if (rawValue === "" || allowOnlyNumbers(rawValue)) {
        setFieldValue(name, rawValue);
      }
      return;
    }

    setFieldValue(name, removeFirstSpace(value));
  };

  const handleSearchClick = () => {
    const { employeeName, departmentName } = localState;
    const searchPayload = {
      ...(currentPath === "/PAD/admin-reports/admin-user-wise-compliance-report"
        ? adminTradeApprovalRequestReportSearch
        : currentPath === "/PAD/admin-reports/admin-TAT-Request-report"
          ? adminTATApprovalRequestReportSearch
          : userActivityComplianceReportAdmin),
      employeeName: employeeName?.trim() || "",
      departmentName: departmentName?.trim() || "",
      pageNumber: 0,
      filterTrigger: true,
    };
    if (
      currentPath === "/PAD/admin-reports/admin-user-wise-compliance-report"
    ) {
      setAdminTradeApprovalRequestReportSearch(searchPayload);
    } else if (currentPath === "/PAD/admin-reports/admin-TAT-Request-report") {
      setAdminTATApprovalRequestReportSearch(searchPayload);
    } else {
      setUserActivityComplianceReportAdmin(searchPayload);
    }
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  const handleResetClick = () => {
    if (
      currentPath === "/PAD/admin-reports/admin-user-wise-compliance-report"
    ) {
      setAdminTradeApprovalRequestReportSearch((prev) => ({
        ...prev,
        employeeName: "",
        departmentName: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (currentPath === "/PAD/admin-reports/admin-TAT-Request-report") {
      setAdminTATApprovalRequestReportSearch((prev) => ({
        ...prev,
        employeeName: "",
        departmentName: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      setUserActivityComplianceReportAdmin((prev) => ({
        ...prev,
        employeeName: "",
        departmentName: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
    }

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  // -----------------------------------------------------
  // 🔹 Render
  // -----------------------------------------------------
  return (
    <>
      {/* ROW 1: Department & Employee Name */}
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
            label="Department Name"
            name="departmentName"
            value={localState.departmentName}
            onChange={handleInputChange}
            placeholder="Department Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ACTION ROW */}
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
