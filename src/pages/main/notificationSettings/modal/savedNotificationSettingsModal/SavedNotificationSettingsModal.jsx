import React from "react";
import { Col, Row } from "antd";
import styles from "./SavedNotificationSettingsModal.module.css";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../components";
import CustomButton from "../../../../../components/buttons/button";

const SavedNotificationSettingsModal = () => {
  const {
    showSavedNotificationSettingsModal,
    setShowSavedNotificationSettingsModal,
  } = useGlobalModal();

  const onClickCloseSubmit = () => {
    setShowSavedNotificationSettingsModal(false);
  };

  return (
    <GlobalModal
      visible={showSavedNotificationSettingsModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={onClickCloseSubmit}
      modalBody={
        <div className={styles.SubmittedCenteralized}>
          <Row>
            <Col>
              <ModalImgStates type="savedNotificationSettings" />
            </Col>
          </Row>

          <Row className={styles.mainButtonDiv}>
            <Col>
              <CustomButton
                text={"Close"}
                className="big-light-button"
                onClick={onClickCloseSubmit}
              />
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default SavedNotificationSettingsModal;
