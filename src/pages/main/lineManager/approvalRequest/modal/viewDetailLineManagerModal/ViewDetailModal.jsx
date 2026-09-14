import React, { useEffect, useRef } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";
import repeat from "../../../../../../assets/img/repeat.png";
import ApprovedResubmit from "../../../../../../assets/img/ApprovedResubmit.png";
import DeclinedResubmit from "../../../../../../assets/img/DeclinedResubmite.png";
import EscaltedOn from "../../../../../../assets/img/escalated.png";
// Same "Escalated On" stepper icon used by
// ViewDetailHeadOfApprovalModal.jsx (HTA's own View Details screen) - a
// different file than the "escalated.png" badge above, which this page
// uses elsewhere for the plain Request-Date flag, not the stepper step.
import EscalatedStepIcon from "../../../../../../assets/img/EscaltedOn.png";

import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../common/funtions/rejex";
import {
  GetAllLineManagerViewDetailRequest,
  UpdateApprovalRequestStatusLineManager,
} from "../../../../../../api/myApprovalApi";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useNavigate } from "react-router-dom";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

const ViewDetailModal = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailLineManagerModal,
    setViewDetailLineManagerModal,
    isSelectedViewDetailLineManager,
    setNoteGlobalModal,
    setApprovedGlobalModal,
    setViewCommentGlobalModal,
  } = useGlobalModal();

  console.log(
    isSelectedViewDetailLineManager,
    "isSelectedViewDetailLineManager"
  );

  //This is the Global state of Context Api
  const { viewDetailsLineManagerData, setViewDetailsLineManagerData } =
    useMyApproval();

  const { allInstrumentsData, employeeBasedBrokersData } =
    useDashboardContext();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    viewDetailsLineManagerData?.details?.[0]?.instrumentID
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  // To show Note Modal when Click on Declined in ViewDetailLineManager Modal
  const onClickToOpenNoteModal = () => {
    setViewDetailLineManagerModal(false);
    setNoteGlobalModal({ visible: true, action: "Decline" });
  };

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
      default:
        return {
          label: "Pending",
          labelClassName: styles.pendingDetailHeading,
          divClassName: styles.pendingBorderClass,
        };
    }
  };

  const statusDataLM = getStatusStyle(
    String(viewDetailsLineManagerData?.workFlowStatus?.workFlowStatusID)
  );
  console.log("statusDataLM.label", viewDetailsLineManagerData);
  console.log("statusDataLM.label", statusDataLM);

  // Header badge shows the LM's own action (myActionStatusID: 1=Pending,
  // 2=Approved, 3=Declined), not the overall workFlowStatus — the overall
  // workflow can still be Pending (awaiting other approvers) after this LM
  // already acted on their own level. myActionStatusID uses a different
  // numbering scheme than workFlowStatusID, so map it onto the codes
  // getStatusStyle already uses for the same labels (1=Pending, 3=Approved,
  // 4=Declined) instead of duplicating the style lookup.
  const myActionStatusID = viewDetailsLineManagerData?.myActionStatusID;
  const myActionStatusCode =
    myActionStatusID === 2
      ? "3"
      : myActionStatusID === 3
      ? "4"
      : myActionStatusID === 1
      ? "1"
      : String(myActionStatusID ?? "");
  const myActionStatusData = getStatusStyle(myActionStatusCode);
  // When its already approve or ddecline by you then button should be disabled
  const hasAlreadyApprovedOrDeclined =
    viewDetailsLineManagerData?.hierarchyDetails?.some(
      (item) => item.userID === loggedInUserID && item.bundleStatusID === 2 // 2 is approved
    );

  // ADDED ("proper hierarchy", matching ViewDetailHeadOfApprovalModal.jsx's
  // escalations[]-driven stepper - API_Changes/2026-09-14_lm_hierarchy_
  // escalation_resolver_identity_fix.md): hierarchyDetails alone collapses
  // an escalated level straight to its resolution (or, while still open,
  // to a bare "Waiting for Approval" that never says it's actually sitting
  // with someone else now) - it never surfaces the escalation event itself.
  // HTA's own View Details screen already shows a dedicated "Escalated On"
  // step for this; unlike that screen (which only ever shows requests that
  // were escalated, so it can build its stepper entirely from escalations[]),
  // most levels here were never escalated at all, so this inserts the extra
  // step per-level instead of replacing the whole hierarchyDetails-driven
  // structure.
  const hierarchyDetailsList = Array.isArray(
    viewDetailsLineManagerData?.hierarchyDetails
  )
    ? viewDetailsLineManagerData.hierarchyDetails
    : [];

  const sortedHierarchyDetails = [...hierarchyDetailsList].sort((a, b) => {
    if (a.bundleStatusID === 1 && b.bundleStatusID !== 1) return 1;
    if (a.bundleStatusID !== 1 && b.bundleStatusID === 1) return -1;
    return 0;
  });

  // escalations[] carries who a level was escalated FROM (escalatedFrom) -
  // hierarchyDetails doesn't. Correlate each escalated hierarchyDetails
  // entry with its escalations[] record via the shared escalatedOnDate/
  // escalatedOnTime pair (present, identical, on both).
  const escalationRecords = Array.isArray(
    viewDetailsLineManagerData?.escalations
  )
    ? viewDetailsLineManagerData.escalations
    : [];

  const findEscalationRecord = (person) =>
    escalationRecords.find(
      (esc) =>
        esc?.escalatedOnDate === person?.escalatedOnDate &&
        esc?.escalatedOnTime === person?.escalatedOnTime
    );

  const hierarchySteps = sortedHierarchyDetails.flatMap((person, index) => {
    const {
      fullName,
      bundleStatusID,
      modifiedDate,
      modifiedTime,
      userID,
      isEscalated,
      escalatedOnDate,
      escalatedOnTime,
      escalationStillOpen,
    } = person;

    const formattedDateTime = formatApiDateTime(
      `${modifiedDate} ${modifiedTime}`
    );

    const escalatedFromName = isEscalated
      ? findEscalationRecord(person)?.escalatedFrom
      : null;

    // Same text/icon as ViewDetailHeadOfApprovalModal.jsx's (HTA's) own
    // "Escalated On" step, plus the "by {name}" line already shown on the
    // Employee's own View Details screen.
    const escalatedStep = isEscalated
      ? {
          key: `${index}-escalated`,
          iconSrc: EscalatedStepIcon,
          statusText: "",
          labelContent: (
            <div className={styles.customlabel}>
              <div className={styles.customtitle}>Escalated On</div>
              {escalatedFromName && (
                <div className={styles.customdesc}>
                  by {escalatedFromName}
                </div>
              )}
              <div className={styles.customdesc}>
                {formatApiDateTime(`${escalatedOnDate} ${escalatedOnTime}`)}
              </div>
            </div>
          ),
        }
      : null;

    let iconSrc;
    let statusText = "";
    let labelContent = null;

    // Still escalated and unresolved: same "Waiting for your approval" text
    // HTA's own View Details screen shows for this case.
    if (isEscalated && escalationStillOpen) {
      iconSrc = EllipsesIcon;
      labelContent = (
        <div className={styles.customlabel}>
          <div className={styles.customtitle}>Waiting for your approval</div>
        </div>
      );
    } else {
      switch (bundleStatusID) {
        case 1:
          // Check if the logged-in user is the same as this person
          if (loggedInUserID === userID) {
            iconSrc = EllipsesIcon; // Set the ellipses icon for waiting
            statusText = "Waiting for Approval"; // Add the status text
            labelContent = null; // Don't show name and date when loggedInUserID matches
          } else {
            iconSrc = EllipsesIcon; // Default icon for case 1
            labelContent = (
              <div className={styles.customlabel}>
                <div className={styles.customtitle}>{fullName}</div>
                <div className={styles.customdesc}>
                  {bundleStatusID !== 1 && formattedDateTime}
                </div>
              </div>
            );
          }
          break;
        case 2:
          iconSrc = CheckIcon;
          // FIXED: was a single "Approved by {fullName}" title string that
          // just visually wrapped onto 2 lines at narrow widths - now a
          // real 3-line layout (title / name / date), matching the
          // Employee View Details screen's own "Approved by" step.
          labelContent =
            loggedInUserID === userID ? (
              <div className={styles.customlabel}>
                <div className={styles.customtitle}>Approved by You</div>
                <div className={styles.customdesc}>{formattedDateTime}</div>
              </div>
            ) : (
              <div className={styles.customlabel}>
                <div className={styles.customtitle}>Approved by</div>
                <div className={styles.customdesc}>{fullName}</div>
                <div className={styles.customdesc}>{formattedDateTime}</div>
              </div>
            );
          break;
        case 3:
          iconSrc = CrossIcon; // Cross icon for declined
          // FIXED: same "Declined by {fullName}" single-string-wrap gap
          // as case 2 above.
          labelContent =
            loggedInUserID === userID ? (
              <div className={styles.customlabel}>
                <div className={styles.customtitle}>Declined by You</div>
                <div className={styles.customdesc}>{formattedDateTime}</div>
              </div>
            ) : (
              <div className={styles.customlabel}>
                <div className={styles.customtitle}>Declined by</div>
                <div className={styles.customdesc}>{fullName}</div>
                <div className={styles.customdesc}>{formattedDateTime}</div>
              </div>
            );
          break;
        default:
          iconSrc = EllipsesIcon; // Default icon for other cases
          labelContent = (
            <div className={styles.customlabel}>
              <div className={styles.customtitle}>{fullName}</div>
              <div className={styles.customdesc}>{formattedDateTime}</div>
            </div>
          );
      }
    }

    const resolutionStep = {
      key: `${index}-resolution`,
      iconSrc,
      statusText,
      labelContent,
    };

    return escalatedStep ? [escalatedStep, resolutionStep] : [resolutionStep];
  });

  // To open Approved Modal when Click on Approved Button in ViewDetailLineManager Modal
  const onClickToOpenApprovedModal = () => {
    setViewDetailLineManagerModal(false);
    setNoteGlobalModal({ visible: true, action: "Approve" });
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
                    className={`${myActionStatusData.divClassName} ${
                      viewDetailsLineManagerData?.details?.[0]
                        ?.resubmitRequestTrackingID
                        ? styles.inlineWithIcon
                        : ""
                    }`}
                  >
                    {viewDetailsLineManagerData?.details?.[0]
                      ?.resubmitRequestTrackingID && (
                      <img draggable={false} src={repeat} alt="Repeat" />
                    )}
                    <label className={myActionStatusData.labelClassName}>
                      {myActionStatusData.label}
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
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgroundColorOfInstrumentDetailApproved
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Instrument
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      <>
                        <span className={styles.customTag}>
                          {/* Extract an assetTypeID id which is 1 then show Equity(EQ) */}
                          {
                            viewDetailsLineManagerData?.assetTypes?.[0]
                              ?.shortCode
                          }
                        </span>
                        <span
                          className={styles.viewDetailSubLabelsForInstrument}
                          title={`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
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
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Requester Name
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsLineManagerData?.requesterName}
                    </label>
                  </div>
                </Col>

                {viewDetailsLineManagerData?.details?.[0]
                  ?.resubmitRequestTrackingID ? (
                  <>
                    <Col span={6}>
                      <div className={styles.backgrounColorOfDetail}>
                        <label className={styles.viewDetailMainLabels}>
                          Approval ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          {dashBetweenApprovalAssets(
                            viewDetailsLineManagerData?.details?.[0]
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
                              viewDetailsLineManagerData?.details?.[0]
                                ?.resubmitRequestTrackingID
                            )}
                          </u>
                        </label>
                      </div>
                    </Col>
                  </>
                ) : (
                  <Col span={12}>
                    <div
                      className={
                        statusDataLM.label === "Traded"
                          ? styles.backgroundColorOfInstrumentDetailTradednoradius
                          : styles.backgrounColorOfDetail
                      }
                    >
                      <label className={styles.viewDetailMainLabels}>
                        Approval ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          viewDetailsLineManagerData?.details?.[0]
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
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>Type</label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsLineManagerData?.details?.[0]
                        ?.approvalTypeID === "1" && <span>Buy</span>}
                      {viewDetailsLineManagerData?.details?.[0]
                        ?.approvalTypeID === "2" && <span>Sell</span>}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {formatNumberWithCommas(
                        viewDetailsLineManagerData?.details?.[0]?.quantity
                      )}
                    </label>
                  </div>
                </Col>
              </Row>

              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div
                    className={`${
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    } ${
                      viewDetailsLineManagerData?.isEscalated
                        ? styles.detailWithIcon
                        : ""
                    }`}
                  >
                    <div>
                      <label className={styles.viewDetailMainLabels}>
                        Request Date
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {formatApiDateTime(
                          isSelectedViewDetailLineManager?.requestDateTime
                        )}
                      </label>
                    </div>
                    {viewDetailsLineManagerData?.isEscalated && (
                      <img
                        draggable={false}
                        src={EscaltedOn}
                        alt="Escalated"
                        className={styles.escalatedIcon}
                      />
                    )}
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Asset Class
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsLineManagerData?.assetTypes?.[0]?.title}
                    </label>
                  </div>
                </Col>
              </Row>

              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <BrokerList
                    statusData={statusDataLM}
                    variant={"Orange"}
                    viewDetailsData={
                      viewDetailsLineManagerData?.details[0]?.brokers
                    }
                    type={2}
                  />
                </Col>
              </Row>

              {/* This is the Stepper Libarary Section */}
              <Row>
                <div className={styles.mainStepperContainer}>
                  <div
                    className={`${
                      statusDataLM?.label === "Traded"
                        ? styles.TradedbackgrounColorOfStepper
                        : styles.backgrounColorOfStepper
                    } ${
                      hierarchySteps.length <= 3
                        ? styles.centerAlignStepper
                        : styles.leftAlignStepper
                    }`}
                  >
                    {/* Agar loginUserID match krti hai hierarchyDetails ki userID sy to wo wala stepper show nahi hoga */}
                    <Stepper
                      activeStep={Math.max(0, hierarchySteps.length - 1)}
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
                      {hierarchySteps.map((step) => (
                        <Step
                          key={step.key}
                          className={styles.stepButtonActive}
                          label={
                            <div className={styles.stepLabelWrapper}>
                              {step.statusText && (
                                <div className={styles.waitingApprovalText}>
                                  {step.statusText}
                                </div>
                              )}
                              {step.labelContent}
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
                      ))}
                    </Stepper>
                  </div>
                </div>
              </Row>

              {/* All Others button Scenario's for footer button */}
              <Row>
                {isSelectedViewDetailLineManager?.status === "Approved" ||
                isSelectedViewDetailLineManager?.status === "Declined" ? (
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
                ) : statusDataLM.label === "Not Traded" ? (
                  <>
                    <Col span={[24]}>
                      <div className={styles.approvedButtonClassViewComment}>
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
                    {!hasAlreadyApprovedOrDeclined && (
                      <>
                        <Col span={[24]}>
                          {statusDataLM?.label === "Pending" ? (
                            <>
                              {" "}
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
                            </>
                          ) : statusDataLM?.label === "Compliant" ? (
                            <>
                              {" "}
                              <div className={styles.CompliantButtonClass}>
                                <CustomButton
                                  text={"View Tickets"}
                                  className="big-light-button"
                                />
                                <CustomButton
                                  text={"close"}
                                  onClick={() =>
                                    setViewDetailLineManagerModal(false)
                                  }
                                  className="big-light-button"
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

export default ViewDetailModal;
