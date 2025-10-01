import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./ApprovedHeadOfApprovalModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const ApprovedHeadOfApprovalModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    headApprovalNoteModal,
    setHeadApprovalNoteModal,
    setNoteGlobalModal,
    setViewDetailsHeadOfApprovalModal,
  } = useGlobalModal();

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setHeadApprovalNoteModal(false);
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailsHeadOfApprovalModal(false);
  };

  return (
    <GlobalModal
      visible={headApprovalNoteModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setHeadApprovalNoteModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates type={"Approved"} />
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

export default ApprovedHeadOfApprovalModal;
