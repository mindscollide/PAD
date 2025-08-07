import React, { useState } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./RequestRestrictedModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import RestrictedIcon from "../../../../../../assets/img/Restricted.png";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const RequestRestrictedModal = () => {
  const {
    isEquitiesModalVisible,
    setIsEquitiesModalVisible,
    isTradeRequestRestricted,
    setIsTradeRequestRestricted,
    isSubmit,
    setIsSubmit,
  } = useGlobalModal();

  console.log(isSubmit, isEquitiesModalVisible, "is Coming SubmittedModal");

  const onClickClose = () => {
    setIsTradeRequestRestricted(false);
    setIsEquitiesModalVisible(true);
  };

  return (
    <GlobalModal
      visible={isTradeRequestRestricted}
      centered={true}
      width={"946px"}
      height={"540px"}
      onCancel={() => setIsTradeRequestRestricted(false)}
      modalBody={
        <>
          <div className={styles.RestrictedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates
                  type="TradeRestricted"
                  subheadingClassName={styles.RestrictedTextSubHeading}
                />
              </Col>
            </Row>

            <Row>
              <Col>
                <div className={styles.tagContainer}>
                  <Tag
                    icon={<ExclamationCircleOutlined />}
                    color="warning"
                    className={styles.tagClasses}
                  >
                    Pre-Trade Compliance Checks
                  </Tag>
                  <Tag
                    icon={<ExclamationCircleOutlined />}
                    color="warning"
                    className={styles.tagClasses}
                  >
                    Expiry Rules
                  </Tag>
                  <Tag
                    icon={<ExclamationCircleOutlined />}
                    color="warning"
                    className={styles.tagClasses}
                  >
                    Approval Routing Rules
                  </Tag>
                </div>
              </Col>
            </Row>

            <Row className={styles.mainButtonDiv}>
              <Col>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={onClickClose}
                />
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default RequestRestrictedModal;
