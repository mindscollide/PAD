import React from "react";
import { Col, Row } from "antd";
import styles from "./intimation.module.css";
import { GlobalModal, ModalImgStates } from "../../../../components";
import CustomButton from "../../../../components/buttons/button";

const Intimationmodal = ({
  flag = false,
  openModal,
  setOpenModal,
  onClickYesSubmit,
  onClickCloseSubmit,
}) => {


  return (
    <GlobalModal
      visible={openModal}
      width="935px"
      height="495px"
      centered
      onCancel={() => setOpenModal(false)}
      modalBody={
        <div className={styles.SubmittedCenteralized}>
          <Row justify="center" align="middle" style={{ height: "100%" }}>
            <Col style={{ textAlign: "center" }}>
              <ModalImgStates
                type={flag ? "SystemConfigurationSaved" : "Discard"}
                headingClassName={styles.nonCOmpliantcolor}
              />
            </Col>
          </Row>

          <Row
            justify="center"
            align="middle"
            className={styles.mainButtonDiv}
            gutter={[20, 0]} // adds spacing between buttons
          >
            <Col>
              <CustomButton
                text="Close"
                className="big-light-button"
                onClick={onClickCloseSubmit}
              />
            </Col>
            {!flag && (
              <Col>
                <CustomButton
                  text="Yes"
                  className="big-dark-button"
                  onClick={onClickYesSubmit}
                />
              </Col>
            )}
          </Row>
        </div>
      }
    />
  );
};

export default Intimationmodal;
