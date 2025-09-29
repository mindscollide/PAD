import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../../components";
import styles from "./NonCompliantDeclineModal.module.css";
import CustomButton from "../../../../../../../components/buttons/button";

const NonCompliantDeclineModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    nonCompliantDeclineModal,
    setNonCompliantDeclineModal,
    setNoteGlobalModal,
  } = useGlobalModal();

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setNonCompliantDeclineModal(false);
    setNoteGlobalModal({ visible: false, action: null });
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

export default NonCompliantDeclineModal;
