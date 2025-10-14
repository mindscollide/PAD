import React, { useState, useEffect } from "react";
import { GlobalModal, TextField } from "../../../../../components";
import styles from "./EditBroker.module.css";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../components/buttons/button";
import { Row, Col } from "antd";

const EditBroker = () => {
  const { editBrokerModal, setEditBrokerModal, editModalData } =
    useGlobalModal();

  const [brokerName, setBrokerName] = useState("");
  const [psxCode, setPsxCode] = useState("");

  useEffect(() => {
    if (editModalData) {
      setBrokerName(editModalData.brokerName || "");
      setPsxCode(editModalData.psxCode || "");
    }
  }, [editModalData]);

  const handleSave = () => {
    if (brokerName && psxCode) {
      // You can call your save logic here
      console.log("Saving edited data:", { brokerName, psxCode });
      setEditBrokerModal(false);
    }
  };

  return (
    <GlobalModal
      visible={editBrokerModal}
      width="902px"
      centered={true}
      onCancel={() => setEditBrokerModal(false)}
      modalBody={
        <div className={styles.modalContainer}>
          <h2 className={styles.Brokertitle}>Edit Broker</h2>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className={styles.inputContainer}>
                <label className={styles.addBrokerorPSXtext}>
                  Broker Name *
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

            <Col span={12}>
              <div className={styles.inputContainer}>
                <label className={styles.addBrokerorPSXtext}>PSX Code *</label>
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
          </Row>

          <div className={styles.saveContainer}>
            <CustomButton
              text="Cancel"
              className="big-light-button"
              onClick={() => setEditBrokerModal(false)}
            />
            <CustomButton
              text="Save"
              className="big-dark-button"
              onClick={handleSave}
              disabled={!brokerName || !psxCode}
            />
          </div>
        </div>
      }
    />
  );
};

export default EditBroker;
