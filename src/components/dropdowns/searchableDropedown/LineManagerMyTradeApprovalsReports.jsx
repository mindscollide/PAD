import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

// 🔹 Initial default state
const INITIAL_LOCAL_STATE = {
  employeeName: "",
  departmentName: "",
  startDate: null,
  endDate: null,
};

export const LineManagerMyTradeApprovalsReports = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  // Contexts
  const {
    myTradeApprovalReportLineManageSearch,
    setMyTradeApprovalReportLineManageSearch,
  } = useSearchBarContext();

  // Local form state
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  // -----------------------------------------------------
  // 🔹 EFFECTS
  // -----------------------------------------------------

  /**
   * Prefill employee name if passed from parent (maininstrumentName - a
   * generic prop name reused across this app's screens, most of which
   * search on instrument name; this screen repurposes it for employee
   * name instead).
   *
   * FIXED (API_Changes/2026-09-11_lm_trade_approval_report_search_bar_
   * not_triggering_fe_notes.md): this used to only pre-fill the modal's
   * own employeeName field, with no call to
   * setMyTradeApprovalReportLineManageSearch and no filterTrigger - so
   * typing in the top search bar produced no visible change in the list
   * at all until the user separately opened this modal and clicked its
   * own Search button. Now fires the same search
   * handleSearchClick would, immediately.
   */
  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        employeeName: maininstrumentName,
      }));

      setMyTradeApprovalReportLineManageSearch((prev) => ({
        ...prev,
        employeeName: maininstrumentName,
        pageNumber: 0,
        filterTrigger: true,
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
  // 🔹 Handlers
  // -----------------------------------------------------

  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  /** Input change handler */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      const rawValue = value.replace(/,/g, "");
      if (
        (rawValue === "" || allowOnlyNumbers(rawValue)) &&
        rawValue.length <= 12
      ) {
        setFieldValue("quantity", rawValue);
      }
    } else {
      setFieldValue(name, removeFirstSpace(value));
    }
  };

  /** Search click */
  const handleSearchClick = () => {
    const { employeeName, departmentName } = localState;

    const searchPayload = {
      ...myTradeApprovalReportLineManageSearch,
      employeeName: employeeName?.trim() || "",
      departmentName: departmentName?.trim() || "",
      pageNumber: 0,
      filterTrigger: true,
    };

    setMyTradeApprovalReportLineManageSearch(searchPayload);
    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /** Reset click */
  const handleResetClick = () => {
    setMyTradeApprovalReportLineManageSearch((prev) => ({
      ...prev,
      employeeName: "",
      departmentName: "",
      pageNumber: 0,
      filterTrigger: true,
    }));

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  // -----------------------------------------------------
  // 🔹 Render
  // -----------------------------------------------------

  return (
    <>
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
