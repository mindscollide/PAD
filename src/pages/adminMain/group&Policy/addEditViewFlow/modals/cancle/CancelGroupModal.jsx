// src/components/modals/CancelGroupModal.jsx
import React from "react";
import { Row, Col } from "antd";
import styles from "./CancelGroupModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import { GlobalModal, ModalImgStates } from "../../../../../../components";

const CancelGroupModal = ({
  visible,
  onCancel,
  onContinueEditing,
  onConfirmCancel,
}) => {
  return (
    <GlobalModal
      visible={visible}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={onCancel}
      modalBody={
        <div className={styles.SubmittedCenteralized}>
          <Row>
            <Col>
              <ModalImgStates type="Cancelgroupcreation" />
            </Col>
          </Row>

          <Row gutter={[8, 8]} className={styles.mainButtonDiv}>
            <Col>
              <CustomButton
                text="Continue Editing"
                className="big-light-button"
                onClick={onContinueEditing}
              />
            </Col>
            <Col>
              <CustomButton
                text="Yes, Cancel"
                className="big-dark-button"
                onClick={onConfirmCancel}
              />
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default CancelGroupModal;
