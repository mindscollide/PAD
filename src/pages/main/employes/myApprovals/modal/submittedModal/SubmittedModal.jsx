import React, { useState } from "react";
import { Col, Row, Select, Space, Button, Checkbox } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import {
  CommenSearchInput,
  GlobalModal,
  InstrumentSelect,
  TextField,
} from "../../../../../../components";
import styles from "./SubmittedModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import ApprovalsIcon from "../../../../../../assets/img/approval-icon.png";

const SubmittedModal = () => {
  const {
    isSubmit,
    setIsSubmit,
    isEquitiesModalVisible,
    setIsEquitiesModalVisible,
  } = useGlobalModal();

  console.log(isSubmit, isEquitiesModalVisible, "is Coming SubmittedModal");

  const onClickSubmit = () => {
    setIsSubmit(false);
    setIsEquitiesModalVisible(true);
  };

  return (
    <GlobalModal
      visible={isSubmit}
      width={"935px"}
      height={"495px"}
      onCancel={() => setIsSubmit(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <img src={ApprovalsIcon} alt="Approval Screen" />
              </Col>
            </Row>
            <Row>
              <Col>
                <div className={styles.SubmittedText}>Submitted!</div>
              </Col>
            </Row>

            <Row>
              <Col>
                <div className={styles.submittedTextSubHeading}>
                  Your approval request has been submitted successfully
                </div>
              </Col>
            </Row>

            <Row className={styles.mainButtonDiv}>
              <Col>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={onClickSubmit}
                />
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default SubmittedModal;
