import React, { useEffect } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";
import repeat from "../../../../../../assets/img/repeat.png";
import ApprovedResubmit from "../../../../../../assets/img/ApprovedResubmit.png";
import DeclinedResubmit from "../../../../../../assets/img/DeclinedResubmite.png";

import {
  dashBetweenApprovalAssets,
  formatNumberWithCommas,
} from "../../../../../../commen/funtions/rejex";

const ViewDetailModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailLineManagerModal,
    setViewDetailLineManagerModal,
    roughStateOfViewDetail,
    setNoteGlobalModal,
    setApprovedGlobalModal,
    setViewCommentGlobalModal,
  } = useGlobalModal();

  console.log(roughStateOfViewDetail, "roughStateOfViewDetail");

  // To show Note Modal when Click on Declined in ViewDetailLineManager Modal
  const onClickToOpenNoteModal = () => {
    setViewDetailLineManagerModal(false);
    setNoteGlobalModal(true);
  };

  // To open Approved Modal when Click on Approved Button in ViewDetailLineManager Modal
  const onClickToOpenApprovedModal = () => {
    setViewDetailLineManagerModal(false);
    setApprovedGlobalModal(true);
  };

  // To open View Comment Line Maneger Modal by click on View COmment button
  const onClickViewCommentModal = () => {
    setViewDetailLineManagerModal(false);
    setViewCommentGlobalModal(true);
  };

  return (
    <>
      <GlobalModal
        visible={viewDetailLineManagerModal}
        width={"942px"}
        centered={true}
        onCancel={() => setViewDetailLineManagerModal(false)}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              {/* Show Heading by Status in View Detail Modal */}
              <Row>
                <Col span={24}>
                  <div
                    className={
                      roughStateOfViewDetail.status === "Approved"
                        ? styles.approvedBorderClass
                        : roughStateOfViewDetail.status === "Declined"
                        ? styles.declinedBorderClass
                        : styles.pendingBorderClass
                    }
                  >
                    {/* This will show when Pending will be Resubmit */}
                    {roughStateOfViewDetail.status === "Resubmit" && (
                      <>
                        <div>
                          <img src={repeat} className={styles.pendingIcon} />
                        </div>
                      </>
                    )}

                    {/* This will show when Approved will be Resubmit */}
                    {/* {roughStateOfViewDetail.status === "Approved" && (
                      <>
                        <div>
                          <img
                            src={ApprovedResubmit}
                            className={styles.pendingIcon}
                          />
                        </div>
                      </>
                    )} */}

                    {/* This will show when Declined will be Resubmit */}
                    {/* {roughStateOfViewDetail.status === "Declined" && (
                      <>
                        <div>
                          <img
                            src={DeclinedResubmit}
                            className={styles.pendingIcon}
                          />
                        </div>
                      </>
                    )} */}

                    <label
                      className={
                        roughStateOfViewDetail.status === "Approved"
                          ? styles.approvedDetailHeading
                          : roughStateOfViewDetail.status === "Declined"
                          ? styles.declinedDetailHeading
                          : styles.pendingDetailHeading
                      }
                    >
                      {roughStateOfViewDetail.status === "Approved"
                        ? "Approved"
                        : roughStateOfViewDetail.status === "Declined"
                        ? "Declined"
                        : "Pending"}
                    </label>
                  </div>
                </Col>
              </Row>

              {/* Show Approved Status Scenario in View Details Modal */}
              {/* {statusData.label === "Approved" && (
                <>
                  <Row style={{ marginTop: "5px" }}>
                    <Col span={24}>
                      <div
                        className={
                          styles.backgroundColorOfInstrumentDetailApproved
                        }
                      >
                        <label className={styles.viewDetailMainLabels}>
                          Instrument
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          <span className={styles.customTag}>EQ</span> PSO-OCT
                        </label>
                      </div>
                    </Col>
                  </Row>
                </>
              )} */}

              {/* Show Resubmit,Pending,Declined and Not Traded status Sceanrios */}

              <Row
                gutter={[4, 4]}
                style={{
                  marginTop: "13px",
                }}
              >
                <Col span={24}>
                  <div
                    className={styles.backgroundColorOfInstrumentDetailApproved}
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Instrument
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      <>
                        <span className={styles.customTag}>
                          {/* Extract an assetTypeID id which is 1 then show Equity(EQ) */}
                          <span>EQ</span>
                        </span>
                        <span
                          className={styles.viewDetailSubLabelsForInstrument}
                        >
                          PSO-OCT
                        </span>
                      </>
                    </label>
                  </div>
                </Col>
              </Row>

              <Row
                gutter={[4, 4]}
                style={{
                  marginTop: "3px",
                }}
              >
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Requester Name
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      James Miller
                    </label>
                  </div>
                </Col>

                {roughStateOfViewDetail.status === "Resubmit" ? (
                  // When status is Approved and Declined Resubmitted
                  // roughStateOfViewDetail.status === "Approved"
                  // roughStateOfViewDetail.status === "Declined"
                  <>
                    <Col span={6}>
                      <div className={styles.backgrounColorOfDetail}>
                        <label className={styles.viewDetailMainLabels}>
                          Approval ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          {dashBetweenApprovalAssets("REQ709")}
                        </label>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className={styles.backgrounColorOfDetail}>
                        {/* You can duplicate or modify the content here as needed */}
                        <label className={styles.viewDetailMainLabels}>
                          Previous req ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          <u style={{ color: "#30426a", cursor: "pointer" }}>
                            {dashBetweenApprovalAssets("REQ709")}
                          </u>
                        </label>
                      </div>
                    </Col>
                  </>
                ) : (
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Approval ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets("REQ709")}
                      </label>
                    </div>
                  </Col>
                )}
              </Row>

              {/* Show Other Scenario's SUb Heading and Field Sceanrio's */}
              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>Type</label>
                    <label className={styles.viewDetailSubLabels}>
                      {/* {selectedViewDetail?.type} */}
                      Buy
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {/* {selectedViewDetail?.quantity} */}
                      {formatNumberWithCommas("40000")}
                    </label>
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

              {/* This is the Stepper Libarary Section */}
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
                          <div className={styles.customtitle}>
                            Emily Johnson
                          </div>
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

              {/* All Others button Scenario's for footer button */}
              <Row>
                {roughStateOfViewDetail.status === "Approved" ||
                roughStateOfViewDetail.status === "Declined" ? (
                  <>
                    <Col span={[24]}>
                      <div className={styles.approvedButtonClassViewComment}>
                        <CustomButton
                          text={"View Comment"}
                          className="big-light-button"
                          onClick={onClickViewCommentModal}
                        />
                        <CustomButton
                          text={"Close"}
                          onClick={() => setViewDetailLineManagerModal(false)}
                          className="big-light-button"
                        />
                      </div>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col>
                      <div className={styles.approvedButtonClass}>
                        <CustomButton
                          text={"Decline"}
                          onClick={onClickToOpenNoteModal}
                          className="Decline-dark-button"
                        />
                        <CustomButton
                          text={"Approve"}
                          onClick={onClickToOpenApprovedModal}
                          className="Approved-dark-button"
                        />
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </div>
          </>
        }
      />
    </>
  );
};

export default ViewDetailModal;
