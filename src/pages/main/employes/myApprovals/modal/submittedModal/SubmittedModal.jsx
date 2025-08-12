import React, { useState } from "react";
import { Col, Row, Select, Space, Button, Checkbox } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import {
  CommenSearchInput,
  GlobalModal,
  InstrumentSelect,
  ModalImgStates,
  TextField,
} from "../../../../../../components";
import styles from "./SubmittedModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";
// import ApprovalsIcon from "../../../../../../assets/img/approval-icon.png";
import EmptyState from "../../../../../../components/emptyStates/empty-states";

const SubmittedModal = ({ isEquitiesModalOpen }) => {
  const { isSubmit, setIsSubmit } = useGlobalModal();

  const onClickSubmit = () => {
    setIsSubmit(false);
  };

  return (
    <GlobalModal
      visible={isSubmit}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setIsSubmit(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates
                  type={isEquitiesModalOpen ? "EquitiesSubmitted" : "Submitted"}
                />
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
