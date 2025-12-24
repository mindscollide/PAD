import React from "react";
import { Col, Row } from "antd";
import styles from "./SaveBrokerModal.module.css";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import CustomButton from "../../../../../../components/buttons/button";

const SaveBrokerModal = () => {
  // This is Global State for modal which is create in ContextApi
  const { showSavedBrokerModal, setShowSaveBrokerModal } = useGlobalModal();

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setShowSaveBrokerModal(false);
  };

  return (
    <GlobalModal
      visible={showSavedBrokerModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setShowSaveBrokerModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates type="savedChangesBrokers" />
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
        </>
      }
    />
  );
};

export default SaveBrokerModal;
