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
import { useMyAdmin } from "../../../../../context/AdminContext";

const EditBroker = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { adminBrokerData } = useMyAdmin();

  const { editBrokerModal, setEditBrokerModal, editModalData } =
    useGlobalModal();

  // 🔷 State variables to hold broker details in the form fields
  const [brokerName, setBrokerName] = useState("");
  const [psxCode, setPsxCode] = useState("");

  // 🔷 Error states
  const [brokerNameError, setBrokerNameError] = useState("");
  const [psxCodeError, setPsxCodeError] = useState("");

  // 🔷 Populate form fields when modal data changes (when modal opens with broker info)
  // 🔷 Prefill form on modal open
  useEffect(() => {
    if (editModalData) {
      setBrokerName(editModalData.brokerName || "");
      setPsxCode(editModalData.psxCode || "");
      setBrokerNameError("");
      setPsxCodeError("");
    }
  }, [editModalData]);

  // 🔷 Helpers to check duplicates (excluding current broker)
  const checkDuplicateName = (name) => {
    const trimmed = name.trim().toLowerCase();
    return adminBrokerData?.brokers?.some(
      (b) =>
        b.brokerID !== editModalData.brokerID &&
        b.brokerName.trim().toLowerCase() === trimmed
    );
  };

  const checkDuplicateCode = (code) => {
    const trimmed = code.trim().toLowerCase();
    return adminBrokerData?.brokers?.some(
      (b) =>
        b.brokerID !== editModalData.brokerID &&
        b.psxCode.trim().toLowerCase() === trimmed
    );
  };

  // 🔷 onBlur duplicate checks
  const handleBrokerNameBlur = () => {
    const trimmed = brokerName.trim();
    if (!trimmed) return setBrokerNameError("");

    if (checkDuplicateName(trimmed)) {
      setBrokerNameError("Broker Name already exists");
    } else {
      setBrokerNameError("");
    }
  };

  const handlePsxCodeBlur = () => {
    const trimmed = psxCode.trim();
    if (!trimmed) return setPsxCodeError("");

    if (checkDuplicateCode(trimmed)) {
      setPsxCodeError("PSX Code already exists");
    } else {
      setPsxCodeError("");
    }
  };

  // 🔷 Auto-clear errors if user fixes duplicate while typing
  useEffect(() => {
    if (
      brokerName &&
      brokerNameError &&
      !checkDuplicateName(brokerName.trim())
    ) {
      setBrokerNameError("");
    }
  }, [brokerName, adminBrokerData]);

  useEffect(() => {
    if (psxCode && psxCodeError && !checkDuplicateCode(psxCode.trim())) {
      setPsxCodeError("");
    }
  }, [psxCode, adminBrokerData]);

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

  // ✅ Disable Save button logic
  const isSaveDisabled =
    !brokerName.trim() ||
    !psxCode.trim() ||
    brokerNameError ||
    psxCodeError ||
    checkDuplicateName(brokerName.trim()) ||
    checkDuplicateCode(psxCode.trim());

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
                  onBlur={handleBrokerNameBlur}
                  onChange={(e) => setBrokerName(e.target.value)}
                  maxLength={75}
                  placeholder="Broker Name"
                />{" "}
                {brokerNameError && (
                  <span className={styles.errorText}>{brokerNameError}</span>
                )}
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
                  onBlur={handlePsxCodeBlur}
                  onChange={(e) => setPsxCode(e.target.value)}
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
              disabled={isSaveDisabled}
            />
          </div>
        </div>
      }
    />
  );
};

export default EditBroker;
