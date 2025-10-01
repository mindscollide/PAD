import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../../components";
import styles from "./NonCompliantPortdolioDeclineModal.module.css";
import CustomButton from "../../../../../../../components/buttons/button";

const NonCompliantPortdolioDeclineModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    nonCompliantPortfolioDeclineModal,
    setNonCompliantPortfolioDeclineModal,
    setNoteGlobalModal,
    setViewDetailPortfolioTransaction,
  } = useGlobalModal();

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setNonCompliantPortfolioDeclineModal(false);
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailPortfolioTransaction(false);
  };

  return (
    <GlobalModal
      visible={nonCompliantPortfolioDeclineModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setNonCompliantPortfolioDeclineModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates
                  type={"NonCompliant"}
                  headingClassName={styles.nonCOmpliantcolor}
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

export default NonCompliantPortdolioDeclineModal;
