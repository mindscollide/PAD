import React, { useState } from "react";
import { GlobalModal, TextField } from "../../../../../components";
import styles from "./addNewBroker.module.css";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../components/buttons/button";
import BlackCrossImg from "../../../../../assets/img/BlackCross.png";
import { Col, Row } from "antd";

const AddNewBroker = () => {
  const [brokerName, setBrokerName] = useState("");
  const [psxCode, setPsxCode] = useState("");
  const [brokers, setBrokers] = useState([]);
  const { addNewBrokerModal, setAddNewBrokerModal } = useGlobalModal();

  const handleAddBroker = () => {
    if (brokerName && psxCode) {
      setBrokers([...brokers, { brokerName, psxCode }]);
      setBrokerName("");
      setPsxCode("");
    }
  };

  const handleRemoveBroker = (index) => {
    const updated = [...brokers];
    updated.splice(index, 1);
    setBrokers(updated);
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
                  <span className={styles.counterTextAddBroker}>
                    {psxCode.length}/9
                  </span>
                </div>
              </Col>
              <Col span={3} className={styles.addButtonCol}>
                <CustomButton
                  text={"Add"}
                  className={"addBroker-small-dark-button"}
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
              disabled={!brokerName || !psxCode}
            />
          </div>
        </>
      }
    />
  );
};

export default AddNewBroker;
