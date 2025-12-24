import React, { useEffect, useState } from "react";
import { Row, Col, Space } from "antd";
import { Button, TextField } from "../..";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  allowOnlyNumbers,
  removeFirstSpace,
} from "../../../common/funtions/rejex";

// 🔹 Initial local state
const INITIAL_LOCAL_STATE = {
  instrumentNameSearch: "",
  requesterNameSearch: "",
  quantitySearch: "",
};

export const COTransactionReportViewDetailsFilter = ({
  setVisible,
  maininstrumentName,
  setMaininstrumentName,
  clear,
  setClear,
}) => {
  const {
    coTransactionsSummarysReportsViewDetailsSearch,
    setCOTransactionsSummarysReportsViewDetailSearch,
  } = useSearchBarContext();

  const [localState, setLocalState] = useState(INITIAL_LOCAL_STATE);

  useEffect(() => {
    if (maininstrumentName) {
      setLocalState((prev) => ({
        ...prev,
        instrumentNameSearch: maininstrumentName,
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

    if (name === "quantitySearch") {
      const rawValue = value.replace(/,/g, "");
      if (
        (rawValue === "" || allowOnlyNumbers(rawValue)) &&
        rawValue.length <= 12
      ) {
        setFieldValue(name, rawValue);
      }
    } else {
      setFieldValue(name, removeFirstSpace(value));
    }
  };

  const handleSearchClick = () => {
    const { instrumentNameSearch, requesterNameSearch, quantitySearch } = localState;

    const payload = {
      ...coTransactionsSummarysReportsViewDetailsSearch,
      instrumentNameSearch: instrumentNameSearch.trim(),
      requesterNameSearch: requesterNameSearch.trim(),
      quantitySearch: quantitySearch ? Number(quantitySearch) :"",
      pageNumber: 0,
      filterTrigger: true,
    };

    setCOTransactionsSummarysReportsViewDetailSearch(payload);
    setLocalState(INITIAL_LOCAL_STATE);
    setClear(false);
    setVisible(false);
  };

  const handleResetClick = () => {
    setCOTransactionsSummarysReportsViewDetailSearch((prev) => ({
      ...prev,
      instrumentNameSearch: "",
      requesterNameSearch: "",
      quantitySearch: "",
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
      {/* ROW 1: Instrument Name & Employee Name */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <TextField
            label="Instrument Name"
            name="instrumentNameSearch"
            value={localState.instrumentNameSearch}
            onChange={handleInputChange}
            placeholder="Enter instrument name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>

        <Col xs={24} md={12}>
          <TextField
            label="Employee Name"
            name="requesterNameSearch"
            value={localState.requesterNameSearch}
            onChange={handleInputChange}
            placeholder="Enter employee name"
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
            name="quantitySearch"
            value={
              localState.quantitySearch
                ? Number(localState.quantitySearch).toLocaleString("en-US")
                : ""
            }
            onChange={handleInputChange}
            placeholder="Enter quantitySearch"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
      </Row>

      {/* ACTION BUTTONS */}
      <Row justify="end" style={{ marginTop: 16 }}>
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
