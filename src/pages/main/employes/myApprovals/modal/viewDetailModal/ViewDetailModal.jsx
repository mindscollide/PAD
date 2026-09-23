import React, { useMemo } from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";
import NotTradedIcon from "../../../../../../assets/img/NotTraded.png";
import EscalatedIcon from "../../../../../../assets/img/escalated.png";
// Same "Escalated On" stepper icon used by ViewDetailHeadOfApprovalModal.jsx
// (HTA) and the LM ViewDetailModal.jsx - escalated.png above is a different,
// square badge used elsewhere on this page for the Request-Date flag, not
// the stepper step.
import EscalatedStepIcon from "../../../../../../assets/img/EscaltedOn.png";
import copyIcon from "../../../../../../assets/img/copy-dark.png";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../common/funtions/rejex";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import CopyToClipboard from "../../../../../../hooks/useClipboard";
import Repeat from "../../../../../../assets/img/repeat.png";

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
  const { showNotification } = useNotification();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  //This is the Global state of Context Api
  const { viewDetailsModalData } = useMyApproval();

  const { allInstrumentsData } = useDashboardContext();

  // Refactor sessionStorage read with useMemo for performance & error handling
  const complianceOfficerDetails = useMemo(() => {
    try {
      const storedData = JSON.parse(
        sessionStorage.getItem("user_Hierarchy_Details") || "[]"
      );

      if (!Array.isArray(storedData)) return {};

      const found = storedData.find(
        (item) =>
          item.roleName === "Compliance Officer (CO)" && item.levelNo === 1
      );

      return found
        ? { managerName: found.managerName, managerEmail: found.managerEmail }
        : {};
    } catch (e) {
      console.error("Invalid JSON in sessionStorage", e);
      return {};
    }
  }, []);

  // This is the Status Which is I'm getting from the selectedViewDetail contextApi state
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

      default:
        return {
          label: "Detail",
          labelClassName: styles.defaultDetailHeading,
          divClassName: styles.defaultBorderClass,
        };
    }
  };

  //This is how I can pass the status in statusData Variables
  const statusData = getStatusStyle(
    String(viewDetailsModalData?.workFlowStatus?.workFlowStatusID)
  );

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(viewDetailsModalData?.details?.[0]?.instrumentID);

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  // ADDED: derived values for the Traded layout (Shares Traded)
  const isTraded = statusData.label === "Traded";
  // false for both "" and null
  const hasResubmit = Boolean(
    viewDetailsModalData?.details?.[0]?.resubmitRequestTrackingID
  );
  // sharesTraded lives at the top level of responseResult, not in details[0]
  const sharesTraded = viewDetailsModalData?.sharesTraded;
  const showSharesTraded =
    isTraded && sharesTraded !== "" && sharesTraded != "";

  const approvalTypeLabel =
    viewDetailsModalData?.details?.[0]?.approvalTypeID === "1"
      ? "Buy"
      : viewDetailsModalData?.details?.[0]?.approvalTypeID === "2"
      ? "Sell"
      : "";

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

  //This the Copy Functionality where user can copy email by click on COpyIcon
  const handleCopyEmail = async () => {
    const emailToCopy =
      complianceOfficerDetails?.managerEmail || "compliance@horizoncapital.com";

    try {
      await CopyToClipboard(emailToCopy); // ✅ Use your utility function here
      showNotification({
        type: "success",
        title: "Copied",
        description: "Email copied to clipboard.",
        placement: "bottomLeft",
      });
    } catch (error) {
      console.error("Email Not Copied:", error);
    }
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
                  <div
                    className={`${statusData.divClassName} ${
                      viewDetailsModalData?.details?.[0]
                        ?.resubmitRequestTrackingID
                        ? styles.inlineWithIcon
                        : ""
                    }`}
                  >
                    {viewDetailsModalData?.details?.[0]
                      ?.resubmitRequestTrackingID && (
                      <img draggable={false} src={Repeat} alt="Repeat" />
                    )}

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
                          <span className={styles.customTag}>
                            {viewDetailsModalData?.assetTypes?.[0]?.shortCode}
                          </span>
                          <span
                            className={styles.viewDetailSubLabelsForInstrument}
                            title={selectedInstrument?.instrumentName}
                          >
                            {`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
                          </span>
                        </label>
                      </div>
                    </Col>
                  </Row>
                </>
              )}

              {/* Show Resubmit,Pending,Declined and Not Traded status Sceanrios */}
              {statusData.label === "Approved" ? (
                // status 3 is Approved - Instrument already rendered full-width above,
                // so Time Remaining + Approval ID keep their existing side-by-side layout
                <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Time Remaining to Trade
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {selectedViewDetail?.timeRemainingToTrade}
                      </label>
                    </div>
                  </Col>
                  <Col
                    span={
                      viewDetailsModalData?.details?.[0]
                        ?.resubmitRequestTrackingID
                        ? 6
                        : 12
                    }
                  >
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Approval ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          viewDetailsModalData?.details?.[0]?.tradeApprovalID
                        )}
                      </label>
                    </div>
                  </Col>
                  {viewDetailsModalData?.details?.[0]
                    ?.resubmitRequestTrackingID && (
                    <Col span={6}>
                      <div className={styles.backgrounColorOfDetail}>
                        <label className={styles.viewDetailMainLabels}>
                          Previous ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          <u>
                            {dashBetweenApprovalAssets(
                              viewDetailsModalData?.details?.[0]
                                ?.resubmitRequestTrackingID
                            )}
                          </u>
                        </label>
                      </div>
                    </Col>
                  )}
                </Row>
              ) : (
                <>
                  {/* Instrument now takes the full row width (span 24) */}
                  <Row
                    style={{
                      marginTop:
                        // status 1 is Pending
                        statusData.label === "Pending" ||
                        // status 2 is Resubmitted
                        statusData.label === "Resubmitted" ||
                        // status 4 is Declined
                        statusData.label === "Declined" ||
                        // status 6 is Not Traded
                        statusData.label === "Not Traded" ||
                        statusData.label === "Traded"
                          ? "16px"
                          : "3px",
                    }}
                  >
                    <Col span={24}>
                      <div
                        className={
                          // status 5 is Traded
                          statusData.label === "Traded"
                            ? styles.backgroundColorOfInstrumentDetailTraded
                            : // status 1 is Pending
                            statusData.label === "Pending" ||
                              // status 2 is Resubmitted
                              statusData.label === "Resubmitted" ||
                              // status 4 is Declined
                              statusData.label === "Declined" ||
                              // status 6 is Not Traded
                              statusData.label === "Not Traded"
                            ? styles.backgrounColorOfInstrumentDetail
                            : styles.backgrounColorOfDetail
                        }
                      >
                        <label className={styles.viewDetailMainLabels}>
                          Instrument
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          <span className={styles.customTag}>
                            {/* Extract an assetTypeID id which is 1 then show Equity(EQ) */}
                            {viewDetailsModalData?.assetTypes?.[0]?.shortCode}
                          </span>
                          <span
                            className={styles.viewDetailSubLabelsForInstrument}
                            title={selectedInstrument?.instrumentName}
                          >
                            {`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
                          </span>
                        </label>
                      </div>
                    </Col>
                  </Row>

                  {isTraded ? (
                    // ADDED: Traded layout row 2 -> Approval ID | (Resubmitted ID) | Type
                    <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                      <Col span={hasResubmit ? 8 : 12}>
                        <div
                          className={
                            styles.backgroundColorOfInstrumentDetailTradednoradius
                          }
                        >
                          <label className={styles.viewDetailMainLabels}>
                            Approval ID
                          </label>
                          <label className={styles.viewDetailSubLabels}>
                            {dashBetweenApprovalAssets(
                              viewDetailsModalData?.details?.[0]
                                ?.tradeApprovalID
                            )}
                          </label>
                        </div>
                      </Col>
                      {hasResubmit && (
                        <Col span={8}>
                          <div
                            className={
                              styles.backgroundColorOfInstrumentDetailTradednoradius
                            }
                          >
                            <label className={styles.viewDetailMainLabels}>
                              Resubmitted ID
                            </label>
                            <label className={styles.viewDetailSubLabels}>
                              <u>
                                {dashBetweenApprovalAssets(
                                  viewDetailsModalData?.details?.[0]
                                    ?.resubmitRequestTrackingID
                                )}
                              </u>
                            </label>
                          </div>
                        </Col>
                      )}
                      <Col span={hasResubmit ? 8 : 12}>
                        <div
                          className={
                            styles.backgroundColorOfInstrumentDetailTradednoradius
                          }
                        >
                          <label className={styles.viewDetailMainLabels}>
                            Type
                          </label>
                          <label className={styles.viewDetailSubLabels}>
                            {approvalTypeLabel}
                          </label>
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    /* Approval ID / Tracking ID / Previous ID now have the freed-up row width to themselves */
                    <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                      {/* status 2 is Resubmitted */}
                      {statusData.label === "Resubmitted" ? (
                        <>
                          <Col span={12}>
                            <div
                              className={
                                // status 1 is Pending
                                statusData.label === "Pending" ||
                                // status 4 is Declined
                                statusData.label === "Declined"
                                  ? styles.backgrounColorOfApprovalDetail
                                  : styles.backgrounColorOfDetail
                              }
                            >
                              <label className={styles.viewDetailMainLabels}>
                                Approval ID
                              </label>
                              <label className={styles.viewDetailSubLabels}>
                                {dashBetweenApprovalAssets(
                                  viewDetailsModalData?.details?.[0]
                                    ?.tradeApprovalID
                                )}
                              </label>
                            </div>
                          </Col>
                          <Col span={12}>
                            {/* You can render some other related info here */}
                            <div
                              className={
                                // status 1 is Pending
                                statusData.label === "1" ||
                                // status 2 is Resubmitted
                                statusData.label === "2"
                                  ? styles.backgrounColorOfApprovalDetail
                                  : styles.backgrounColorOfDetail
                              }
                            >
                              <label className={styles.viewDetailMainLabels}>
                                Tracking ID
                              </label>
                              <label className={styles.viewDetailSubLabels}>
                                <u>
                                  {dashBetweenApprovalAssets(
                                    viewDetailsModalData?.details?.[0]
                                      ?.resubmitRequestTrackingID
                                  )}
                                </u>
                              </label>
                            </div>
                          </Col>
                        </>
                      ) : (
                        <>
                          <Col
                            span={
                              viewDetailsModalData?.details?.[0]
                                ?.resubmitRequestTrackingID
                                ? 12
                                : 24
                            }
                          >
                            <div
                              className={
                                // status 1 is Pending
                                statusData.label === "Pending" ||
                                // status 6 is Not Traded
                                statusData.label === "Not Traded"
                                  ? styles.backgrounColorOfApprovalDetail
                                  : styles.backgrounColorOfDetail
                              }
                            >
                              <label className={styles.viewDetailMainLabels}>
                                Approval ID
                              </label>
                              <label className={styles.viewDetailSubLabels}>
                                {dashBetweenApprovalAssets(
                                  viewDetailsModalData?.details?.[0]
                                    ?.tradeApprovalID
                                )}
                              </label>
                            </div>
                          </Col>
                          {viewDetailsModalData?.details?.[0]
                            ?.resubmitRequestTrackingID && (
                            <Col span={12}>
                              {/* You can render some other related info here */}
                              <div
                                className={
                                  // status 1 is Pending
                                  statusData.label === "1" ||
                                  // status 2 is Resubmitted
                                  statusData.label === "2"
                                    ? styles.backgrounColorOfApprovalDetail
                                    : styles.backgrounColorOfDetail
                                }
                              >
                                <label className={styles.viewDetailMainLabels}>
                                  Previous ID
                                </label>
                                <label className={styles.viewDetailSubLabels}>
                                  <u>
                                    {dashBetweenApprovalAssets(
                                      viewDetailsModalData?.details?.[0]
                                        ?.resubmitRequestTrackingID
                                    )}
                                  </u>
                                </label>
                              </div>
                            </Col>
                          )}
                        </>
                      )}
                    </Row>
                  )}
                </>
              )}

              {/* Show Other Scenario's SUb Heading and Field Sceanrio's */}
              {isTraded ? (
                // ADDED: Traded layout row 3 -> Approved Quantity | Shares Traded
                <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                  <Col span={showSharesTraded ? 12 : 24}>
                    <div
                      className={
                        styles.backgroundColorOfInstrumentDetailTradednoradius
                      }
                    >
                      <label className={styles.viewDetailMainLabels}>
                        Approved Quantity
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {formatNumberWithCommas(
                          viewDetailsModalData?.details?.[0]?.quantity
                        )}
                      </label>
                    </div>
                  </Col>
                  {showSharesTraded && (
                    <Col span={12}>
                      <div
                        className={
                          styles.backgroundColorOfInstrumentDetailTradednoradius
                        }
                      >
                        <label className={styles.viewDetailMainLabels}>
                          Shares Traded
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          {formatNumberWithCommas(sharesTraded)}
                        </label>
                      </div>
                    </Col>
                  )}
                </Row>
              ) : (
                <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Type
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {/* {selectedViewDetail?.type} */}

                        {viewDetailsModalData?.details?.[0]?.approvalTypeID ===
                          "1" && <span>Buy</span>}
                        {viewDetailsModalData?.details?.[0]?.approvalTypeID ===
                          "2" && <span>Sell</span>}
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
                        {formatNumberWithCommas(
                          viewDetailsModalData?.details?.[0]?.quantity
                        )}
                      </label>
                    </div>
                  </Col>
                </Row>
              )}

              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div
                    className={`${
                      statusData.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    } ${
                      viewDetailsModalData?.isEscalated
                        ? styles.detailWithIcon
                        : ""
                    }`}
                  >
                    <div>
                      <label className={styles.viewDetailMainLabels}>
                        Request Date
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {formatApiDateTime(selectedViewDetail?.requestDateTime)}
                      </label>
                    </div>
                    {viewDetailsModalData?.isEscalated && (
                      <img
                        draggable={false}
                        src={EscalatedIcon}
                        alt="Escalated"
                        className={styles.escalatedIcon}
                      />
                    )}
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    className={
                      statusData.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Asset Class
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsModalData?.assetTypes?.[0]?.title}
                    </label>
                  </div>
                </Col>
              </Row>

              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <BrokerList
                    statusData={statusData}
                    // viewDetailsData={viewDetailsModalData}
                    variant={"Orange"}
                    viewDetailsData={viewDetailsModalData?.details[0]?.brokers}
                    type={2}
                  />
                </Col>
              </Row>

              {statusData.label === "Traded" ? (
                <>
                  <Row style={{ marginTop: "16px" }}>
                    <Col span={24}>
                      <label className={styles.complianceOfficerText}>
                        Compliance Officer
                      </label>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "3px" }}>
                    <Col span={24}>
                      <div className={styles.backgrounColorOfConduct}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <label className={styles.complianceHeading}>
                              Name:
                            </label>
                            <div className={styles.complianceSubHeading}>
                              {complianceOfficerDetails?.managerName || "-"}
                            </div>
                          </Col>

                          <Col span={12} style={{ position: "relative" }}>
                            <label className={styles.complianceHeading}>
                              Email:
                            </label>
                            <div className={styles.complianceSubHeading}>
                              {complianceOfficerDetails?.managerEmail || "-"}
                            </div>
                            <div className={styles.copyEmailConductMainClass}>
                              <img
                                draggable={false}
                                src={copyIcon}
                                onClick={handleCopyEmail}
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </>
              ) : (
                <>
                  <Row>
                    <div className={styles.mainStepperContainer}>
                      <div
                        className={`${styles.backgrounColorOfStepper} ${
                          (viewDetailsModalData?.hierarchyDetails?.length ||
                            0) <= 3
                            ? styles.centerAlignStepper
                            : styles.leftAlignStepper
                        }`}
                      >
                        {/* Agar loginUserID match krti hai hierarchyDetails ki userID sy to wo wala stepper show nahi hoga */}
                        {(() => {
                          const hierarchyPeople = Array.isArray(
                            viewDetailsModalData?.hierarchyDetails
                          )
                            ? viewDetailsModalData.hierarchyDetails.filter(
                                (person) => person.userID !== loggedInUserID
                              )
                            : [];

                          // ADDED: a Not Traded request already went through
                          // its full approval chain (that's why it reached
                          // a trade deadline in the first place) - was
                          // falling through to the plain hierarchy stepper
                          // above with no indication it ever actually
                          // expired to Not Traded. Appends one more step
                          // for that, using the same NotTraded icon the
                          // shared ApprovalStepper (My History/My Actions
                          // trails) already uses for this status.
                          // notTradedDate/notTradedTime aren't exposed by
                          // this endpoint (GetAllViewDetailsByTradeApprovalID)
                          // yet - only GetEmployeeHistoryWorkFlowDetails has
                          // them so far (2026-08-19_employee_history_not_
                          // traded_datetime.md) - reads defensively and
                          // just omits the date/time line until that's
                          // wired through here too, rather than showing
                          // "unknown" or blowing up on missing fields.
                          const isNotTraded = statusData.label === "Not Traded";
                          const notTradedDate =
                            viewDetailsModalData?.details?.[0]?.notTradedDate;
                          const notTradedTime =
                            viewDetailsModalData?.details?.[0]?.notTradedTime;
                          const notTradedDateTime =
                            isNotTraded && notTradedDate
                              ? formatApiDateTime(
                                  `${notTradedDate} ${notTradedTime}`
                                )
                              : "";

                          // Employee is never a hierarchy actor (just the
                          // requester watching), so unlike HTA's/LM's own
                          // screens - where the viewer usually IS the
                          // relevant actor and "your approval" reads
                          // naturally - "Waiting for your approval" would be
                          // meaningless here. Show the originally-escalating
                          // person's name instead (same name in both the
                          // "Escalated On" step and the still-open "Waiting
                          // for" step) - escalations[] carries this
                          // (escalatedFrom/escalatedFromID), hierarchyDetails
                          // doesn't, so correlate each escalated
                          // hierarchyDetails entry with its escalations[]
                          // record via the shared escalatedOnDate/
                          // escalatedOnTime pair (present, identical, on
                          // both).
                          const escalationRecords = Array.isArray(
                            viewDetailsModalData?.escalations
                          )
                            ? viewDetailsModalData.escalations
                            : [];

                          const findEscalationRecord = (person) =>
                            escalationRecords.find(
                              (esc) =>
                                esc?.escalatedOnDate ===
                                  person?.escalatedOnDate &&
                                esc?.escalatedOnTime === person?.escalatedOnTime
                            );

                          // ADDED ("proper hierarchy", matching
                          // ViewDetailHeadOfApprovalModal.jsx's (HTA) and
                          // the LM ViewDetailModal.jsx's escalation-aware
                          // stepper): hierarchyDetails alone collapses an
                          // escalated level straight to its resolution (or,
                          // while still open, to a plain "Waiting for
                          // Approval" that never says it's actually sitting
                          // with someone else now) - it never surfaces the
                          // escalation event itself.
                          const hierarchySteps = hierarchyPeople.flatMap(
                            (person, index) => {
                              const {
                                fullName,
                                bundleStatusID,
                                modifiedDate,
                                modifiedTime,
                                isEscalated,
                                escalatedOnDate,
                                escalatedOnTime,
                                escalationStillOpen,
                              } = person;

                              const formattedDateTime = formatApiDateTime(
                                `${modifiedDate} ${modifiedTime}`
                              );

                              const escalationRecord = isEscalated
                                ? findEscalationRecord(person)
                                : null;
                              const escalatedFromName =
                                escalationRecord?.escalatedFrom;

                              const escalatedStep = isEscalated
                                ? {
                                    key: `${index}-escalated`,
                                    iconSrc: EscalatedStepIcon,
                                    labelContent: (
                                      <div className={styles.customlabel}>
                                        <div className={styles.customtitle}>
                                          Escalated On
                                        </div>
                                        {escalatedFromName && (
                                          <div className={styles.customtitle}>
                                            {escalatedFromName}
                                          </div>
                                        )}
                                        <div className={styles.customtitle}>
                                          {formatApiDateTime(
                                            `${escalatedOnDate} ${escalatedOnTime}`
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  }
                                : null;

                              let iconSrc;
                              let labelContent;

                              if (isEscalated && escalationStillOpen) {
                                iconSrc = EllipsesIcon;
                                // Same multi-vs-single-LM rule as the plain
                                // pending case below: with more than one LM
                                // in the chain, name who it's currently
                                // parked with (still the original LM this
                                // level belongs to - it hasn't been resolved
                                // yet, only escalated) instead of the
                                // generic text.
                                const waitingLabel =
                                  hierarchyPeople.length <= 1
                                    ? "Waiting for approval"
                                    : fullName;
                                labelContent = (
                                  <div className={styles.customlabel}>
                                    <div className={styles.customtitle}>
                                      {waitingLabel}
                                    </div>
                                  </div>
                                );
                              } else if (bundleStatusID === 2) {
                                iconSrc = CheckIcon;
                                labelContent = (
                                  <div className={styles.customlabel}>
                                    <div className={styles.customtitle}>
                                      Approved by
                                    </div>
                                    <div className={styles.customtitle}>
                                      {fullName}
                                    </div>
                                    <div className={styles.customtitle}>
                                      {formattedDateTime}
                                    </div>
                                  </div>
                                );
                              } else if (bundleStatusID === 3) {
                                iconSrc = CrossIcon;
                                labelContent = (
                                  <div className={styles.customlabel}>
                                    <div className={styles.customtitle}>
                                      Declined by
                                    </div>
                                    <div className={styles.customtitle}>
                                      {fullName}
                                    </div>
                                    <div className={styles.customtitle}>
                                      {formattedDateTime}
                                    </div>
                                  </div>
                                );
                              } else {
                                iconSrc = EllipsesIcon;
                                // ADDED: for a still-pending, non-escalated
                                // level, show WHICH LM it's currently
                                // parked with only when the chain actually
                                // has more than one LM level (so the name
                                // is meaningful context) - a single-LM
                                // hierarchy just says "Waiting for
                                // approval", same generic text used
                                // elsewhere for this state.
                                const pendingLabel =
                                  bundleStatusID === 1 &&
                                  hierarchyPeople.length <= 1
                                    ? "Waiting for approval"
                                    : fullName;
                                labelContent = (
                                  <div className={styles.customlabel}>
                                    <div className={styles.customtitle}>
                                      {pendingLabel}
                                    </div>
                                    <div className={styles.customdesc}>
                                      {bundleStatusID !== 1 &&
                                        formattedDateTime}
                                    </div>
                                  </div>
                                );
                              }

                              const resolutionStep = {
                                key: `${index}-resolution`,
                                iconSrc,
                                labelContent,
                              };

                              return escalatedStep
                                ? [escalatedStep, resolutionStep]
                                : [resolutionStep];
                            }
                          );

                          const totalSteps =
                            hierarchySteps.length + (isNotTraded ? 1 : 0);

                          return (
                            <Stepper
                              activeStep={Math.max(0, totalSteps - 1)}
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
                                  label={step.labelContent}
                                  children={
                                    <div className={styles.stepCircle}>
                                      <img
                                        draggable={false}
                                        src={step.iconSrc}
                                        alt="status-icon"
                                        className={styles.circleImg}
                                      />
                                    </div>
                                  }
                                />
                              ))}
                              {isNotTraded && (
                                <Step
                                  key="not-traded"
                                  label={
                                    <div className={styles.customlabel}>
                                      <div className={styles.customtitle}>
                                        Not Traded
                                      </div>
                                      <div className={styles.customtitle}>
                                        {notTradedDateTime}
                                      </div>
                                    </div>
                                  }
                                  children={
                                    <div className={styles.stepCircle}>
                                      <img
                                        draggable={false}
                                        src={NotTradedIcon}
                                        alt="status-icon"
                                        className={styles.circleImg}
                                      />
                                    </div>
                                  }
                                />
                              )}
                            </Stepper>
                          );
                        })()}
                      </div>
                    </div>
                  </Row>
                </>
              )}

              {/* All Others button Scenario's for footer button */}
              <Row className={styles.mainButtonDivClose}>
                <Col>
                  {statusData.label === "Approved" ? (
                    <>
                      <div className={styles.approvedButtonClass}>
                        <CustomButton
                          text={"View Comments"}
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
                          text={"View Comments"}
                          className="big-light-button"
                          onClick={onClickViewModal}
                        />
                        <CustomButton
                          text={"Close"}
                          onClick={onClickPendingClose}
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
                  ) : statusData.label === "Resubmitted" ||
                    statusData.label === "Traded" ? (
                    <CustomButton
                      text={"Close"}
                      className="big-light-button"
                      onClick={onClickPendingClose}
                    />
                  ) : null}
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
