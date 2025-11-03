import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../../components";
import styles from "./DeclinedHeadOfCompliancePortfolioModal.module.css";
import CustomButton from "../../../../../../../components/buttons/button";

const DeclinedHeadOfCompliancePortfolioModal = () => {
  // This is Global State for modal which is create in ContextApi
  const { nonCompliantDeclineModal, setNonCompliantDeclineModal } =
    useGlobalModal();

  // onClick Function on Close Button
  const onClickClose = () => {
    setNonCompliantDeclineModal(false);
  };

  return (
    <GlobalModal
      visible={nonCompliantDeclineModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setNonCompliantDeclineModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates
                  type={"NonCompliant"}
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

export default DeclinedHeadOfCompliancePortfolioModal;
