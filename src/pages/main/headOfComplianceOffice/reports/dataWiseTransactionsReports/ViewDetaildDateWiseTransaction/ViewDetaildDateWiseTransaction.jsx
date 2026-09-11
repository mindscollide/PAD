/**
 * ViewDetaildDateWiseTransaction
 * ---------------------------------------------
 * This component renders a detailed modal view
 * for a selected reconcile transaction.
 *
 * Features:
 * - Displays transaction details based on workflow status
 * - Shows approval hierarchy using a stepper
 * - Allows compliance / non-compliance actions
 * - Integrates ticket viewing & comments
 */

import React from "react";
import { Col, Row, Tooltip } from "antd";
import { Stepper, Step } from "react-form-stepper";

/* ========================== CONTEXTS ========================== */
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { useReconcileContext } from "../../../../../../context/reconsileContax";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

/* ========================== COMPONENTS ========================== */
import { GlobalModal } from "../../../../../../components";
import CustomButton from "../../../../../../components/buttons/button";

/* ========================== HELPERS ========================== */
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  convertUTCToCurrentTimeZone,
} from "../../../../../../common/funtions/rejex";

/* ========================== ASSETS ========================== */
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";
import EscaltedOn from "../../../../../../assets/img/EscaltedOn.png";

/* ========================== STYLES ========================== */
import styles from "./ViewDetaildDateWiseTransaction.module.css";

const ViewDetaildDateWiseTransaction = () => {
  /* ========================== GLOBAL MODAL STATE ========================== */
  const { isViewComments, setIsViewComments, setNoteGlobalModal } =
    useGlobalModal();

  /* ========================== CONTEXT DATA ========================== */
  const { reconcileTransactionViewDetailData } = useReconcileContext();

  const { allInstrumentsData } = useDashboardContext();

  /* ========================== USER SESSION ========================== */
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  /* ================================================================
     STATUS HANDLING
     Maps workflow status ID to UI styles & labels
  ================================================================= */
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
          label: "Non-Compliant",
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

  const statusData = getStatusStyle(
    String(reconcileTransactionViewDetailData?.workFlowStatus?.workFlowStatusID)
  );

  /* ========================== INSTRUMENT ========================== */
  const instrumentId = Number(
    reconcileTransactionViewDetailData?.details?.[0]?.instrumentID
  );

  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  /* ========================== BUTTON STATES ========================== */
  const isTicketUploaded =
    reconcileTransactionViewDetailData?.ticketUploaded === false;

  /* ========================== NOTES ==========================
     Note text can still carry a trailing internal "CO<id>" tracking
     suffix (e.g. "...marking this as Compliant CO6") - stripped
     server-side per 2026-08-06_datewise_transaction_viewdetails_notes_
     shape.md, but that fix isn't deployed yet, so strip it defensively
     here too rather than showing an ID the viewer never needs to see. */
  const stripInternalIdSuffix = (text) =>
    (text || "").replace(/\s*CO\d+\s*$/i, "").trim();

  /* ========================== ACTION BY ==========================
     actionBy is an array of {userID, firstName, lastName, fullName} - every
     distinct user who has actually acted on this workflow. New field
     (2026-08-06_datewise_transaction_viewdetails_srs_fields.md) - replaces
     the old hierarchyDetails[0] read below, which was scoped only to the
     requesting user's own bundle row ("what's my status"), not "who
     actually took the last action". Same "single name / Multiple Users +
     tooltip" convention used elsewhere in the app. */
  const actionByList = Array.isArray(
    reconcileTransactionViewDetailData?.actionBy
  )
    ? reconcileTransactionViewDetailData.actionBy
    : [];
  const actionByNames = actionByList.map((u) => u?.fullName).filter(Boolean);
  const actionByDisplay =
    actionByNames.length > 1 ? "Multiple Users" : actionByNames[0] || "—";
  const actionByFullNames = actionByNames.join(", ");

  /* ========================== HIERARCHY / ESCALATION TRAIL ==========================
     ADDED (API_Changes/2026-09-11_dateWise_viewdetails_escalation_history_
     added.md): mirrors CO's own sibling modal (same doc, same underlying
     endpoint via DateWiseTransactionReportViewDetails) - one
     chronologically-sorted trail built from escalations[] (each entry
     contributing an "Escalated on X" step, then either "Awaiting for
     action" if still open or a "Marked Compliant/Non-Compliant by X"
     resolution step) plus any hierarchyDetails rows not already covered
     by an escalation. */
  const buildHierarchyTrail = () => {
    const hierarchyDetails =
      reconcileTransactionViewDetailData?.hierarchyDetails || [];
    const escalations = reconcileTransactionViewDetailData?.escalations || [];

    const rawTimestamp = (date, time) => `${date || ""}${time || ""}`;

    const escalatedUserIDs = new Set(
      escalations.map((e) => e?.escalatedFromID).filter((id) => id != null)
    );

    const steps = [];

    escalations.forEach((esc) => {
      const escalatedByYou = esc?.escalatedFromID === loggedInUserID;
      steps.push({
        sortKey: rawTimestamp(esc?.escalatedOnDate, esc?.escalatedOnTime),
        iconSrc: EscaltedOn,
        title: escalatedByYou
          ? "Escalated on You"
          : `Escalated on ${esc?.escalatedFrom}`,
        date: convertUTCToCurrentTimeZone(
          esc?.escalatedOnDate,
          esc?.escalatedOnTime
        ),
      });

      if (!esc?.escalationClosedBy) {
        steps.push({
          sortKey:
            rawTimestamp(esc?.escalatedOnDate, esc?.escalatedOnTime) + "1",
          iconSrc: EllipsesIcon,
          title: "Awaiting for action",
          date: "",
        });
        return;
      }

      // escalatedClosedOn is a combined ISO string
      // ("YYYY-MM-DDTHH:mm:ss"), unlike the split yyyyMMdd/HHmmss fields
      // used elsewhere - reshape it into the same two-part format first.
      const [closedDatePart, closedTimePart] = (
        esc?.escalatedClosedOn || ""
      ).split("T");
      const closedDate = closedDatePart?.replace(/-/g, "") || "";
      const closedTime = closedTimePart?.replace(/:/g, "") || "";

      const matchingPerson = hierarchyDetails.find(
        (p) =>
          p.userID === esc?.escalatedFromID &&
          rawTimestamp(p.modifiedDate, p.modifiedTime) ===
            `${closedDate}${closedTime}`
      );
      const isNonCompliant = matchingPerson?.bundleStatusID === 3;
      const closedByYou = esc?.escalationClosedBy === loggedInUserID;

      steps.push({
        sortKey: `${closedDate}${closedTime}`,
        iconSrc: isNonCompliant ? CrossIcon : CheckIcon,
        title: closedByYou
          ? isNonCompliant
            ? "Marked Non-Compliant by You"
            : "Marked Compliant by You"
          : `Marked ${isNonCompliant ? "Non-Compliant" : "Compliant"} by ${
              esc?.escalationClosedByName
            }`,
        date: convertUTCToCurrentTimeZone(closedDate, closedTime),
      });
    });

    hierarchyDetails
      .filter((person) => !escalatedUserIDs.has(person.userID))
      .forEach((person) => {
        const { fullName, bundleStatusID, modifiedDate, modifiedTime, userID } =
          person;
        const formattedDateTime = convertUTCToCurrentTimeZone(
          modifiedDate,
          modifiedTime
        );
        const isYou = userID === loggedInUserID;

        if (bundleStatusID === 2) {
          steps.push({
            sortKey: rawTimestamp(modifiedDate, modifiedTime),
            iconSrc: CheckIcon,
            title: isYou ? "Marked Compliant by You" : fullName,
            date: formattedDateTime,
          });
        } else if (bundleStatusID === 3) {
          steps.push({
            sortKey: rawTimestamp(modifiedDate, modifiedTime),
            iconSrc: CrossIcon,
            title: isYou ? "Marked Non-Compliant by You" : fullName,
            date: formattedDateTime,
          });
        } else {
          steps.push({
            sortKey:
              rawTimestamp(modifiedDate, modifiedTime) || "99999999999999",
            iconSrc: EllipsesIcon,
            title: "Awaiting for action",
            date: "",
          });
        }
      });

    steps.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    return steps;
  };

  const hierarchyTrail = buildHierarchyTrail();

  /* ========================== ACTION HANDLERS ========================== */
  const closedModal = () => {
    setIsViewComments(false);
  };

  /* ================================================================
     RENDER
  ================================================================= */
  return (
    <GlobalModal
      visible={isViewComments}
      width="942px"
      centered
      onCancel={() => {
        setIsViewComments(false);
        setNoteGlobalModal({ visible: false, action: null });
      }}
      modalHeader={<></>}
      modalBody={
        <div className={styles.modalBodyWrapper}>
          {/* ========================== STATUS HEADER ========================== */}
          <Row>
            <Col span={24}>
              <div className={statusData.divClassName}>
                <label className={statusData.labelClassName}>
                  {statusData.label}
                </label>
              </div>
            </Col>
          </Row>

          {/* ========================== CONTENT ========================== */}
          <div className={styles.modalBodyContentScroller}>
            {/* Instrument - full row (Transaction ID moved to the Quantity
                slot below, freeing this row up) */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={24}>
                <div
                  className={styles.backgroundColorOfInstrumentDetailApproved}
                >
                  <label className={styles.viewDetailMainLabels}>
                    Instrument
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    <span className={styles.customTag}>EQ</span>{" "}
                    <span
                      title={selectedInstrument?.instrumentName}
                      className={styles.viewDetailSubLabelsForInstrument}
                    >
                      {`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
                    </span>
                  </label>
                </div>
              </Col>
            </Row>
            {/* Transaction ID (moved here from the Instrument row) & Type */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Transaction ID
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {dashBetweenApprovalAssets(
                      reconcileTransactionViewDetailData?.details?.[0]
                        ?.tradeApprovalID
                    )}
                  </label>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>Type</label>
                  <label className={styles.viewDetailSubLabels}>
                    {reconcileTransactionViewDetailData?.details[0]
                      ?.assetTypeID === "1"
                      ? "Buy"
                      : "Sell"}
                  </label>
                </div>
              </Col>
            </Row>
            {/* Employee Name & Quantity (moved here from above; Employee ID
                removed - not required) */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Employee Name
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {reconcileTransactionViewDetailData?.requesterName}
                  </label>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Approved Quantity
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {Number(
                      reconcileTransactionViewDetailData?.details[0]?.quantity
                    ).toLocaleString("en-US")}
                  </label>
                </div>
              </Col>
            </Row>
            {/* 	Transaction Date & 	Action  Date */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Transaction Date
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {reconcileTransactionViewDetailData?.transactionDate
                      ? formatApiDateTime(
                          [
                            reconcileTransactionViewDetailData?.transactionDate,
                            reconcileTransactionViewDetailData?.transactionTime,
                          ]
                            .filter(Boolean)
                            .join(" ")
                        )
                      : "—"}
                  </label>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Action Date
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {reconcileTransactionViewDetailData?.actionDate
                      ? formatApiDateTime(
                          [
                            reconcileTransactionViewDetailData?.actionDate,
                            reconcileTransactionViewDetailData?.actionTime,
                          ]
                            .filter(Boolean)
                            .join(" ")
                        )
                      : "—"}
                  </label>
                </div>
              </Col>
            </Row>
            {/* Action by */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Action by
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    <Tooltip title={actionByFullNames || actionByDisplay}>
                      <span>{actionByDisplay}</span>
                    </Tooltip>
                  </label>
                </div>
              </Col>

              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Shares Traded
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {Number(
                      reconcileTransactionViewDetailData
                        ?.complianceMappedTradeSummary[0]?.sharesTraded
                    ).toLocaleString("en-US")}
                  </label>
                </div>
              </Col>
            </Row>
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={24}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>Notes</label>
                  <label className={styles.viewDetailSubLabels}>
                    {/* approvalComments/rejectionComment are now arrays of
                        {userID, name, comments} - every actor's note, not
                        just the caller's own (2026-08-06_datewise_
                        transaction_viewdetails_notes_shape.md). */}
                    {reconcileTransactionViewDetailData?.details?.[0]
                      ?.approvalComments?.length > 0 &&
                      reconcileTransactionViewDetailData.details[0].approvalComments.map(
                        (comment, index) => (
                          <div key={`approval-${index}`}>
                            <strong>{comment?.name}:</strong>{" "}
                            {stripInternalIdSuffix(comment?.comments)}
                          </div>
                        )
                      )}

                    {reconcileTransactionViewDetailData?.details?.[0]
                      ?.rejectionComment?.length > 0 &&
                      reconcileTransactionViewDetailData.details[0].rejectionComment.map(
                        (comment, index) => (
                          <div key={`rejection-${index}`}>
                            <strong>{comment?.name}:</strong>{" "}
                            {stripInternalIdSuffix(comment?.comments)}
                          </div>
                        )
                      )}
                  </label>
                </div>
              </Col>
            </Row>

            {/* ========================== HIERARCHY / ESCALATION TRAIL ========================== */}
            {hierarchyTrail.length > 0 && (
              <Row>
                <div className={styles.mainStepperContainer}>
                  <div
                    className={`${styles.backgrounColorOfStepper} ${
                      hierarchyTrail.length <= 3
                        ? styles.centerAlignStepper
                        : styles.leftAlignStepper
                    }`}
                  >
                    <Stepper
                      activeStep={Math.max(0, hierarchyTrail.length - 1)}
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
                      {hierarchyTrail.map((step, index) => (
                        <Step
                          key={index}
                          label={
                            <div
                              className={`${styles.customlabel} ${
                                step.date ? styles.centerAlignLabel : ""
                              }`}
                            >
                              <div className={styles.customtitle}>
                                {step.title}
                              </div>
                              <div
                                className={`${styles.customdesc} ${
                                  step.date ? styles.centerAlignText : ""
                                }`}
                              >
                                {step.date}
                              </div>
                            </div>
                          }
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
                    </Stepper>
                  </div>
                </div>
              </Row>
            )}
          </div>

          {/* ========================== FOOTER ACTIONS ========================== */}
          <Row className={styles.mainButtonDivClose}>
            <Col span={24}>
              <div className={styles.approvedButtonClass}>
                <CustomButton
                  text="Close"
                  className="small-dark-button"
                  onClick={closedModal}
                />
              </div>
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default ViewDetaildDateWiseTransaction;
