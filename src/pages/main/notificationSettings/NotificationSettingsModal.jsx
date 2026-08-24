import React, { useEffect, useState } from "react";
import { Row, Col, Checkbox } from "antd";
import styles from "./NotificationSettingsModal.module.css";
import { GlobalModal } from "../../../components";
import CustomButton from "../../../components/buttons/button";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { useGlobalModal } from "../../../context/GlobalModalContext";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import {
  GetNotificationSettingsRequest,
  SaveNotificationSettingsRequest,
} from "../../../api/notification";
import SavedNotificationSettingsModal from "./modal/savedNotificationSettingsModal/SavedNotificationSettingsModal";
import DiscardNotificationSettingsModal from "./modal/discardNotificationSettingsModal/DiscardNotificationSettingsModal";

// SRS section order: Employee, Line Manager, Compliance Officer, Head of
// Trade Approval, Head of Compliance - matches userRoleID as used
// everywhere else in this app (2=Employee, 3=LM, 4=CO, 5=HTA, 6=HCA).
const ROLE_LABELS = {
  2: "Employee",
  3: "Line Manager",
  4: "Compliance Officer",
  5: "Head of Trade Approval",
  6: "Head of Compliance",
};

/**
 * NotificationSettingsModal
 * --------------------------
 * Per SRS "Notification Settings": one row per notification type the
 * calling user's role(s) get, grouped by role, each with Email/Portal
 * checkboxes. Cancel -> discard-confirmation intimation modal. Save ->
 * persists, then success intimation modal.
 */
const NotificationSettingsModal = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const { notificationSettingsModalOpen, setNotificationSettingsModalOpen } =
    useDashboardContext();

  const {
    showSavedNotificationSettingsModal,
    setShowSavedNotificationSettingsModal,
    discardNotificationSettingsModal,
    setDiscardNotificationSettingsModal,
  } = useGlobalModal();

  // Raw settings as fetched, and the editable local copy the checkboxes
  // actually reflect - kept separate so Cancel can discard edits cleanly
  // without needing a second API round-trip.
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    if (!notificationSettingsModalOpen) return;

    const fetchSettings = async () => {
      showLoader(true);
      const res = await GetNotificationSettingsRequest({
        callApi,
        showNotification,
        showLoader,
        navigate,
      });
      setSettings(res || []);
      showLoader(false);
    };

    fetchSettings();
  }, [notificationSettingsModalOpen]);

  // Groups by userRoleID, preserving the order the backend already sends
  // (per the doc, that's SRS order) - no re-sorting needed here.
  const groupedByRole = settings.reduce((acc, item) => {
    const roleID = item.userRoleID;
    if (!acc[roleID]) acc[roleID] = [];
    acc[roleID].push(item);
    return acc;
  }, {});

  const handleToggle = (notificationSettingTypeID, field, checked) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.notificationSettingTypeID === notificationSettingTypeID
          ? { ...item, [field]: checked }
          : item
      )
    );
  };

  const handleSave = async () => {
    showLoader(true);
    const requestdata = {
      Settings: settings.map((item) => ({
        NotificationSettingTypeID: item.notificationSettingTypeID,
        IsEmailEnabled: item.isEmailEnabled,
        IsPortalEnabled: item.isPortalEnabled,
      })),
    };

    const saved = await SaveNotificationSettingsRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    if (saved) {
      setNotificationSettingsModalOpen(false);
      setShowSavedNotificationSettingsModal(true);
    }
    showLoader(false);
  };

  const handleCancel = () => {
    setNotificationSettingsModalOpen(false);
    setDiscardNotificationSettingsModal(true);
  };

  return (
    <>
      <GlobalModal
        visible={notificationSettingsModalOpen}
        width={"700px"}
        centered={true}
        onCancel={handleCancel}
        modalBody={
          <div className={styles.mainContainer}>
            {/* <Row>
              <Col span={24}> */}
            <div className={styles.heading}>
              <span>Notification Settings</span>
            </div>
            {/* </Col>
            </Row> */}

            <div className={styles.settingsScrollArea}>
              <Row className={styles.columnHeaderRow}>
                <Col span={14} className={styles.columnHeaderLabelLeft}>
                  Notification Type
                </Col>
                <Col span={5} className={styles.columnHeaderLabel}>
                  Email
                </Col>
                <Col span={5} className={styles.columnHeaderLabel}>
                  Portal
                </Col>
              </Row>
              {Object.keys(groupedByRole).length > 0 ? (
                (() => {
                  let rowIndex = 0; // running counter across all roles, for continuous zebra striping
                  return Object.keys(groupedByRole).map((roleID) => (
                    <div key={roleID} className={styles.roleSection}>
                      <div className={styles.roleHeading}>
                        {ROLE_LABELS[roleID] || `Role ${roleID}`}
                      </div>

                      {groupedByRole[roleID].map((item) => {
                        const isEven = rowIndex % 2 === 0;
                        rowIndex += 1;

                        return (
                          <Row
                            key={item.notificationSettingTypeID}
                            className={`${styles.settingRow} ${
                              isEven
                                ? styles.settingRowEven
                                : styles.settingRowOdd
                            }`}
                          >
                            <Col span={14} className={styles.typeName}>
                              {item.typeName}
                            </Col>
                            <Col span={5} className={styles.checkboxCol}>
                              <Checkbox
                                checked={item.isEmailEnabled}
                                onChange={(e) =>
                                  handleToggle(
                                    item.notificationSettingTypeID,
                                    "isEmailEnabled",
                                    e.target.checked
                                  )
                                }
                              />
                            </Col>
                            <Col span={5} className={styles.checkboxCol}>
                              <Checkbox
                                checked={item.isPortalEnabled}
                                onChange={(e) =>
                                  handleToggle(
                                    item.notificationSettingTypeID,
                                    "isPortalEnabled",
                                    e.target.checked
                                  )
                                }
                              />
                            </Col>
                          </Row>
                        );
                      })}
                    </div>
                  ));
                })()
              ) : (
                <div className={styles.emptyState}>
                  No notification types available.
                </div>
              )}
            </div>
          </div>
        }
        modalFooter={
          <div className={styles.mainButtonDiv}>
            <CustomButton
              text={"Cancel"}
              className="big-light-button"
              onClick={handleCancel}
            />
            <CustomButton
              text={"Save"}
              className="big-dark-button"
              onClick={handleSave}
              disabled={settings.length === 0}
            />
          </div>
        }
      />

      {showSavedNotificationSettingsModal && <SavedNotificationSettingsModal />}
      {discardNotificationSettingsModal && <DiscardNotificationSettingsModal />}
    </>
  );
};

export default NotificationSettingsModal;
