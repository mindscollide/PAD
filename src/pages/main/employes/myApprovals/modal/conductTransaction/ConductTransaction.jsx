import React, { useState } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, TextField } from "../../../../../../components";
import styles from "./ConductTransaction.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import copyIcon from "../../../../../../assets/img/copy-dark.png";

const ConductTransaction = () => {
  const {
    isConductedTransaction,
    setIsConductedTransaction,
    setIsViewDetail,
    setIsSubmit,
  } = useGlobalModal();

  const onCancelTransaction = () => {
    setIsConductedTransaction(false);
    setIsViewDetail(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("compliance@horizoncapital.com");
    message.success("Email copied to clipboard!");
  };

  const onClickSubmit = () => {
    setIsConductedTransaction(false);
    setIsSubmit(true);
  };

  return (
    <>
      <GlobalModal
        visible={isConductedTransaction}
        width={"942px"}
        centered={true}
        onCancel={() => setIsConductedTransaction(false)}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              <Row>
                <Col span={24}>
                  <div className={styles.conductBorderClass}>
                    <label className={styles.conductedHeading}>
                      Conduct Transaction
                    </label>
                  </div>
                </Col>
              </Row>

              <Row
                gutter={[4, 4]}
                style={{
                  marginTop: "16px",
                }}
              >
                <Col span={12}>
                  <div className={styles.backgrounColorOfInstrument}>
                    <label className={styles.viewDetailMainLabels}>
                      Instrument
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      <span className={styles.customTag}>EQ</span> PSO-OCT
                    </label>
                  </div>
                </Col>

                <Col span={12}>
                  <div className={styles.backgrounColorOfApproved}>
                    <label className={styles.viewDetailMainLabels}>
                      Approval ID
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      REQ-001
                    </label>
                  </div>
                </Col>
              </Row>

              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>Type</label>
                    <label className={styles.viewDetailSubLabels}>Buy</label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Approved Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>40,000</label>
                  </div>
                </Col>
              </Row>
              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Request Date
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      2024-10-01
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Asset Class
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      Asset Class{" "}
                    </label>
                  </div>
                </Col>
              </Row>
              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <div className={styles.backgrounColorOfBrokerDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Brokers
                    </label>
                    <div className={styles.tagContainer}>
                      <Tag className={styles.tagClasses}>
                        AKD Securities Limited
                      </Tag>
                      <Tag className={styles.tagClasses}>
                        K-Trade Securities Ltd
                      </Tag>{" "}
                      <Tag className={styles.tagClasses}>
                        Approval Routing Rules
                      </Tag>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row style={{ marginTop: "16px" }}>
                <Col span={6}>
                  <label className={styles.sharedandCompliance}>
                    Shares Traded
                  </label>
                </Col>
                <Col span={18}>
                  <label className={styles.sharedandCompliance}>
                    Compliance Officer
                  </label>
                </Col>
              </Row>
              <Row
                align={"middle"}
                gutter={[20, 20]}
                style={{ marginTop: "3px" }}
              >
                <Col span={6}>
                  <div className={styles.backgrounColorOfConduct}>
                    <label className={styles.viewDetailMainLabels}>
                      Enter Quantity
                    </label>
                    <TextField placeholder={0} size="medium" />
                  </div>
                </Col>
                <Col span={18}>
                  <div className={styles.backgrounColorOfConduct}>
                    <label className={styles.complianceHeading}>
                      Name:
                      <span className={styles.complianceSubHeading}>
                        Ms. Jessica Carter
                      </span>
                    </label>
                    <label className={styles.complianceHeading}>
                      Email:
                      <div className={styles.complianceSubHeading}>
                        compliance@horizoncapital.com
                      </div>
                    </label>
                    <div className={styles.copyEmailConductMainClass}>
                      <img src={copyIcon} onClick={handleCopyEmail} />
                    </div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col span={24}>
                  <>
                    <div className={styles.mainButtonDivClose}>
                      <CustomButton
                        text={"Cancel"}
                        className="big-light-button"
                        onClick={onCancelTransaction}
                      />
                      <CustomButton
                        text={"Submit"}
                        className="big-dark-button"
                        onClick={onClickSubmit}
                      />
                    </div>
                  </>
                </Col>
              </Row>
            </div>
          </>
        }
      />
    </>
  );
};

export default ConductTransaction;
