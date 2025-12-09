import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Tooltip } from "antd";
import styles from "./manageBroker.module.css";
import { GlobalModal, BrokersSelect } from "../../../../components";
import CustomButton from "../../../../components/buttons/button";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import EmptyState from "../../../../components/emptyStates/empty-states";
import BlackCrossImg from "../../../../assets/img/BlackCross.png";
import { useNavigate } from "react-router-dom";
import useNotification from "antd/es/notification/useNotification";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { GetAllBrokers, SaveUserBrokers } from "../../../../api/dashboardApi";

const ManageBrokerModal = ({ open }) => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // ----------------- Contexts -----------------
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { setEmployeeBasedBrokersData, employeeBasedBrokersData } =
    useDashboardContext();

  // ----------------- Local States -----------------
  const [allBrokers, setAllBrokers] = useState([]); // all brokers fetched from API
  const [localBrokers, setLocalBrokers] = useState([]); // UI state for My Brokers list
  const [requestData, setRequestData] = useState({ Brokers: [] }); // request payload for API

  // ----------------- Modal Open Effect -----------------
  useEffect(() => {
    if (!open) return;

    const fetchBrokers = async () => {
      try {
        showLoader(true);

        const res = await GetAllBrokers({
          callApi,
          showNotification,
          showLoader,
          navigate,
        });

        if (res) setAllBrokers(res); // update all brokers
      } catch (error) {
        console.error("Error fetching brokers", error);
      } finally {
        showLoader(false);
      }
    };

    if (!hasFetched.current) {
      hasFetched.current = true;

      // Initialize localBrokers for UI
      const initialLocalBrokers = (employeeBasedBrokersData || []).map((b) => ({
        brokerID: b.brokerID,
        brokerName: b.brokerName,
        psxCode: b.psxCode,
        isActive: true,
      }));
      setLocalBrokers(initialLocalBrokers);

      // Initialize requestData
      setRequestData({
        Brokers: (employeeBasedBrokersData || []).map((b) => ({
          brokerid: b.brokerID,
          isActive: true,
        })),
      });

      fetchBrokers();
    }
  }, [open]);
  console.log("localBrokers", localBrokers);
  // ----------------- Handlers -----------------

  // Add broker to both localBrokers (UI) and requestData (API payload)
  const handleAddBroker = (brokerID) => {
    // Find the full broker object from allBrokers
    const broker = allBrokers.find((b) => b.brokerID === brokerID);
    if (!broker) return; // If broker not found, do nothing

    setLocalBrokers((prev) => {
      // Prevent duplicates
      if (prev.some((b) => b.brokerID === broker.brokerID)) return prev;

      const newLocal = [
        ...prev,
        {
          brokerID: broker.brokerID,
          brokerName: broker.brokerName,
          psxCode: broker.psxCode,
          isActive: true,
        },
      ];

      // Also update requestData
      setRequestData((prevRequest) => ({
        Brokers: [
          ...prevRequest.Brokers,
          { brokerid: broker.brokerID, isActive: true },
        ],
      }));

      return newLocal;
    });
  };

  // Remove broker from both localBrokers (UI) and requestData (API payload)
  const handleRemoveBroker = (brokerID) => {
    setLocalBrokers((prev) => prev.filter((b) => b.brokerID !== brokerID));
    setRequestData((prevRequest) => ({
      Brokers: prevRequest.Brokers.filter((b) => b.brokerid !== brokerID),
    }));
  };

  // Submit modal → update global context & send request payload
  const handleSubmit = async () => {


    console.log("handleSubmit", requestData);
    const res = await SaveUserBrokers({
      callApi,
      showNotification,
      showLoader,
      requestData,
      navigate,
    });
    console.log("handleSubmit", res);
    setEmployeeBasedBrokersData(false);
  };

  const isBrokersChanged = (original, current) => {
    if (original.length !== current.length) return true;

    const sortedOriginal = [...original].sort(
      (a, b) => a.brokerID - b.brokerID
    );
    const sortedCurrent = [...current].sort((a, b) => a.brokerID - b.brokerID);

    return !sortedOriginal.every(
      (b, idx) =>
        b.brokerID === sortedCurrent[idx].brokerID &&
        b.isActive === sortedCurrent[idx].isActive
    );
  };

  return (
    <GlobalModal
      visible={open}
      width="600px"
      centered
      onCancel={setEmployeeBasedBrokersData(false)}
      modalBody={
        <div className={styles.MainClassOfApprovals}>
          {/* Modal Heading */}
          <Row>
            <Col>
              <h3 className={styles.approvalHeading}>Manage Brokers</h3>
            </Col>
          </Row>

          {/* Broker Select */}
          <Row className={styles.mt1}>
            <Col span={24}>
              <label className={styles.instrumentLabel}>Search Broker</label>
              <BrokersSelect
                data={allBrokers}
                onSelect={handleAddBroker}
                value={null} // selection handled via Plus button
                disabled={allBrokers.length === 0}
              />
            </Col>
          </Row>

          {/* My Brokers List */}
          <Row className={localBrokers.length > 0 ? "" : styles.mt2}>
            {localBrokers.length > 0 ? (
              <div className={styles.brokersListContainer}>
                <Row className={styles.subHeading}>
                  <Col span={24}>My Brokers</Col>
                </Row>
                {localBrokers.map((broker) => (
                  <Col
                    key={broker.brokerID}
                    span={24}
                    className={styles.brokerRow}
                  >
                    <Tooltip title={broker.brokerName}>
                      <span className={styles.brokerName}>
                        {broker.brokerName.length > 25
                          ? broker.brokerName.slice(0, 25) + "…"
                          : broker.brokerName}
                      </span>
                    </Tooltip>
                    <Tooltip title={broker.psxCode}>
                      <span className={styles.psxCode}>
                        {broker.psxCode.length > 8
                          ? broker.psxCode.slice(0, 8) + "…"
                          : broker.psxCode}
                      </span>
                    </Tooltip>
                    <img
                      src={BlackCrossImg}
                      className={styles.removeIcon}
                      onClick={() => handleRemoveBroker(broker.brokerID)}
                      draggable={false}
                    />
                  </Col>
                ))}
              </div>
            ) : (
              <EmptyState
                type={"employeeBroker"}
                style={{ minHeight: "150px" }}
              />
            )}
          </Row>
        </div>
      }
      modalFooter={
        <div className={styles.mainButtonDiv}>
          <CustomButton
            text="Cancel"
            className="big-light-button"
            onClick={setEmployeeBasedBrokersData(false)}
          />
          <CustomButton
            text={employeeBasedBrokersData.length > 0 ? "Update" : "Save"}
            className="big-dark-button"
            onClick={handleSubmit}
            disabled={
              localBrokers.length === 0 ||
              !isBrokersChanged(employeeBasedBrokersData, localBrokers)
            }
          />
        </div>
      }
    />
  );
};

export default ManageBrokerModal;
