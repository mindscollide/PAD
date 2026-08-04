import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailHeadOfApprovalModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";
import ApprovedResubmit from "../../../../../../assets/img/ApprovedResubmit.png";
import DeclinedResubmit from "../../../../../../assets/img/DeclinedResubmite.png";
import EscaltedOn from "../../../../../../assets/img/EscaltedOn.png";
import repeat from "../../../../../../assets/img/repeat.png";

import {
  convertUTCToCurrentTimeZone,
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../common/funtions/rejex";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import { useEscalatedApprovals } from "../../../../../../context/escalatedApprovalContext";

const ViewDetailHeadOfApprovalModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailsHeadOfApprovalModal,
    setViewDetailsHeadOfApprovalModal,
    isSelectedViewDetailHeadOfApproval,
    setNoteGlobalModal,
    setViewCommentGlobalModal,
  } = useGlobalModal();

  const { viewDetailsHeadOfApprovalData } = useEscalatedApprovals();

  const { allInstrumentsData } = useDashboardContext();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    viewDetailsHeadOfApprovalData?.details?.[0]?.instrumentID
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "1":
        return {
          label: "Pending",
          labelClassName: styles.pendingDetailHeading,
          divClassName: styles.pendingBorderClass,
        };
      case "2":
        return {
          label: "Resubmitted",
          labelClassName: styles.resubmittedDetailHeading,
          divClassName: styles.resubmittedBorderClass,
        };
      case "3":
        return {
          label: "Approved",
          labelClassName: styles.approvedDetailHeading,
          divClassName: styles.approvedBorderClass,
        };
      case "4":
        return {
          label: "Declined",
          labelClassName: styles.declinedDetailHeading,
          divClassName: styles.declinedBorderClass,
        };
      case "5":
        return {
          label: "Traded",
          labelClassName: styles.tradedDetailHeading,
          divClassName: styles.tradedBorderClass,
        };
      case "6":
        return {
          label: "Not Traded",
          labelClassName: styles.notTradedDetailHeading,
          divClassName: styles.notTradedBorderClass,
        };
      case "8":
        return {
          label: "Compliant",
          labelClassName: styles.approvedDetailHeading,
          divClassName: styles.approvedBorderClass,
        };
      case "9":
        return {
          label: "Not-Compliant",
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

  const statusDataHTA = getStatusStyle(
    String(viewDetailsHeadOfApprovalData?.workFlowStatus?.workFlowStatusID)
  );

  // When its already approve or ddecline by you then button should be disabled
  const hasAlreadyApprovedOrDeclined =
    viewDetailsHeadOfApprovalData?.hierarchyDetails?.some(
      (item) => item.userID === loggedInUserID && item.bundleStatusID === 2 // 2 is approved
    );

  // The HTA "View Details" screen only ever shows requests that have
  // actually been escalated, so the stepper is built entirely from
  // escalations[] rather than the per-approver hierarchyDetails: each
  // escalation contributes an "Escalated On" step, followed either by
  // who closed it (escalationClosedBy/escalationClosedByName set) or a
  // "Waiting for your approval" step while it's still open.
  const escalations = Array.isArray(
    viewDetailsHeadOfApprovalData?.escalations
  )
    ? viewDetailsHeadOfApprovalData.escalations
    : [];

  const escalationSteps = escalations.flatMap((esc) => {
    const escalatedStep = {
      key: `${esc?.escalationID}-escalated`,
      iconSrc: EscaltedOn,
      title: "Escalated On",
      desc: formatApiDateTime(
        `${esc?.escalatedOnDate} ${esc?.escalatedOnTime}`
      ),
    };

    // escalatedClosedOn is a combined ISO string ("YYYY-MM-DDTHH:mm:ss"),
    // unlike the split yyyyMMdd/HHmmss fields used elsewhere — reshape it
    // into the same two-part UTC format before converting for display.
    const [closedDatePart, closedTimePart] = (
      esc?.escalatedClosedOn || ""
    ).split("T");

    const closureStep = esc?.escalationClosedBy
      ? {
          key: `${esc?.escalationID}-closed`,
          iconSrc: CheckIcon,
          title:
            esc?.escalationClosedBy === loggedInUserID
              ? "Approved by You"
              : esc?.escalationClosedByName,
          desc: convertUTCToCurrentTimeZone(
            closedDatePart?.replace(/-/g, ""),
            closedTimePart?.replace(/:/g, "")
          ),
        }
      : {
          key: `${esc?.escalationID}-waiting`,
          iconSrc: EllipsesIcon,
          title: "Waiting for your approval",
          desc: "",
        };

    return [escalatedStep, closureStep];
  });

  // To open Approved Modal when Click on Approved Button in ViewDetailLineManager Modal
  const onClickToOpenApprovedModal = () => {
    setNoteGlobalModal({ visible: true, action: "HTA-Approve" });
    setViewDetailsHeadOfApprovalModal(false);
  };

  // To show Note Modal when Click on Declined in ViewDetailLineManager Modal
  const onClickToOpenNoteDeclineModal = () => {
    setNoteGlobalModal({ visible: true, action: "HTA-Decline" });
    setViewDetailsHeadOfApprovalModal(false);
  };

  // To open View Comment Line Maneger Modal by click on View COmment button
  const onClickViewCommentModal = () => {
    setViewDetailsHeadOfApprovalModal(false);
    setViewCommentGlobalModal(true);
  };

  return (
    <>
      <GlobalModal
        visible={viewDetailsHeadOfApprovalModal}
        width={"942px"}
        centered={true}
        onCancel={() => setViewDetailsHeadOfApprovalModal(false)}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              {/* Show Heading by Status in View Detail Modal */}

              <Row>
                <Col span={24}>
                  <div
                    className={`${statusDataHTA.divClassName} ${
                      viewDetailsHeadOfApprovalData?.details?.[0]
                        ?.resubmitRequestTrackingID
                        ? styles.inlineWithIcon
                        : ""
                    }`}
                  >
                    {viewDetailsHeadOfApprovalData?.details?.[0]
                      ?.resubmitRequestTrackingID && (
                      <img draggable={false} src={repeat} alt="Repeat" />
                    )}
                    <label className={statusDataHTA.labelClassName}>
                      {statusDataHTA.label}
                    </label>
                  </div>
                </Col>
              </Row>

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
                          {viewDetailsHeadOfApprovalData?.details?.[0]
                            ?.assetTypeID === "1" && <span>EQ</span>}
                        </span>
                        <span
                          className={styles.viewDetailSubLabelsForInstrument}
                          title={selectedInstrument?.instrumentName}
                        >
                          {`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
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
                      {viewDetailsHeadOfApprovalData?.requesterName}
                    </label>
                  </div>
                </Col>

                {viewDetailsHeadOfApprovalData?.details?.[0]
                  ?.resubmitRequestTrackingID ? (
                  <>
                    <Col span={6}>
                      <div className={styles.backgrounColorOfDetail}>
                        <label className={styles.viewDetailMainLabels}>
                          Approval ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          {dashBetweenApprovalAssets(
                            viewDetailsHeadOfApprovalData?.details?.[0]
                              ?.tradeApprovalID
                          )}
                        </label>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className={styles.backgrounColorOfDetail}>
                        <label className={styles.viewDetailMainLabels}>
                          Previous req ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          <u style={{ color: "#30426a", cursor: "pointer" }}>
                            {dashBetweenApprovalAssets(
                              viewDetailsHeadOfApprovalData?.details?.[0]
                                ?.resubmitRequestTrackingID
                            )}
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
                        {dashBetweenApprovalAssets(
                          viewDetailsHeadOfApprovalData?.details?.[0]
                            ?.tradeApprovalID
                        )}
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
                      {viewDetailsHeadOfApprovalData?.details?.[0]
                        ?.approvalTypeID === "1" && <span>Buy</span>}
                      {viewDetailsHeadOfApprovalData?.details?.[0]
                        ?.approvalTypeID === "2" && <span>Sell</span>}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {formatNumberWithCommas(
                        viewDetailsHeadOfApprovalData?.details?.[0]?.quantity
                      )}
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
                      {formatApiDateTime(
                        isSelectedViewDetailHeadOfApproval?.requestDateTime
                      )}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Asset Class
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsHeadOfApprovalData?.assetTypes?.[0]?.title}
                    </label>
                  </div>
                </Col>
              </Row>

              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <BrokerList
                    statusData={statusDataHTA}
                    variant={"Orange"}
                    viewDetailsData={
                      viewDetailsHeadOfApprovalData?.details[0]?.brokers
                    }
                    type={2}
                  />
                </Col>
              </Row>

              {/* This is the Stepper Libarary Section — built from
              escalations[], since every request on this screen was
              escalated at least once (see escalationSteps above) */}
              <Row>
                <div className={styles.mainStepperContainer}>
                  <div
                    className={`${styles.backgrounColorOfStepper} ${
                      escalationSteps.length <= 3
                        ? styles.centerAlignStepper
                        : styles.leftAlignStepper
                    }`}
                  >
                    <Stepper
                      activeStep={Math.max(0, escalationSteps.length - 1)}
                      connectorStyleConfig={{
                        activeColor: "#00640A",
                        completedColor: "#00640A",
                        disabledColor: "#00640A",
                        size: 1,
                      }}
                      styleConfig={{
                        size: "2em",
                        circleFontSize: "0px",
                        labelFontSize: "17px",
                        borderRadius: "50%",
                      }}
                    >
                      {escalationSteps.map((step) => {
                        return (
                          <Step
                            key={step.key}
                            className={styles.stepButtonActive}
                            label={
                              <div className={styles.stepLabelWrapper}>
                                <div className={styles.customlabel}>
                                  <div className={styles.customtitle}>
                                    {step.title}
                                  </div>
                                  {step.desc && (
                                    <div className={styles.customdesc}>
                                      {step.desc}
                                    </div>
                                  )}
                                </div>
                              </div>
                            }
                          >
                            <div className={styles.stepCircle}>
                              <img
                                draggable={false}
                                src={step.iconSrc}
                                alt="status-icon"
                                className={styles.circleImg}
                              />
                            </div>
                          </Step>
                        );
                          })}
                    </Stepper>
                  </div>
                </div>
              </Row>

              {/* All Others button Scenario's for footer button */}
              <Row>
                {isSelectedViewDetailHeadOfApproval?.status === "Approved" ||
                isSelectedViewDetailHeadOfApproval?.status === "Declined" ? (
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
                          onClick={() =>
                            setViewDetailsHeadOfApprovalModal(false)
                          }
                          className="big-light-button"
                        />
                      </div>
                    </Col>
                  </>
                ) : (
                  <>
                    {!hasAlreadyApprovedOrDeclined && (
                      <>
                        <Col span={[24]}>
                          {statusDataHTA?.label === "Pending" ? (
                            <>
                              {" "}
                              <div className={styles.approvedButtonClass}>
                                <CustomButton
                                  text={"Decline"}
                                  onClick={onClickToOpenNoteDeclineModal}
                                  className="Decline-dark-button"
                                />
                                <CustomButton
                                  text={"Approve"}
                                  onClick={onClickToOpenApprovedModal}
                                  className="Approved-dark-button"
                                />
                              </div>
                            </>
                          ) : null}
                        </Col>
                      </>
                    )}
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

export default ViewDetailHeadOfApprovalModal;
