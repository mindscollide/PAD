import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

/* ---------------------------------------
   🔹 Local Initial State (ONLY REQUIRED)
---------------------------------------- */
const INITIAL_LOCAL_STATE = {
  instrumentName: "",
  employeeName: "",
  quantity: "",
};

export const HOCTransactionReportViewDetailsFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const { setHOCTransactionsSummarysReportsViewDetailSearch } =
    useSearchBarContext();

  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  /* ---------------------------------------
     🔹 Effects
  ---------------------------------------- */

  // Set instrument name coming from outside (chip / click)
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

  // Clear local state when external clear triggered
  useEffect(() => {
    if (clear && maininstrumentName === "") {
      setLocalState(INITIAL_LOCAL_STATE);
      setClear(false);
    }
  }, [clear]);

  /* ---------------------------------------
     🔹 Handlers
  ---------------------------------------- */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Quantity: numbers only + max length
    if (name === "quantity") {
      const rawValue = value.replace(/,/g, "");
      if (
        (rawValue === "" || allowOnlyNumbers(rawValue)) &&
        rawValue.length <= 12
      ) {
        setLocalState((prev) => ({ ...prev, quantity: rawValue }));
      }
      return;
    }

    // Text fields
    setLocalState((prev) => ({
      ...prev,
      [name]: removeFirstSpace(value),
    }));
  };

  /* ---------------------------------------
     🔹 Search
  ---------------------------------------- */
  const handleSearchClick = () => {
    const { instrumentName, employeeName, quantity } = localState;

    setHOCTransactionsSummarysReportsViewDetailSearch((prev) => ({
      ...prev,
      instrumentName: instrumentName?.trim() || "",
      employeeName: employeeName?.trim() || "",
      quantity: quantity ? Number(quantity) : "",
      pageNumber: 0,
      filterTrigger: true,
    }));

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  /* ---------------------------------------
     🔹 Reset
  ---------------------------------------- */
  const handleResetClick = () => {
    setHOCTransactionsSummarysReportsViewDetailSearch((prev) => ({
      ...prev,
      instrumentName: "",
      employeeName: "",
      quantity: "",
      pageNumber: 0,
      filterTrigger: true,
    }));

    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  /* ---------------------------------------
     🔹 Render
  ---------------------------------------- */
  return (
    <>
      {/* ROW 1: Instrument Name & Employee Name */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Instrument Name"
            name="instrumentName"
            value={localState.instrumentName}
            onChange={handleInputChange}
            placeholder="Instrument Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

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
      </Row>

      {/* ROW 2: Quantity */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Quantity"
            name="quantity"
            value={
              localState.quantity
                ? Number(localState.quantity).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Quantity"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ACTION BUTTONS */}
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
