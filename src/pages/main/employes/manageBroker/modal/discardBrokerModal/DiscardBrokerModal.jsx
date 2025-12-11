import React from "react";
import { Col, Row } from "antd";
import styles from "./DiscardBrokerModal.module.css";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import CustomButton from "../../../../../../components/buttons/button";

const DiscardBrokerModal = () => {
  // This is Global State for modal which is create in ContextApi
  const { discardChangesBrokerModal, setDiscardChangesBrokerModal } =
    useGlobalModal();

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setDiscardChangesBrokerModal(false);
  };

  return (
    <GlobalModal
      visible={discardChangesBrokerModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setDiscardChangesBrokerModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates type="Discard" />
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

export default DiscardBrokerModal;
