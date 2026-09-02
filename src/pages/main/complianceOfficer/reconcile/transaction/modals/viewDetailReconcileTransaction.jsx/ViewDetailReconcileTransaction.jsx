import React, { useEffect, useMemo, useRef } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../../components";
import styles from "./ViewDetailReconcileTransaction.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../../assets/img/Cross.png";
import EscalatedIcon from "../../../../../../../assets/img/escalated.png";
// ADDED (2026-08-17): stepper-specific "Escalated On" icon, matching the
// convention used on the sibling employee/HOC/HTA hierarchy steppers -
// distinct from EscalatedIcon above, which is the small badge next to
// Transaction ID, not the hierarchy stepper itself.
import EscaltedOn from "../../../../../../../assets/img/EscaltedOn.png";
import { useDashboardContext } from "../../../../../../../context/dashboardContaxt";
import {
  convertUTCToCurrentTimeZone,
  dashBetweenApprovalAssets,
  formatNumberWithCommas,
} from "../../../../../../../common/funtions/rejex";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";
import {
  GetAnnotationOfFilesAttachementAPI,
  GetWorkFlowFilesAPI,
} from "../../../../../../../api/fileApi";
import { useApi } from "../../../../../../../context/ApiContext";
import { useNotification } from "../../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";

const ViewDetailReconcileTransaction = () => {
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const navigate = useNavigate();

  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailReconcileTransaction,
    setViewDetailReconcileTransaction,
    setNoteGlobalModal,
    setViewCommentReconcileModal,
    setIsViewTicketTransactionModal,
    setUploadComplianceModal,
    setUploadattAchmentsFiles,
  } = useGlobalModal();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  //This is the Global state of Context Api
  const {
    reconcileTransactionViewDetailData,
    selectedReconcileTransactionData,
  } = useReconcileContext();

  const { allInstrumentsData } = useDashboardContext();
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
      case "8":
        return {
          label: "Compliant",
          labelClassName: styles.approvedDetailHeading,
          divClassName: styles.approvedBorderClass,
        };
      case "9":
        return {
          label: "Non Compliant",
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

  //This is how I can pass the status in statusData Variables (workflow-level —
  // only still used for the "Traded" background-styling checks below)
  const statusData = getStatusStyle(
    String(reconcileTransactionViewDetailData?.workFlowStatus?.workFlowStatusID)
  );

  // Header badge + action buttons show the CO's own action (myActionStatusID:
  // 2=Compliant, 3=Non-Compliant), not the overall workFlowStatus — the overall
  // workflow can still be Pending (awaiting other approvers) after this CO
  // already acted on their own level. Map onto the same "8"/"9" codes
  // getStatusStyle already uses for Compliant/Non Compliant labels/styles.
  const myActionStatusID = reconcileTransactionViewDetailData?.myActionStatusID;
  const myActionStatusCode =
    myActionStatusID === 2
      ? "8"
      : myActionStatusID === 3
      ? "9"
      : String(myActionStatusID ?? "");
  const myActionStatusData = getStatusStyle(myActionStatusCode);

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    reconcileTransactionViewDetailData?.details?.[0]?.instrumentID
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  //Button condition on Compliant, Non-Compliant and View Ticket it will be false when ticketUploaded is false
  const isTicketUploaded =
    reconcileTransactionViewDetailData?.ticketUploaded === false;

  // REWORKED (2026-08-17): was truncating hierarchyDetails to "up to and
  // including the logged-in user's own step" and never touched
  // escalations at all - "escalated by whom, approved by whom" was
  // missing entirely, and the API wrapper this data comes from
  // (GetAllTransactionViewDetails in api/myTransactionsApi.jsx) was
  // separately found to be silently dropping the escalations field
  // before it even reached this component (fixed there too). Same
  // reconciliation as the employee's own View Details modal
  // (employes/myTransactions/modals/viewDetailsTransactionModal) - a
  // hierarchyDetails row can be the outcome of an on-behalf escalation
  // closure (e.g. an HCA closing it for a stalled reviewer), so the row's
  // own name isn't necessarily who actually acted, and a reviewer can
  // escalate more than once before finally resolving it. Built as one
  // chronologically-sorted trail instead of one step per hierarchyDetails
  // row - see the employee modal's identical comment for the full
  // reasoning.
  const buildReconcileHierarchyTrail = () => {
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

      // Only trust the Compliant/Non-Compliant outcome from
      // hierarchyDetails when this closure is that reviewer's own final
      // recorded outcome (timestamp match) - an earlier, superseded
      // escalation cycle for the same reviewer has no outcome recorded
      // anywhere, so it defaults to a generic "resolved" Compliant step.
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

  const hierarchyTrail = buildReconcileHierarchyTrail();

  // To Show Note Modal When Click on Compliant Click
  const openNoteModalOnCompliantClick = () => {
    setNoteGlobalModal({ visible: true, action: "Compliant" });
    setViewDetailReconcileTransaction(false);
  };

  // To Show Note Modal When Click on Non-Compliant Click
  const openNoteModalOnNonCompliantClick = () => {
    setNoteGlobalModal({ visible: true, action: "Non-Compliant" });
    setViewDetailReconcileTransaction(false);
  };
  // const handleViewTicket = async () => {
  //   showLoader(true);
  //   const res = await GetWorkFlowFilesAPI({
  //     callApi,
  //     showNotification,
  //     showLoader,
  //     requestData: {
  //       WorkFlowID: selectedReconcileTransactionData.approvalID,
  //     },
  //     navigate,
  //   });
  //   // 🔹 Add blobName = ""
  //   const updatedFiles = res.map((file) => ({
  //     ...file,
  //     attachmentBlob: "",
  //   }));
  //   await setUploadattAchmentsFiles(updatedFiles);
  //   setViewDetailReconcileTransaction(false);
  //   setIsViewTicketTransactionModal(true);
  // };
  const handleViewTicket = async () => {
    showLoader(true);
    try {
      const res = await GetWorkFlowFilesAPI({
        callApi,
        showNotification,
        showLoader,
        requestData: {
          WorkFlowID: selectedReconcileTransactionData.approvalID,
        },
        navigate,
      });

      if (res?.length > 0) {
        // Show the delete icon only for the requesting user's own uploads
        // (fK_UserID on each file, confirmed against a live
        // GetWorkFlowFiles response), and only before this CO has already
        // acted on it (myActionStatusID 2/3 = they already marked it
        // Compliant/Non-Compliant). DeleteDocument's own _04 ownership
        // check still runs server-side regardless - this is purely to
        // avoid showing a delete affordance on other people's files that
        // would just fail.
        const notYetActioned = !(
          myActionStatusID === 2 || myActionStatusID === 3
        );

        // Leave attachmentBlob unset so ViewTicketReconcileModal's own
        // handleSelectFile lazily fetches it per-file on selection.
        const updatedFiles = res.map((file) => ({
          ...file,
          attachmentBlob: "",
          canDelete:
            notYetActioned && String(file.fK_UserID) === String(loggedInUserID),
        }));

        setUploadattAchmentsFiles(updatedFiles);
        setViewDetailReconcileTransaction(false);
        setIsViewTicketTransactionModal(true);
      } else {
        showNotification({
          type: "info",
          title: "No Tickets",
          description: "No ticket files found for this transaction.",
        });
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
  return (
    <>
      <GlobalModal
        visible={viewDetailReconcileTransaction}
        width={"942px"}
        centered={true}
        onCancel={() => {
          setViewDetailReconcileTransaction(false);
          setNoteGlobalModal({ visible: false, action: null });
        }}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              {/* Show Heading by Status in View Detail Modal */}
              <Row>
                <Col span={24}>
                  <div className={myActionStatusData.divClassName}>
                    <label className={myActionStatusData.labelClassName}>
                      {myActionStatusData.label}
                    </label>
                  </div>
                </Col>
              </Row>

              <div className={styles.modalBodyContentScroller}>
                {/* Show Approved Status Scenario in View Details Modal */}

                <Row style={{ marginTop: "12px" }}>
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
                          {reconcileTransactionViewDetailData?.details?.[0]
                            ?.assetTypeID === "1" && <span>EQ</span>}
                        </span>{" "}
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

                {/* Show Resubmit,Pending,Declined and Not Traded status Sceanrios */}
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
                        {reconcileTransactionViewDetailData?.reqeusterName}
                      </label>
                    </div>
                  </Col>

                  {/* status 2 is Resubmitted */}

                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Approval ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          reconcileTransactionViewDetailData
                            ?.tradedWorkFlowReqeust?.[0]?.tradeApprovalID
                        )}
                      </label>
                    </div>
                  </Col>
                </Row>

                {/* Show Other Scenario's SUb Heading and Field Sceanrio's */}
                <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Transaction ID
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
                            reconcileTransactionViewDetailData?.details?.[0]
                              ?.tradeApprovalID
                          )}
                        </label>
                        {reconcileTransactionViewDetailData?.isEscalated && (
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
                    <div
                      className={
                        statusData.label === "Traded"
                          ? styles.backgroundColorOfInstrumentDetailTradednoradius
                          : styles.backgrounColorOfDetail
                      }
                    >
                      <label className={styles.viewDetailMainLabels}>
                        Type
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {/* {selectedViewDetail?.type} */}

                        {reconcileTransactionViewDetailData?.details?.[0]
                          ?.approvalTypeID === "1" && <span>Buy</span>}
                        {reconcileTransactionViewDetailData?.details?.[0]
                          ?.approvalTypeID === "2" && <span>Sell</span>}
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
                        {formatNumberWithCommas(
                          reconcileTransactionViewDetailData
                            ?.tradedWorkFlowReqeust?.[0]?.quantity
                        )}
                      </label>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Shares Traded
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {formatNumberWithCommas(
                          reconcileTransactionViewDetailData?.details?.[0]
                            ?.quantity
                        )}
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
                      <label className={styles.viewDetailSubLabels}>
                        {/* Row value is a combined UTC "YYYYMMDD HHmmss" string */}
                        {convertUTCToCurrentTimeZone(
                          selectedReconcileTransactionData?.transactionDate
                        )}
                      </label>
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
                        {reconcileTransactionViewDetailData?.details?.[0]
                          ?.assetTypeID === "1" && <span>Equity</span>}
                      </label>
                    </div>
                  </Col>
                </Row>

                <Row style={{ marginTop: "3px" }}>
                  <Col span={24}>
                    <BrokerList
                      statusData={statusData}
                      // viewDetailsData={reconcileTransactionViewDetailData}
                      variant={"Blue"}
                      viewDetailsData={
                        reconcileTransactionViewDetailData?.details[0]?.brokers
                      }
                      type={2}
                    />
                  </Col>
                </Row>

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

                {myActionStatusData.label === "Pending" && (
                  <>
                    <Row>
                      <Col span={[24]}>
                        <div className={styles.addticketBuuton}>
                          <CustomButton
                            text={"View Tickets"}
                            className={"big-ViewTicket-light-button"}
                            onClick={() => handleViewTicket()}
                            disabled={isTicketUploaded}
                          />
                          <CustomButton
                            text={"Add Ticket"}
                            onClick={() => {
                              setUploadComplianceModal(true);
                              setViewDetailReconcileTransaction(false);
                            }}
                            className="big-ViewTicket-dark-button"
                          />
                        </div>
                      </Col>
                    </Row>
                  </>
                )}
              </div>

              {/* All Others button Scenario's for footer button */}
              <Row className={styles.mainButtonDivClose}>
                <Col span={[24]}>
                  <>
                    {myActionStatusData.label === "Pending" ? (
                      <>
                        <div className={styles.approvedButtonClass}>
                          <CustomButton
                            text="Non-Compliant"
                            className="Decline-dark-button"
                            disabled={isTicketUploaded}
                            onClick={openNoteModalOnNonCompliantClick}
                          />
                          <CustomButton
                            text="Compliant"
                            className="Approved-dark-button"
                            disabled={isTicketUploaded}
                            onClick={openNoteModalOnCompliantClick}
                          />
                        </div>
                      </>
                    ) : myActionStatusData.label === "Non Compliant" ? (
                      <div className={styles.noncompliantButtonClass}>
                        <CustomButton
                          text="View Tickets"
                          className="big-light-button"
                          onClick={() => {
                            setIsViewTicketTransactionModal(true);
                            setViewDetailReconcileTransaction(false);
                          }}
                        />{" "}
                        <CustomButton
                          text="View Comments"
                          className="big-light-button"
                          onClick={() => {
                            setViewCommentReconcileModal(true);
                            setViewDetailReconcileTransaction(false);
                          }}
                        />{" "}
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailReconcileTransaction(false);
                          }}
                          className="big-light-button"
                        />
                      </div>
                    ) : myActionStatusData.label === "Compliant" ? (
                      <div className={styles.noncompliantButtonClass}>
                        <CustomButton
                          text="View Tickets"
                          className="big-light-button"
                          onClick={() => handleViewTicket()} // no disabled check
                        />
                        <CustomButton
                          text="View Comments"
                          className="big-light-button"
                          onClick={() => {
                            setViewCommentReconcileModal(true);
                            setViewDetailReconcileTransaction(false);
                          }}
                        />{" "}
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailReconcileTransaction(false);
                          }}
                          className="big-light-button"
                        />
                      </div>
                    ) : null}
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

export default ViewDetailReconcileTransaction;
