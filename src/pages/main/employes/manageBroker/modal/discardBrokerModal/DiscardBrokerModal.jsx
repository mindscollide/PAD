import React from "react";
import { Col, Row } from "antd";
import styles from "./DiscardBrokerModal.module.css";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import CustomButton from "../../../../../../components/buttons/button";
import { useSidebarContext } from "../../../../../../context/sidebarContaxt";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

const DiscardBrokerModal = () => {
  const { selectedKey } = useSidebarContext();


  // This is Global State for modal which is create in ContextApi
  const { discardChangesBrokerModal, setDiscardChangesBrokerModal } =
    useGlobalModal();

  const { manageBrokersModalOpen, setManageBrokersModalOpen } =
    useDashboardContext();

  // onClick Function on Close Button
  const onClickCloseSubmit = () => {
    if (Number(selectedKey) === 0) {
      setDiscardChangesBrokerModal(false);
      setManageBrokersModalOpen(true);
    } else {
      setDiscardChangesBrokerModal(false);
    }
  };

  return (
    <GlobalModal
      visible={discardChangesBrokerModal}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={() => setDiscardChangesBrokerModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates type="Discard" />
              </Col>
            </Row>

            <Row className={styles.mainButtonDiv} gutter={(16, 16)}>
              <Col>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={onClickCloseSubmit}
                />
              </Col>
              {Number(selectedKey) === 0 && (
                <Col>
                  <CustomButton
                    text={"Yes"}
                    className="big-dark-button"
                    onClick={() => setDiscardChangesBrokerModal(false)}
                  />
                </Col>
              )}
            </Row>
          </div>
        </>
      }
    />
  );
};

export default DiscardBrokerModal;
