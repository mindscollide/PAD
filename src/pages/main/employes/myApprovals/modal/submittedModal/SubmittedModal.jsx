import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./SubmittedModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const SubmittedModal = ({ isEquitiesModalOpen }) => {
  // This is Global State for modal which is create in ContextApi
  const { isSubmit, setIsSubmit } = useGlobalModal();

  //isEquitiesModalOpen is prop which check if isEquities open the show diff type in ModalImgStates Component

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
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

export default SubmittedModal;
