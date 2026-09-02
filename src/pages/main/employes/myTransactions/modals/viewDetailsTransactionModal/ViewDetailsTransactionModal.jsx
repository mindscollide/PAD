/**
 * 📄 ViewDetailsTransactionModal.jsx
 *
 * A modal component to display detailed information about a transaction.
 * Integrates with global contexts for modal handling, API calls, notifications, loaders, and transaction data.
 *
 * Features:
 *  - Displays transaction details: Instrument, Approval ID, Transaction ID, Quantity, Type, Asset Class
 *  - Shows hierarchical approval workflow using a stepper
 *  - Supports viewing comments and associated tickets
 *  - Fetches workflow files for ticket view
 *  - Uses status mapping to dynamically apply label text, label style, and border style
 */

import React, { useRef } from "react";
import { Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { Stepper, Step } from "react-form-stepper";

// 🔹 Components & Contexts
import { GlobalModal, BrokerList } from "../../../../../../components";
import CustomButton from "../../../../../../components/buttons/button";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { useTransaction } from "../../../../../../context/myTransaction";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

// 🔹 Assets
import CrossIcon from "../../../../../../assets/img/Cross.png";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import EscalatedIcon from "../../../../../../assets/img/escalated.png";
// ADDED (2026-08-17): stepper-specific "Escalated On" icon, matching the
// convention already used on the compliance-side sibling modals (HOC's
// escalated Transaction/Portfolio view details, HTA's escalated
// requests) - distinct from EscalatedIcon above, which is the small
// badge next to Approval ID, not the hierarchy stepper.
import EscaltedOn from "../../../../../../assets/img/EscaltedOn.png";

// 🔹 Utils & APIs
import {
  convertUTCToCurrentTimeZone,
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../common/funtions/rejex";
import { getStatusConfig } from "./util";
import {
  GetAnnotationOfFilesAttachementAPI,
  GetWorkFlowFilesAPI,
} from "../../../../../../api/fileApi";

// 🔹 Styles
import styles from "./ViewDetailTransactionModal.module.css";

const ViewDetailsTransactionModal = () => {
  // -----------------------
  // 🔹 Hooks & Contexts
  // -----------------------
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const { employeeBasedBrokersData } = useDashboardContext();
  const { employeeTransactionViewDetailData } = useTransaction();

  const {
    viewDetailTransactionModal,
    setViewDetailTransactionModal,
    setViewCommentTransactionModal,
    setIsViewTicketTransactionModal,
    selectedViewDetailOfTransaction,
    setUploadattAchmentsFiles,
  } = useGlobalModal();

  // -----------------------
  // 🔹 Extract Data
  // -----------------------
  const statusId =
    employeeTransactionViewDetailData?.workFlowStatus?.workFlowStatusID;

  // Get label and styles for the current status
  const { label, labelClass, borderClass } = getStatusConfig(statusId) || {
    label: "Unknown",
    labelClass: styles.approvedDetailHeading,
    borderClass: styles.approvedBorderClass,
  };

  const variableOfAssetType =
    employeeTransactionViewDetailData?.assetTypes?.[0];
  const variableOfInstrument =
    employeeTransactionViewDetailData?.details?.[0]?.instrument || null;
  const variableOfDetailData =
    employeeTransactionViewDetailData?.details?.[0] || null;

  const tradedWorkFlowData =
    employeeTransactionViewDetailData?.tradedWorkFlowReqeust?.map((item) => ({
      tradeApprovalID: item.tradeApprovalID,
      quantity: item.quantity,
      tradeWorkFlowID: item.tradeWorkFlowID,
    }));

  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  // REWORKED (2026-08-17): "who escalated it, who approved it" needs real
  // reconciliation between hierarchyDetails and the new escalations[]
  // array
  // (API_Changes/2026-08-17_employee_view_details_hierarchy_escalations.md),
  // not just a per-row lookup - a hierarchyDetails row can be the outcome
  // of an *on-behalf* escalation closure (e.g. an HCA closing it for a
  // reviewer who stalled), so the row's own name is not necessarily who
  // actually acted, and a single reviewer can escalate more than once
  // before finally resolving it themselves. Confirmed against a real
  // response (WF42): all 3 hierarchyDetails rows exactly match the
  // closedOn timestamp of their *last* escalation, and 2 of those 3 were
  // actually closed by someone else (HCA) on their behalf - a plain
  // per-row bundleStatusID switch would have shown the wrong actor (or,
  // as before this rework, incorrectly flagged all 3 rows as "escalated"
  // and dropped their Compliant outcome entirely, since every one of
  // them appears as an escalatedFromID somewhere).
  //
  // Built as one chronologically-sorted trail instead of one step per
  // hierarchyDetails row:
  //  - every escalation contributes an "Escalated by {who}" step, then
  //    either whoever actually closed it (using the matching
  //    hierarchyDetails row's real bundleStatusID only when this closure
  //    IS that reviewer's own final recorded outcome - an earlier,
  //    superseded cycle for the same reviewer has no outcome recorded
  //    anywhere, so it defaults to a generic "resolved" Compliant step,
  //    same simplification the HTA sibling modal's escalation closure
  //    step already makes) or a "waiting" step while still open;
  //  - a hierarchyDetails row that was never escalated gets its own
  //    direct step, unchanged;
  //  - a hierarchyDetails row that WAS escalated is already fully
  //    represented by its escalation's closure step above, so it's not
  //    duplicated here.
  const buildEmployeeHierarchyTrail = () => {
    const hierarchyDetails =
      employeeTransactionViewDetailData?.hierarchyDetails || [];
    const escalations = employeeTransactionViewDetailData?.escalations || [];

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
        date: formatApiDateTime(
          `${esc?.escalatedOnDate} ${esc?.escalatedOnTime}`
        ),
      });

      if (!esc?.escalationClosedBy) {
        steps.push({
          sortKey:
            rawTimestamp(esc?.escalatedOnDate, esc?.escalatedOnTime) + "1",
          iconSrc: EllipsesIcon,
          title: "Waiting for Action",
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
        const formattedDateTime = formatApiDateTime(
          `${modifiedDate} ${modifiedTime}`
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
            title: isYou ? "" : fullName,
            statusText: isYou ? "Waiting for Approval" : "",
            date: isYou ? "" : formattedDateTime,
          });
        }
      });

    steps.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    return steps;
  };

  const hierarchyTrail = buildEmployeeHierarchyTrail();

  // -----------------------
  // 🔹 Handlers
  // -----------------------
  console.log(
    "employeeTransactionViewDetailData",
    employeeTransactionViewDetailData
  );
  /**
   * Fetch workflow files for viewing tickets and open the ticket modal
   */
  const handleViewTicket = async () => {
    showLoader(true);
    try {
      const res = await GetWorkFlowFilesAPI({
        callApi,
        showNotification,
        showLoader,
        requestData: {
          WorkFlowID: employeeTransactionViewDetailData?.TradeApprovalID,
        },
        navigate,
      });

      if (res?.length > 0) {
        // Show the delete icon only for the requesting user's own uploads
        // (fK_UserID on each file, confirmed against a live
        // GetWorkFlowFiles response), and only while the transaction hasn't
        // been verified yet (statusId 8/9 = Compliant / Non-Compliant —
        // once the CO has acted, evidence is locked). DeleteDocument's own
        // _04 ownership check still runs server-side regardless - this is
        // purely to avoid showing a delete affordance on other people's
        // files that would just fail.
        const notYetActioned = ![8, 9].includes(Number(statusId));

        // Add empty blob initially
        const updatedFiles = res.map((file) => ({
          ...file,
          attachmentBlob: "",
          canDelete:
            notYetActioned && String(file.fK_UserID) === String(loggedInUserID),
        }));

        // Work only on the first file
        const firstFile = updatedFiles[0];

        // 🔹 Wait for blob
        const blob = await GetAnnotationOfFilesAttachementAPI({
          callApi,
          showNotification,
          showLoader,
          requestData: { FileID: firstFile.pK_FileID },
          navigate,
        });

        if (blob) {
          // 🔹 Only after blob is ready, update index 0
          updatedFiles[0] = { ...firstFile, attachmentBlob: blob };
        }

        // 🔹 Now set final files in state (with blob injected in 0th index)
        console.log("updatedFiles workflow files", updatedFiles);
        setUploadattAchmentsFiles(updatedFiles);

        // 🔹 Open modal after files are fully ready
        setIsViewTicketTransactionModal(true);
        setViewDetailTransactionModal(false);
      }
    } catch (err) {
      console.error("Failed to fetch workflow files", err);
      showNotification({
        type: "error",
        title: "Error",
        description: "Unable to fetch workflow files.",
      });
    } finally {
      showLoader(false);
    }
  };

  // -----------------------
  // 🔹 Render
  // -----------------------
  return (
    <GlobalModal
      visible={viewDetailTransactionModal}
      width="942px"
      centered
      modalHeader={null}
      onCancel={() => setViewDetailTransactionModal(false)}
      modalBody={
        <div className={styles.modalBodyWrapper}>
          {/* Status Header */}
          <Row>
            <Col span={24}>
              <div className={borderClass}>
                <label className={labelClass}>{label}</label>
              </div>
            </Col>
          </Row>

          {/* Transaction Summary */}
          <Row gutter={[4, 4]} style={{ marginTop: "13px" }}>
            <Col span={24}>
              <div className={styles.backgroundColorOfInstrumentDetailApproved}>
                <label className={styles.viewDetailMainLabels}>
                  Instrument
                </label>
                <label className={styles.viewDetailSubLabels}>
                  <span className={styles.customTag}>
                    {variableOfAssetType?.shortCode}
                  </span>
                  <span
                    className={styles.viewDetailSubLabelsForInstrument}
                    title={variableOfInstrument?.instrumentName}
                  >
                    {`${variableOfInstrument?.instrumentShortCode} - ${variableOfInstrument?.instrumentName}`}
                  </span>
                </label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Approval ID
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <label className={styles.viewDetailSubLabels}>
                    {dashBetweenApprovalAssets(
                      tradedWorkFlowData?.[0]?.tradeApprovalID
                    )}
                  </label>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Transaction ID
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {dashBetweenApprovalAssets(
                    variableOfDetailData?.tradeApprovalID
                  )}
                </label>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfDetail}>
                <label className={styles.viewDetailMainLabels}>Type</label>
                <label className={styles.viewDetailSubLabels}>
                  {variableOfDetailData?.approvalTypeID === "1"
                    ? "Buy"
                    : variableOfDetailData?.approvalTypeID === "2"
                    ? "Sell"
                    : "-"}
                </label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={12}>
              <div className={styles.backgrounColorOfDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Approved Quantity
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {formatNumberWithCommas(variableOfDetailData?.quantity)}
                </label>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.backgrounColorOfDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Shared Traded
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {formatNumberWithCommas(tradedWorkFlowData?.[0]?.quantity)}
                </label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={12}>
              <div className={styles.backgrounColorOfDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Transaction Date
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <label className={styles.viewDetailSubLabels}>
                    {formatApiDateTime(
                      `${selectedViewDetailOfTransaction?.transactionConductedDate} ${selectedViewDetailOfTransaction?.transactionConductedTime}`
                    )}
                  </label>
                  {employeeTransactionViewDetailData?.isEscalated && (
                    <img
                      draggable={false}
                      src={EscalatedIcon}
                      alt="Escalated"
                      data-testid="escalated-icon"
                    />
                  )}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.backgrounColorOfDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Asset Class
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {variableOfAssetType?.title}
                </label>
              </div>
            </Col>
          </Row>

          {/* Broker List */}
          <Row style={{ marginTop: "3px" }}>
            <Col span={24}>
              <BrokerList
                statusData={label}
                // This is a historical/completed transaction record — the
                // brokers chosen at submission time must keep showing even
                // if they've since been unassigned from this employee, so
                // resolve against the full broker master list (type 2:
                // allBrokersData), not the employee's *current* assigned
                // list (type 1, the default), which silently drops brokers
                // that are no longer assigned.
                viewDetailsData={
                  employeeTransactionViewDetailData?.details?.[0]?.brokers
                }
                variant="Blue"
                type={2}
              />
            </Col>
          </Row>

          {/* Approval Stepper */}
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
                      className={styles.stepButtonActive}
                      label={
                        <div className={styles.stepLabelWrapper}>
                          {step.statusText && (
                            <div className={styles.waitingApprovalText}>
                              {step.statusText}
                            </div>
                          )}
                          {step.title && (
                            <div className={styles.customlabel}>
                              <div className={styles.customtitle}>
                                {step.title}
                              </div>
                              <div className={styles.customdesc}>
                                {step.date}
                              </div>
                            </div>
                          )}
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

          {/* Footer Buttons */}
          <Row>
            <Col span={24}>
              <div className={styles.approvedButtonClassViewComment}>
                <CustomButton
                  text="View Comments"
                  className="big-light-button"
                  onClick={() => {
                    setViewCommentTransactionModal(true);
                    setViewDetailTransactionModal(false);
                  }}
                />
                <CustomButton
                  text="View Tickets"
                  className="big-light-button"
                  onClick={handleViewTicket}
                />
                <CustomButton
                  text="Close"
                  className="big-light-button"
                  onClick={() => setViewDetailTransactionModal(false)}
                />
              </div>
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default ViewDetailsTransactionModal;
