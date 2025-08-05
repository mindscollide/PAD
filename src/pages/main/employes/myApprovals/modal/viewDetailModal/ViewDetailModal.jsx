import React, { useState } from "react";
import { Col, Row, Tag, Steps, Typography } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";

import { CheckCircleFilled, EllipsisOutlined } from "@ant-design/icons";
const ViewDetailModal = () => {
  const { isViewDetail, setIsViewDetail } = useGlobalModal();

  return (
    <GlobalModal
      visible={isViewDetail}
      width={"942px"}
      onCancel={() => setIsViewDetail(false)}
      modalHeader={<></>}
      modalBody={
        <>
          <div className={styles.modalBodyWrapper}>
            <Row>
              <Col span={24}>
                <div className={styles.borderClassViewDetail}>
                  <label className={styles.pendingDetailHeading}>Pending</label>
                </div>
              </Col>
            </Row>

            <Row gutter={[4, 4]} style={{ marginTop: "16px" }}>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Instrument
                  </label>
                  <label className={styles.viewDetailSubLabels}>PSO-OCT</label>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Approval ID
                  </label>
                  <label className={styles.viewDetailSubLabels}>REQ-001</label>
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
                    Quantity
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
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>Brokers</label>
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

            <Row>
              <div className={styles.backgrounColorOfStepper}>
                <Stepper
                  activeStep={2}
                  connectorStyleConfig={{
                    activeColor: "#00640A", // green line between steps
                    completedColor: "#00640A",
                    disabledColor: "#00640A",
                    size: 1,
                  }}
                  styleConfig={{
                    size: "2em",
                    circleFontSize: "0px", // hide default number
                    labelFontSize: "17px",
                    borderRadius: "50%",
                    
                  }}
                >
                  {[0, 1, 2].map((step, index) => (
                    <Step
                      key={index}
                      label={
                        <div className={styles.customlabel}>
                          <div className={styles.customtitle}>
                            Emily Johnson
                          </div>
                          <div className={styles.customdesc}>
                            2024-10-01 | 05:30pm
                          </div>
                        </div>
                      }
                      children={
                        <div className={styles.stepCircle}>
                          <img
                            src={CheckIcon}
                            alt="check"
                            className={styles.circleImg}
                          />
                        </div>
                      }
                    />
                  ))}

                  <Step
                    label={
                      <div className={styles.customlabel}>
                        <div className={styles.customtitle}>Emily Johnson</div>
                        <div className={styles.customdesc}>Pending</div>
                      </div>
                    }
                    children={
                      <div className={styles.stepCircle}>
                        <img
                          src={EllipsesIcon}
                          className={styles.circleImg}
                          alt="ellipsis"
                        />
                      </div>
                    }
                  />
                </Stepper>
              </div>
            </Row>

            <Row className={styles.mainButtonDivClose}>
              <Col>
                <CustomButton text={"Close"} className="big-light-button" />
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default ViewDetailModal;
