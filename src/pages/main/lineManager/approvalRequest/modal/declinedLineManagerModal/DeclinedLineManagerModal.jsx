import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./DeclinedLineManagerModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const DeclinedLineManagerModal = () => {
  // This is Global State for modal which is create in ContextApi
  const { declinedGlobalModal, setDeclinedGlobalModal } = useGlobalModal();

  // onClick Function on Close Button
  const onClickClose = () => {
    setDeclinedGlobalModal(false);
  };

  return (
    <GlobalModal
      visible={declinedGlobalModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setDeclinedGlobalModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates
                  type={"Declined"}
                  headingClassName={styles.Declined}
                />
              </Col>
            </Row>

            <Row className={styles.mainButtonDiv}>
              <Col>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={onClickClose}
                />
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default DeclinedLineManagerModal;
