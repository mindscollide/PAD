import React, { useState } from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./ResubmitIntimationModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import ApprovalsIcon from "../../../../../../assets/img/approval-icon.png";

const ResubmitIntimationModal = () => {
  const { resubmitIntimation, setResubmitIntimation } = useGlobalModal();

  const onClickSubmit = () => {
    setResubmitIntimation(false);
  };

  return (
    <GlobalModal
      visible={resubmitIntimation}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setResubmitIntimation(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
              <ModalImgStates type="Resubmitted"/>
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

export default ResubmitIntimationModal;
