import React from "react";
import { Col, Row } from "antd";
import styles from "./IntimationModal.module.css";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../../components/buttons/button";
import { GlobalModal } from "../../../../../../components";

const IntimationTradeApprovalModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    addTradeApprovalIntimationModal,
    setAddTradeApprovalIntimationModal,
    setIsEquitiesModalVisible,
  } = useGlobalModal();

  //isEquitiesModalOpen is prop which check if isEquities open the show diff type in ModalImgStates Component

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setAddTradeApprovalIntimationModal(false);
    setIsEquitiesModalVisible(true);
  };

  const onClickYes = () => {
    setAddTradeApprovalIntimationModal(false);
    setIsEquitiesModalVisible(false);
  };

  return (
    <GlobalModal
      visible={addTradeApprovalIntimationModal}
      width={"635px"}
      centered={true}
      onCancel={() => setAddTradeApprovalIntimationModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <p className={styles.SubmittedText}>Are You Sure You Close ?</p>
              </Col>
            </Row>

            <div className={styles.mainButtonDiv}>
              <CustomButton
                text={"Cancel"}
                className="big-light-button"
                onClick={onClickCloseSubmit}
              />{" "}
              <CustomButton
                text={"Yes"}
                className="big-light-button"
                onClick={onClickYes}
              />
            </div>
          </div>
        </>
      }
    />
  );
};

export default IntimationTradeApprovalModal;
