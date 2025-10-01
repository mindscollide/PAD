import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../../components";
import styles from "./CompliantPortfolioApproveModal.module.css";
import CustomButton from "../../../../../../../components/buttons/button";

const CompliantPortfolioApproveModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    compliantPortfolioApproveModal,
    setCompliantPortfolioApproveModal,
    setNoteGlobalModal,
    setViewDetailPortfolioTransaction,
  } = useGlobalModal();

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setCompliantPortfolioApproveModal(false);
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailPortfolioTransaction(false);
  };

  return (
    <GlobalModal
      visible={compliantPortfolioApproveModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setCompliantPortfolioApproveModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates type={"Compliant"} />
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

export default CompliantPortfolioApproveModal;
