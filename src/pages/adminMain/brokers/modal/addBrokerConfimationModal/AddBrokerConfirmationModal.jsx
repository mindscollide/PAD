import React from "react";
import { Col, Row } from "antd";
import styles from "./AddBrokerConfirmationModal.module.css";
import CustomButton from "../../../../../components/buttons/button";
import { GlobalModal } from "../../../../../components";
import ModalImgStates from "../../../../../components/modalImageStates/modalImgStates";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { useSidebarContext } from "../../../../../context/sidebarContaxt";

const AddBrokerConfirmationModal = ({ isEquitiesModalOpen }) => {
  const { selectedKey } = useSidebarContext();
  console.log(selectedKey, "selectedKeyselectedKey");
  // This is Global State for modal which is create in ContextApi
  const { addBrokerConfirmationModal, setAddBrokerConfirmationModal } =
    useGlobalModal();

  //isEquitiesModalOpen is prop which check if isEquities open the show diff type in ModalImgStates Component

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    setAddBrokerConfirmationModal(false);
  };

  return (
    <GlobalModal
      visible={addBrokerConfirmationModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setAddBrokerConfirmationModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates type={"addBroker"} />
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

export default AddBrokerConfirmationModal;
