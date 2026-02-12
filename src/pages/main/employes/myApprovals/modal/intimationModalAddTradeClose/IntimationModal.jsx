import React from "react";
import { Col, Row } from "antd";
import styles from "./IntimationModal.module.css";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../../components/buttons/button";
import { GlobalModal } from "../../../../../../components";
import PoliciesTabIcon from "../../../../../../assets/img/Group-creation-cancle.png";

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
              <img draggable={false} src={PoliciesTabIcon} alt="urgent" />
            </Row>
            <Row>
              <Col>
                <p className={styles.SubmittedTextHeading}>Discard Changes</p>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className={styles.SubmittedTextDiscription}>
                  All the changes you've made will be lost. Are you sure you
                  want to discard them?
                </p>
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
                className="big-dark-button"
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
