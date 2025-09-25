import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./ApprovedLineManagerModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const ApprovedLineManagerModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    approvedGlobalModal,
    setApprovedGlobalModal,
    setNoteGlobalModal,
    setViewDetailLineManagerModal,
  } = useGlobalModal();

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setApprovedGlobalModal(false);
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailLineManagerModal(false);
  };

  return (
    <GlobalModal
      visible={approvedGlobalModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setApprovedGlobalModal(false)}
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

export default ApprovedLineManagerModal;
