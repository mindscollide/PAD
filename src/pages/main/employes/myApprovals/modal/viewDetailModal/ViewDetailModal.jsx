import React from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";

const ViewDetailModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    isViewDetail,
    setIsViewDetail,
    selectedViewDetail,
    setIsViewComments,
    setIsConductedTransaction,
    setIsResubmitted,
  } = useGlobalModal();

  // This is the Status Which is I'm getting from the selectedViewDetail contextApi state
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return {
          label: "Pending",
          labelClassName: styles.pendingDetailHeading,
          divClassName: styles.pendingBorderClass,
        };
      case "Approved":
        return {
          label: "Approved",
          labelClassName: styles.approvedDetailHeading,
          divClassName: styles.approvedBorderClass,
        };
      case "Not Traded":
        return {
          label: "Not Traded",
          labelClassName: styles.notTradedDetailHeading,
          divClassName: styles.notTradedBorderClass,
        };
      case "Resubmitted":
        return {
          label: "Resubmitted",
          labelClassName: styles.resubmittedDetailHeading,
          divClassName: styles.resubmittedBorderClass,
        };
      case "Declined":
        return {
          label: "Declined",
          labelClassName: styles.declinedDetailHeading,
          divClassName: styles.declinedBorderClass,
        };
      default:
        return {
          label: "Detail",
          labelClassName: styles.defaultDetailHeading,
          divClassName: styles.defaultBorderClass,
        };
    }
  };

  //This is how I can pass the status in statusData Variables
  const statusData = getStatusStyle(selectedViewDetail?.status);

  // To Show View Comments Modal and Closed Declined Modal
  const onClickViewModal = () => {
    setIsViewDetail(false);
    setIsViewComments(true);
  };

  // To Show Modal by click on Conduct Transaction in Approved status
  const onClickOfConductTransaction = () => {
    setIsViewDetail(false);
    setIsConductedTransaction(true);
  };

  //To Close View modal on Pending Status
  const onClickPendingClose = () => {
    setIsViewDetail(false);
  };

  //To Open Modal and close viewDetail modal by clicking on resubmit button in Not Traded status
  const onClickResubmitInNotTradedStatus = () => {
    setIsViewDetail(false);
    setIsResubmitted(true);
  };

  return (
    <>
      <GlobalModal
        visible={isViewDetail}
        width={"942px"}
        centered={true}
        onCancel={() => setIsViewDetail(false)}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              {/* Show Heading by Status in View Detail Modal */}
              <Row>
                <Col span={24}>
                  <div className={statusData.divClassName}>
                    <label className={statusData.labelClassName}>
                      {statusData.label}
                    </label>
                  </div>
                </Col>
              </Row>

              {/* Show Approved Status Scenario in View Details Modal */}
              {statusData.label === "Approved" && (
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
              )}

              {/* Show Resubmit,Pending,Declined and Not Traded status Sceanrios */}
              <Row
                gutter={[4, 4]}
                style={{
                  marginTop:
                    statusData.label === "Pending" ||
                    statusData.label === "Resubmitted" ||
                    statusData.label === "Declined" ||
                    statusData.label === "Not Traded"
                      ? "16px"
                      : "3px",
                }}
              >
                <Col span={12}>
                  <div
                    className={
                      statusData.label === "Pending" ||
                      statusData.label === "Resubmitted" ||
                      statusData.label === "Declined" ||
                      statusData.label === "Not Traded"
                        ? styles.backgrounColorOfInstrumentDetail
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      {statusData.label === "Approved"
                        ? "Time Remaining to Trade"
                        : "Instrument"}
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {statusData.label === "Approved" ? (
                        <>{selectedViewDetail?.timeRemaining}</>
                      ) : (
                        <>
                          <span className={styles.customTag}>EQ</span>{" "}
                          {selectedViewDetail?.instrument}
                        </>
                      )}
                    </label>
                  </div>
                </Col>

                {statusData.label === "Resubmitted" ? (
                  <>
                    <Col span={6}>
                      <div
                        className={
                          statusData.label === "Pending" ||
                          statusData.label === "Declined"
                            ? styles.backgrounColorOfApprovalDetail
                            : styles.backgrounColorOfDetail
                        }
                      >
                        <label className={styles.viewDetailMainLabels}>
                          Approval ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          REQ-001
                        </label>
                      </div>
                    </Col>
                    <Col span={6}>
                      {/* You can render some other related info here */}
                      <div
                        className={
                          statusData.label === "Pending" ||
                          statusData.label === "Resubmitted"
                            ? styles.backgrounColorOfApprovalDetail
                            : styles.backgrounColorOfDetail
                        }
                      >
                        <label className={styles.viewDetailMainLabels}>
                          Tracking ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          <u>REQ-002</u>
                        </label>
                      </div>
                    </Col>
                  </>
                ) : (
                  <Col span={12}>
                    <div
                      className={
                        statusData.label === "Pending" ||
                        statusData.label === "Not Traded"
                          ? styles.backgrounColorOfApprovalDetail
                          : styles.backgrounColorOfDetail
                      }
                    >
                      <label className={styles.viewDetailMainLabels}>
                        Approval ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        REQ-001
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
                      {selectedViewDetail?.type}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {selectedViewDetail?.quantity}
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
                      {selectedViewDetail?.requestDateTime}
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
                            src={
                              statusData.label === "Declined"
                                ? CrossIcon
                                : EllipsesIcon
                            }
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
              <Row className={styles.mainButtonDivClose}>
                <Col>
                  {statusData.label === "Approved" ? (
                    <>
                      <div className={styles.approvedButtonClass}>
                        <CustomButton
                          text={"View Comment"}
                          className="big-light-button"
                          onClick={onClickViewModal}
                        />
                        <CustomButton
                          text={"Conduct Transaction"}
                          className="big-dark-button"
                          onClick={onClickOfConductTransaction}
                        />
                      </div>
                    </>
                  ) : statusData.label === "Not Traded" ? (
                    <>
                      <div className={styles.approvedButtonClass}>
                        <CustomButton
                          text={"Close"}
                          className="big-light-button"
                          onClick={onClickPendingClose}
                        />
                        <CustomButton
                          text={"Resubmit"}
                          className="big-dark-button"
                          onClick={onClickResubmitInNotTradedStatus}
                        />
                      </div>
                    </>
                  ) : statusData.label === "Declined" ? (
                    <>
                      <div className={styles.approvedButtonClass}>
                        <CustomButton
                          text={"View Comment"}
                          className="big-light-button"
                          onClick={onClickViewModal}
                        />
                        <CustomButton
                          text={"Close"}
                          className="big-light-button"
                        />
                      </div>
                    </>
                  ) : statusData.label === "Pending" ? (
                    <CustomButton
                      text={"Close"}
                      className="big-light-button"
                      onClick={onClickPendingClose}
                    />
                  ) : statusData.label === "Resubmitted" ? (
                    <CustomButton
                      text={"Close"}
                      className="big-light-button"
                      onClick={onClickPendingClose}
                    />
                  ) : (
                    <CustomButton text={"Close"} className="big-light-button" />
                  )}
                </Col>
              </Row>
            </div>
          </>
        }
      />
    </>
  );
};

export default ViewDetailModal;
