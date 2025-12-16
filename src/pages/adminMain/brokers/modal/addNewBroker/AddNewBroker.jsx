import React, { useState, useEffect, useMemo } from "react";
import { Col, Row } from "antd";
import { useApi } from "../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { AddBrokersRequest } from "../../../../../api/adminApi";
import { GlobalModal, TextField } from "../../../../../components";
import BlackCrossImg from "../../../../../assets/img/BlackCross.png";
import CustomButton from "../../../../../components/buttons/button";
import styles from "./addNewBroker.module.css";

const AddNewBroker = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const {
    addNewBrokerModal,
    setAddNewBrokerModal,
    setAddBrokerConfirmationModal,
  } = useGlobalModal();

  const [brokerName, setBrokerName] = useState("");
  const [psxCode, setPsxCode] = useState("");
  const [brokers, setBrokers] = useState([]);

  const [brokerNameError, setBrokerNameError] = useState("");
  const [psxCodeError, setPsxCodeError] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null, // "brokerName" | "psxCode"
    direction: "asc",
  });
  // ✅ Duplicate check helpers
  const checkDuplicateName = (name) =>
    brokers.some(
      (b) => b.brokerName.trim().toLowerCase() === name.trim().toLowerCase()
    );

  const checkDuplicateCode = (code) =>
    brokers.some(
      (b) => b.psxCode.trim().toLowerCase() === code.trim().toLowerCase()
    );

  // ✅ Handle broker name blur
  const handleBrokerNameBlur = () => {
    const trimmed = brokerName.trim();
    if (!trimmed) return setBrokerNameError("");

    if (checkDuplicateName(trimmed)) {
      setBrokerNameError("Broker Name already exists");
    } else {
      setBrokerNameError("");
    }
  };

  // ✅ Handle PSX code blur
  const handlePsxCodeBlur = () => {
    const trimmed = psxCode.trim();
    if (!trimmed) return setPsxCodeError("");

    if (checkDuplicateCode(trimmed)) {
      setPsxCodeError("PSX Code already exists");
    } else {
      setPsxCodeError("");
    }
  };

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sorted brokers list
  const sortedBrokers = useMemo(() => {
    if (!sortConfig.key) return brokers;

    return [...brokers]
      .map((broker, originalIndex) => ({ ...broker, originalIndex }))
      .sort((a, b) => {
        const aVal = a[sortConfig.key].toLowerCase();
        const bVal = b[sortConfig.key].toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [brokers, sortConfig]);

  // ✅ Auto-clear error text while typing if user fixes the duplicate
  useEffect(() => {
    if (
      brokerName &&
      brokerNameError &&
      !checkDuplicateName(brokerName.trim())
    ) {
      setBrokerNameError("");
    }
  }, [brokerName, brokers]);

  useEffect(() => {
    if (psxCode && psxCodeError && !checkDuplicateCode(psxCode.trim())) {
      setPsxCodeError("");
    }
  }, [psxCode, brokers]);

  // ✅ Add broker
  const handleAddBroker = () => {
    const trimmedName = brokerName.trim();
    const trimmedCode = psxCode.trim();

    if (!trimmedName || !trimmedCode) return;

    if (checkDuplicateName(trimmedName)) {
      setBrokerNameError("Broker Name already exists");
      return;
    }

    if (checkDuplicateCode(trimmedCode)) {
      setPsxCodeError("PSX Code already exists");
      return;
    }

    setBrokers([...brokers, { brokerName: trimmedName, psxCode: trimmedCode }]);
    setBrokerName("");
    setPsxCode("");
    setBrokerNameError("");
    setPsxCodeError("");
  };

  // ✅ Remove broker
  const handleRemoveBroker = (index) => {
    const updated = [...brokers];
    updated.splice(index, 1);
    setBrokers(updated);
  };

  // ✅ Disable Add button if any error or duplicate exists
  const isAddDisabled =
    !brokerName.trim() ||
    !psxCode.trim() ||
    brokerNameError ||
    psxCodeError ||
    checkDuplicateName(brokerName.trim()) ||
    checkDuplicateCode(psxCode.trim());

  // ✅ Save to API
  const fetchSaveData = async () => {
    if (brokers.length === 0) return;

    showLoader(true);
    const requestdata = {
      BrokerList: brokers.map(({ brokerName, psxCode }) => ({
        BrokerName: brokerName,
        PSXCode: psxCode,
      })),
    };

    await AddBrokersRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setAddNewBrokerModal,
      setAddBrokerConfirmationModal,
      navigate,
    });
  };

  return (
    <GlobalModal
      visible={addNewBrokerModal}
      width={"1200px"}
      centered={true}
      onCancel={() => setAddNewBrokerModal(false)}
      modalBody={
        <>
          <div className={styles.modalContainer}>
            <h2 className={styles.Brokertitle}>Add Broker</h2>

            <Row gutter={[16, 16]}>
              <Col span={14}>
                <div className={styles.inputContainer}>
                  <label className={styles.addBrokerorPSXtext}>
                    Add Broker Name *
                  </label>
                  <TextField
                    type="text"
                    value={brokerName}
                    onChange={(e) => setBrokerName(e.target.value)}
                    onBlur={handleBrokerNameBlur}
                    maxLength={75}
                    placeholder="Broker Name"
                  />
                  {brokerNameError && (
                    <span className={styles.errorText}>{brokerNameError}</span>
                  )}
                  <span className={styles.counterTextAddBroker}>
                    {brokerName.length}/75
                  </span>
                </div>
              </Col>

              <Col span={7}>
                <div className={styles.inputContainer}>
                  <label className={styles.addBrokerorPSXtext}>
                    Add PSX Code *
                  </label>
                  <TextField
                    type="text"
                    value={psxCode}
                    onChange={(e) => setPsxCode(e.target.value)}
                    onBlur={handlePsxCodeBlur}
                    maxLength={10}
                    placeholder="PSX Code"
                  />
                  {psxCodeError && (
                    <span className={styles.errorText}>{psxCodeError}</span>
                  )}
                  <span className={styles.counterTextAddBroker}>
                    {psxCode.length}/10
                  </span>
                </div>
              </Col>

              <Col span={3} className={styles.addButtonCol}>
                <CustomButton
                  text={"Add"}
                  className={"addBroker-small-dark-button"}
                  onClick={handleAddBroker}
                  disabled={isAddDisabled}
                />
              </Col>
            </Row>

            {/* <div className={styles.tableHeader}>
              <span className={styles.brokerHeaderName}>Broker Name ↓</span>
              <span className={styles.brokerHeaderName}>PSX Code ↓</span>
              <span></span>
            </div>

            <div className={styles.brokerList}>
              {brokers.map((broker, index) => (
                <div className={styles.brokerRow} key={index}>
                  <span className={styles.brokerRowtext}>
                    {broker.brokerName}
                  </span>
                  <span className={styles.brokerRowtext}>{broker.psxCode}</span>
                  <img
                    src={BlackCrossImg}
                    className={styles.deleteButton}
                    onClick={() => handleRemoveBroker(index)}
                    draggable={false}
                  />
                </div>
              ))}
            </div> */}
            <div className={styles.tableHeader}>
              <span
                className={styles.brokerHeaderName}
                onClick={() => handleSort("brokerName")}
                style={{ cursor: "pointer" }}
              >
                Broker Name{" "}
                {sortConfig.key === "brokerName"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : "↓"}
              </span>

              <span
                className={styles.brokerHeaderName}
                onClick={() => handleSort("psxCode")}
                style={{ cursor: "pointer" }}
              >
                PSX Code{" "}
                {sortConfig.key === "psxCode"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : "↓"}
              </span>

              <span></span>
            </div>
            <div className={styles.brokerList}>
              {sortedBrokers.map((broker) => (
                <div className={styles.brokerRow} key={broker.originalIndex}>
                  <span className={styles.brokerRowtext}>
                    {broker.brokerName}
                  </span>

                  <span className={styles.brokerRowtext}>{broker.psxCode}</span>

                  <img
                    src={BlackCrossImg}
                    className={styles.deleteButton}
                    onClick={() => handleRemoveBroker(broker.originalIndex)}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.saveContainer}>
            <CustomButton
              text={"Save"}
              className={"big-dark-button"}
              onClick={fetchSaveData}
              disabled={brokers.length === 0}
            />
          </div>
        </>
      }
    />
  );
};

export default AddNewBroker;
