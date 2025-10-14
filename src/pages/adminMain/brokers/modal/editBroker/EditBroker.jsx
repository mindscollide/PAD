import React, { useState, useEffect } from "react";
import { GlobalModal, TextField } from "../../../../../components";
import styles from "./EditBroker.module.css";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../components/buttons/button";
import { Row, Col } from "antd";
import { EditBrokersRequest } from "../../../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";

const EditBroker = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const { editBrokerModal, setEditBrokerModal, editModalData } =
    useGlobalModal();

  // 🔷 State variables to hold broker details in the form fields
  const [brokerName, setBrokerName] = useState("");
  const [psxCode, setPsxCode] = useState("");

  // 🔷 Populate form fields when modal data changes (when modal opens with broker info)
  useEffect(() => {
    if (editModalData) {
      setBrokerName(editModalData.brokerName || "");
      setPsxCode(editModalData.psxCode || "");
    }
  }, [editModalData]);

  // 🔷 Function to call the Edit Broker API
  const fetchEditData = async () => {
    // 🔷 Validate inputs before sending request
    if (!brokerName || !psxCode) return;

    // 🔷 Prepare request payload matching API format
    const requestdata = {
      BrokerID: editModalData.brokerID, // note capital B and I for API
      BrokerName: brokerName,
      PSXCode: psxCode,
    };

    showLoader(true); // 🔷 Show loading indicator

    // 🔷 Call the EditBrokersRequest API helper
    await EditBrokersRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setEditBrokerModal,
      navigate,
    });
  };

  // 🔷 Handler for Save button click
  const handleSave = () => {
    fetchEditData();
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
