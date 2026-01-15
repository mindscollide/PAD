import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { removeFirstSpace } from "../../../common/funtions/rejex";
const INITIAL_LOCAL_STATE = {
  employeeName: "",
  departmentName: "",
};
export const HTATATReportsListFilter = ({
  setVisible,
  clear,
  setClear,
  maininstrumentName,
  setMaininstrumentName,
}) => {
  /* ===========================================================================
   * 📌 Context
   * =========================================================================== */
  const { htaTATReportSearch, setHTATATReportSearch } = useSearchBarContext();

  /* ===========================================================================
   * 🧠 Local State (Aligned with Global)
   * =========================================================================== */
  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  /* ===========================================================================
   * 🔄 Effects
   * =========================================================================== */

  // Prefill Instrument Name
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

  // External Clear
  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  /* ===========================================================================
   * 🛠 Handlers
   * =========================================================================== */

  const setFieldValue = (field, value) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFieldValue(name, removeFirstSpace(value));
  };

  /** 🔍 Search */
  const handleSearchClick = () => {
    const { employeeName, departmentName } = localState;

    setHTATATReportSearch({
      ...htaTATReportSearch,
      employeeName: employeeName?.trim() || "",
      departmentName: departmentName?.trim() || "",
      pageNumber: 0,
      filterTrigger: true,
    });

    setVisible(false);
    setClear(false);
  };

  /** ♻️ Reset */
  const handleResetClick = () => {
    setHTATATReportSearch({
      employeeName: "",
      departmentName: "",
      pageNumber: 0,
      pageSize: 10,
      filterTrigger: true,
    });

    setLocalState(INITIAL_LOCAL_STATE);
    setVisible(false);
    setClear(false);
  };

  /* ===========================================================================
   * 🖥 Render
   * =========================================================================== */
  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Employee Name"
            name="employeeName"
            value={localState.employeeName}
            onChange={handleInputChange}
            placeholder="Employee Name"
            size="medium"
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
          />
        </Col>
      </Row>

      <Row justify="end" style={{ marginTop: 16 }}>
        <Col>
          <Space>
            <Button
              text="Reset"
              onClick={handleResetClick}
              className="big-light-button"
            />
            <Button
              text="Search"
              onClick={handleSearchClick}
              className="big-dark-button"
            />
          </Space>
        </Col>
      </Row>
    </>
  );
};
