import React, { useState } from "react";
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

  // 🔷 Modal control states from global context
  const {
    addNewBrokerModal,
    setAddNewBrokerModal,
    setAddBrokerConfirmationModal,
  } = useGlobalModal();

  // 🔷 State for the broker name input
  const [brokerName, setBrokerName] = useState("");

  // 🔷 State for the PSX code input
  const [psxCode, setPsxCode] = useState("");

  // 🔷 State to hold the list of brokers added before saving
  const [brokers, setBrokers] = useState([]);

  // 🔷 Error state of brokerName and psxCode while adding
  const [brokerNameError, setBrokerNameError] = useState("");
  const [psxCodeError, setPsxCodeError] = useState("");

  // 🔷 Adds a new broker to the list if inputs are valid and clears inputs afterward
  const handleAddBroker = () => {
    let hasError = false;

    // Reset errors before validating
    setBrokerNameError("");
    setPsxCodeError("");

    // Check for duplicate broker name
    const nameExists = brokers.some(
      (broker) =>
        broker.brokerName.toLowerCase() === brokerName.trim().toLowerCase()
    );

    // Check for duplicate PSX code
    const codeExists = brokers.some(
      (broker) => broker.psxCode.toLowerCase() === psxCode.trim().toLowerCase()
    );

    if (nameExists) {
      setBrokerNameError("Broker Name already exists");
      hasError = true;
    }

    if (codeExists) {
      setPsxCodeError("PSX Code already exists");
      hasError = true;
    }

    // If there's any duplicate, stop adding
    if (hasError) return;

    // Add if no errors
    setBrokers([...brokers, { brokerName, psxCode }]);
    setBrokerName("");
    setPsxCode("");
  };

  // 🔷 Removes a broker from the list by index
  const handleRemoveBroker = (index) => {
    const updated = [...brokers];
    updated.splice(index, 1);
    setBrokers(updated);
  };

  // 🔷 Calls the API to save the broker list
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

  // 🔷 Triggered when Save button is clicked to call the API function
  const onClickOnSaveButton = () => {
    fetchSaveData();
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
                    maxLength={9}
                    placeholder="PSX Code"
                  />
                  {psxCodeError && (
                    <span className={styles.errorText}>{psxCodeError}</span>
                  )}
                  <span className={styles.counterTextAddBroker}>
                    {psxCode.length}/9
                  </span>
                </div>
              </Col>
              <Col span={3} className={styles.addButtonCol}>
                <CustomButton
                  text={"Add"}
                  className={"addBroker-small-dark-button"}
                  disabled={!brokerName || !psxCode}
                  onClick={handleAddBroker}
                />
              </Col>
            </Row>

            <div className={styles.tableHeader}>
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
                  />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.saveContainer}>
            <CustomButton
              text={"Save"}
              className={"big-dark-button"}
              onClick={onClickOnSaveButton}
              disabled={brokers.length === 0}
            />
          </div>
        </>
      }
    />
  );
};

export default AddNewBroker;
