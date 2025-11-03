import React from "react";
import { Row, Col } from "antd";
import CustomButton from "../../../../../../components/buttons/button";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./CreatedGroupModal.module.css";
import { useMyAdmin } from "../../../../../../context/AdminContext";

const CreatedGroupModal = ({ visible, onClose }) => {
  const { pageTypeForAdminGropusAndPolicy } = useMyAdmin();
  return (
    <GlobalModal
      visible={visible}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={onClose}
      modalBody={
        <div className={styles.SubmittedCenteralized}>
          <Row>
            <Col>
              {/* ✅ Use your modal image type for success */}
              <ModalImgStates
                type={
                  pageTypeForAdminGropusAndPolicy === 0
                    ? "GroupCreatedSuccess"
                    : "GroupUpdateSuccess"
                }
              />
            </Col>
          </Row>

          <Row className={styles.mainButtonDiv} gutter={[8, 8]}>
            <Col>
              <CustomButton
                text="Close"
                className="big-light-button"
                onClick={onClose}
              />
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default CreatedGroupModal;
