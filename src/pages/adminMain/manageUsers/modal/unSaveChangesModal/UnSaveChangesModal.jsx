import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../components";
import styles from "./UnSaveChangesModal.module.css";
import CustomButton from "../../../../../components/buttons/button";

const UnSaveChangesModal = () => {
  //This is the ContextApi Global States for Resubmit Intimation modal
  const { unSavedChangesPoliciesModal, setUnSavedChangesPoliciesModal } =
    useGlobalModal();

  return (
    <GlobalModal
      visible={unSavedChangesPoliciesModal}
      width={"815px"}
      height={"319px"}
      centered={true}
      onCancel={() => setUnSavedChangesPoliciesModal(false)}
      modalBody={
        <>
          <div className={styles.unSaveChangesModal}>
            <Row>
              <Col>
                <ModalImgStates
                  type="unSaveChanges"
                  headingClassName={styles.unSaveChangeHeading}
                />
              </Col>
            </Row>

            <Row justify="end" className={styles.footerActions}>
              {" "}
              <CustomButton
                text={"Leave Without Saving"}
                className="big-light-button"
              />
              <CustomButton text={"Save Changes"} className="big-dark-button" />
            </Row>
          </div>
        </>
      }
    />
  );
};

export default UnSaveChangesModal;
