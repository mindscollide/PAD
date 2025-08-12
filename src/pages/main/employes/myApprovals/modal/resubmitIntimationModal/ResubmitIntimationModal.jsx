import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./ResubmitIntimationModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const ResubmitIntimationModal = () => {
  //This is the ContextApi Global States for Resubmit Intimation modal
  const { resubmitIntimation, setResubmitIntimation } = useGlobalModal();

  //This is the On click Modal of Resubmit Modal
  const onClickCloseResubmit = () => {
    setResubmitIntimation(false);
  };

  return (
    <GlobalModal
      visible={resubmitIntimation}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setResubmitIntimation(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates type="Resubmitted" />
              </Col>
            </Row>

            <Row className={styles.mainButtonDiv}>
              <Col>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={onClickCloseResubmit}
                />
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default ResubmitIntimationModal;
