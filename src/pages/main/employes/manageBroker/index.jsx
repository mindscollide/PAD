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
import {
  GetAllBrokers,
  SaveUserBrokers,
  GetAllEmployeeBrokers,
} from "../../../../api/dashboardApi";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import SaveBrokerModal from "./modal/saveBrokerModal/SaveBrokerModal";
import DiscardBrokerModal from "./modal/discardBrokerModal/DiscardBrokerModal";

/**
 * ManageBrokerModal
 * ------------------
 * Allows the user to:
 * - View their assigned brokers
 * - Add new brokers
 * - Remove brokers
 * - Save updates to backend API
 */

const ManageBrokerModal = ({ open }) => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // ---------------------- Contexts ----------------------
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const {
    showSavedBrokerModal,
    setShowSaveBrokerModal,
    discardChangesBrokerModal,
    setDiscardChangesBrokerModal,
  } = useGlobalModal();

  const {
    setEmployeeBasedBrokersData,
    employeeBasedBrokersData,
    manageBrokersModalOpen,
    setManageBrokersModalOpen,
  } = useDashboardContext();

  // ---------------------- Local States ----------------------
  const [allBrokers, setAllBrokers] = useState([]); // All brokers from API
  const [localBrokers, setLocalBrokers] = useState([]); // Selected brokers in UI
  const [requestData, setRequestData] = useState({ Brokers: [] }); // Payload for API

  console.log(manageBrokersModalOpen, "manageBrokersModalOpen");

  // ---------------------- Fetch & Initialize ----------------------
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

        if (res) setAllBrokers(res);

        // Always re-initialize from latest context
        const initialList = (employeeBasedBrokersData || []).map((b) => ({
          brokerID: b.brokerID,
          brokerName: b.brokerName,
          psxCode: b.psxCode,
          isActive: true,
        }));

        setLocalBrokers(initialList);

        setRequestData({
          Brokers: initialList.map((b) => ({
            brokerid: b.brokerID,
            isActive: true,
          })),
        });
      } catch (error) {
        console.error("Error fetching brokers", error);
      } finally {
        showLoader(false);
      }
    };

    fetchBrokers();
  }, [open]); // 👈 EVERY TIME MODAL OPENS

  // ---------------------- Handlers ----------------------

  /**
   * Adds a selected broker to local list and request payload.
   */
  const handleAddBroker = (brokerID) => {
    const broker = allBrokers.find((b) => b.brokerID === brokerID);
    if (!broker) return;

    setLocalBrokers((prev) => {
      if (prev.some((b) => b.brokerID === brokerID)) return prev;

      const updated = [
        ...prev,
        {
          brokerID: broker.brokerID,
          brokerName: broker.brokerName,
          psxCode: broker.psxCode,
          isActive: true,
        },
      ];

      setRequestData((prevReq) => ({
        Brokers: [
          ...prevReq.Brokers,
          { brokerid: broker.brokerID, isActive: true },
        ],
      }));

      return updated;
    });
  };

  /**
   * Removes selected broker from UI list & API payload.
   */
  const handleRemoveBroker = (brokerID) => {
    const existsInOriginal = employeeBasedBrokersData.some(
      (b) => b.brokerID === brokerID
    );

    if (existsInOriginal) {
      // 🔹 Case 1: Broker existed originally → mark inactive
      setLocalBrokers((prev) =>
        prev.map((b) =>
          b.brokerID === brokerID ? { ...b, isActive: false } : b
        )
      );

      setRequestData((prevReq) => {
        const updated = prevReq.Brokers.filter((b) => b.brokerid !== brokerID);

        // Push updated inactive state
        updated.push({
          brokerid: brokerID,
          isActive: false,
        });

        return { Brokers: updated };
      });
    } else {
      // 🔹 Case 2: Broker newly added → remove completely
      setLocalBrokers((prev) => prev.filter((b) => b.brokerID !== brokerID));

      setRequestData((prevReq) => ({
        Brokers: prevReq.Brokers.filter((b) => b.brokerid !== brokerID),
      }));
    }
  };

  /**
   * Save → API → Update context → Close Modal
   */
  const handleSubmit = async () => {
    showLoader(true);
    const res = await SaveUserBrokers({
      callApi,
      showNotification,
      showLoader,
      requestData,
      setShowSaveBrokerModal,
      navigate,
    });

    if (res) {
      const updatedList = await GetAllEmployeeBrokers({
        callApi,
        showNotification,
        showLoader,
        navigate,
      });

      setEmployeeBasedBrokersData(updatedList);
      setAllBrokers([]); // All brokers from API
      setLocalBrokers([]); // Selected brokers in UI
      setRequestData({ Brokers: [] }); // Payload for API
      hasFetched.current = false;
      showLoader(false);
      setManageBrokersModalOpen(false);
    }
    showLoader(false);
  };

  /**
   * Detects if brokers list has changed.
   */
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

  const activeBrokers = localBrokers.filter(
    (broker) => broker.isActive !== false
  );

  console.log(activeBrokers, "activeBrokersactiveBrokers");
  // ---------------------- UI ----------------------

  return (
    <>
      <GlobalModal
        visible={open}
        width="600px"
        centered
        onCancel={() => setManageBrokersModalOpen(false)}
        modalBody={
          <div className={styles.MainClassOfApprovals}>
            {/* Header */}
            <Row>
              <Col>
                <h3 className={styles.approvalHeading}>Manage Brokers</h3>
              </Col>
            </Row>

            {/* Broker Search */}
            <Row className={styles.mt1}>
              <Col span={24}>
                <label className={styles.instrumentLabel}>Search Broker</label>
                <BrokersSelect
                  data={allBrokers}
                  onSelect={handleAddBroker}
                  value={null}
                  disabled={allBrokers.length === 0}
                />
              </Col>
            </Row>

            {/* Broker List */}
            <Row className={localBrokers.length > 0 ? "" : styles.mt2}>
              {activeBrokers.length > 0 ? (
                <div className={styles.brokersListContainer}>
                  <Row className={styles.subHeading}>
                    <Col span={24}>My Brokers</Col>
                  </Row>

                  {localBrokers
                    .filter((broker) => broker.isActive !== false) // hide inactive brokers
                    .map((broker) => (
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
                <div className={styles.emptyBrokerImage}>
                  <EmptyState
                    type="employeeBroker"
                    style={{
                      minHeight: "300px",
                    }}
                  />
                </div>
              )}
            </Row>
          </div>
        }
        modalFooter={
          <div className={styles.mainButtonDiv}>
            {/* Cancel */}
            <CustomButton
              text="Cancel"
              className="big-light-button"
              onClick={() => {
                setManageBrokersModalOpen(false);
                setDiscardChangesBrokerModal(true);
              }}
            />

            {/* Save / Update */}
            <CustomButton
              text={employeeBasedBrokersData.length > 0 ? "Update" : "Save"}
              className="big-dark-button"
              onClick={handleSubmit}
              disabled={
                localBrokers.length === 0 ||
                activeBrokers.length === 0 ||
                !isBrokersChanged(employeeBasedBrokersData, localBrokers)
              }
            />
          </div>
        }
      />

      {showSavedBrokerModal && <SaveBrokerModal />}

      {/* To show Discard Modal */}
      {discardChangesBrokerModal && <DiscardBrokerModal />}
    </>
  );
};

export default ManageBrokerModal;
