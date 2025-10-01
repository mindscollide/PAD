import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../../components";
import styles from "./ApproveHeadOfCompliancePortfolioModal.module.css";
import CustomButton from "../../../../../../../components/buttons/button";

const ApproveHeadOfCompliancePortfolioModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    compliantApproveModal,
    setCompliantApproveModal,
    setNoteGlobalModal,
    setViewDetailHeadOfComplianceEscalatedPortfolio,
  } = useGlobalModal();

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setCompliantApproveModal(false);
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailHeadOfComplianceEscalatedPortfolio(false);
  };

  return (
    <GlobalModal
      visible={compliantApproveModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setCompliantApproveModal(false)}
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

export default ApproveHeadOfCompliancePortfolioModal;
