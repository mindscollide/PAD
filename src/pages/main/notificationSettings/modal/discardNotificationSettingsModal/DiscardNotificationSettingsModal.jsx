import React from "react";
import { Col, Row } from "antd";
import styles from "./DiscardNotificationSettingsModal.module.css";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../components";
import CustomButton from "../../../../../components/buttons/button";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";

/**
 * DiscardNotificationSettingsModal
 * ----------------------------------
 * Per SRS: on Cancel from Notification Settings modal.
 * - "Close" -> close this confirmation, keep the user on Notification
 *   Settings modal (their unsaved edits are still there - the parent
 *   modal never lost its local `settings` state, it was just hidden).
 * - "Yes" -> close this confirmation, discard the changes, return to the
 *   previous screen (Notification Settings modal stays closed).
 */
const DiscardNotificationSettingsModal = () => {
  const { discardNotificationSettingsModal, setDiscardNotificationSettingsModal } =
    useGlobalModal();

  const { setNotificationSettingsModalOpen } = useDashboardContext();

  const onClickClose = () => {
    setDiscardNotificationSettingsModal(false);
    setNotificationSettingsModalOpen(true);
  };

  const onClickYes = () => {
    setDiscardNotificationSettingsModal(false);
  };

  return (
    <GlobalModal
      visible={discardNotificationSettingsModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={onClickClose}
      modalBody={
        <div className={styles.SubmittedCenteralized}>
          <Row>
            <Col>
              <ModalImgStates type="Discard" />
            </Col>
          </Row>

          <Row className={styles.mainButtonDiv} gutter={(16, 16)}>
            <Col>
              <CustomButton
                text={"Close"}
                className="big-light-button"
                onClick={onClickClose}
              />
            </Col>
            <Col>
              <CustomButton
                text={"Yes"}
                className="big-dark-button"
                onClick={onClickYes}
              />
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default DiscardNotificationSettingsModal;
