import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../../components";
import styles from "./ViewDetailHeadOfComplianceReconcileTransaction.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../../assets/img/Cross.png";
// FIXED (2026-08-17): EscaltedOn was referenced (for the "Escalated On"
// step icon) but never imported at all. Uses the same EscaltedOn.png
// asset as the HTA sibling modal
// (headOfTradeApprover/escalatedApprovals/modals/viewDetailHeadOfApprovalModal)
// so the icon matches exactly.
import EscaltedOn from "../../../../../../../assets/img/EscaltedOn.png";
import { useDashboardContext } from "../../../../../../../context/dashboardContaxt";
import {
  convertUTCToCurrentTimeZone,
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../../common/funtions/rejex";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";
import {
  GetAnnotationOfFilesAttachementAPI,
  GetWorkFlowFilesAPI,
} from "../../../../../../../api/fileApi";
import { useGlobalLoader } from "../../../../../../../context/LoaderContext";
import { useNotification } from "../../../../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";

const ViewDetailHeadOfComplianceReconcileTransaction = () => {
  const navigate = useNavigate();

  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailHeadOfComplianceEscalated,
    setViewDetailHeadOfComplianceEscalated,
    setViewCommentReconcileModal,
    setUploadComplianceModal,
    setNoteGlobalModal,
    setIsViewTicketTransactionModal,
    setUploadattAchmentsFiles,
  } = useGlobalModal();
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();

  console.log("requesterName", viewDetailHeadOfComplianceEscalated);
  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  //This is the Global state of Context Api
  const {
    isEscalatedHeadOfComplianceViewDetailData,
    headOfComplianceApprovalEscalatedVerificationsData,
    selectedEscalatedHeadOfComplianceData,
  } = useReconcileContext();

  const { allInstrumentsData } = useDashboardContext();

  console.log(
    isEscalatedHeadOfComplianceViewDetailData,
    "isEscalatedHeadOfComplianceViewDetailData"
  );

  console.log(
    headOfComplianceApprovalEscalatedVerificationsData,
    "headOfComplianceApprovalEscalatedVerificationsData"
  );

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

  //This is how I can pass the status in statusData Variables
  const statusData = getStatusStyle(
    String(
      isEscalatedHeadOfComplianceViewDetailData?.workFlowStatus
        ?.workFlowStatusID
    )
  );

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    isEscalatedHeadOfComplianceViewDetailData?.details?.[0]?.instrumentID
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  //if status is Pending and ticketUpload is false then compliant and Non Compliant is disable
  const disableCompliantOrNonCompliantBtn =
    statusData.label === "Pending" &&
    isEscalatedHeadOfComplianceViewDetailData?.ticketUploaded === false;

  const disableViewAndAddTicketButton =
    statusData.label === "Compliant" || statusData.label === "Non Compliant";

  // REWORKED (2026-08-17): rebuilt to match the HTA sibling screen's
  // hierarchy handling exactly
  // (headOfTradeApprover/escalatedApprovals/modals/viewDetailHeadOfApprovalModal) -
  // this screen only ever shows requests that have been escalated at
  // least once, so the stepper is built entirely from escalations[]
  // rather than filtering/guessing off the raw hierarchyDetails array
  // (the old approach here: filter the logged-in user out of
  // hierarchyDetails, cross-reference escalations[0] only, guess the
  // active step index). Each escalation contributes exactly two steps -
  // an "Escalated On" step, then either who closed it
  // (escalationClosedBy/escalationClosedByName set) or a "waiting"
  // step while it's still open.
  const escalations = Array.isArray(
    isEscalatedHeadOfComplianceViewDetailData?.escalations
  )
    ? isEscalatedHeadOfComplianceViewDetailData.escalations
    : [];

  // Escalation closure doesn't carry its own compliant/non-compliant
  // outcome (EscalationDetail only has EscalationClosedBy/ClosedByName),
  // unlike HTA where every closure just means "approved". Cross-reference
  // the closer's own hierarchyDetails entry for their real bundleStatusID
  // so the closure step can still show Compliant vs Non-Compliant
  // correctly instead of collapsing both into one generic "closed" step.
  const hierarchyByUserID = new Map(
    (isEscalatedHeadOfComplianceViewDetailData?.hierarchyDetails || []).map(
      (person) => [person.userID, person]
    )
  );

  const escalationSteps = escalations.flatMap((esc) => {
    const escalatedStep = {
      key: `${esc?.escalationID}-escalated`,
      iconSrc: EscaltedOn,
      title:
        esc?.escalatedFromID === loggedInUserID
          ? "Escalated on You"
          : `Escalated on ${esc?.escalatedFrom}`,
      desc: formatApiDateTime(
        `${esc?.escalatedOnDate} ${esc?.escalatedOnTime}`
      ),
    };

    // escalatedClosedOn is a combined ISO string ("YYYY-MM-DDTHH:mm:ss"),
    // unlike the split yyyyMMdd/HHmmss fields used elsewhere - reshape it
    // into the same two-part UTC format before converting for display.
    const [closedDatePart, closedTimePart] = (
      esc?.escalatedClosedOn || ""
    ).split("T");

    const closerBundleStatusID = hierarchyByUserID.get(
      esc?.escalationClosedBy
    )?.bundleStatusID;
    const isNonCompliant = closerBundleStatusID === 3;

    const closureStep = esc?.escalationClosedBy
      ? {
          key: `${esc?.escalationID}-closed`,
          iconSrc: isNonCompliant ? CrossIcon : CheckIcon,
          title:
            esc?.escalationClosedBy === loggedInUserID
              ? isNonCompliant
                ? "Marked Non-Compliant by You"
                : "Marked Compliant by You"
              : esc?.escalationClosedByName,
          desc: convertUTCToCurrentTimeZone(
            closedDatePart?.replace(/-/g, ""),
            closedTimePart?.replace(/:/g, "")
          ),
        }
      : {
          key: `${esc?.escalationID}-waiting`,
          iconSrc: EllipsesIcon,
          title: "Waiting for Your Action",
          desc: "",
        };

    return [escalatedStep, closureStep];
  });

  const complianceOfficer =
    isEscalatedHeadOfComplianceViewDetailData?.hierarchyDetails?.find(
      (item) => item.roleID === 4
    );

  const onClickFromCompliantNoteModalFromHeadOfCompliance = () => {
    setNoteGlobalModal({ visible: true, action: "HOC-Compliant" });
    setViewDetailHeadOfComplianceEscalated(false);
  };

  const onClickFromNonCompliantNoteModalFromHeadOfCompliance = () => {
    setNoteGlobalModal({ visible: true, action: "HOC-Non-Compliant" });
    setViewDetailHeadOfComplianceEscalated(false);
  };

  const handleViewTicket = async () => {
    showLoader(true);
    try {
      const res = await GetWorkFlowFilesAPI({
        callApi,
        showNotification,
        showLoader,
        requestData: {
          WorkFlowID: selectedEscalatedHeadOfComplianceData?.workflowID,
        },
        navigate,
      });

      if (res?.length > 0) {
        // Show the delete icon only for the requesting user's own uploads
        // (fK_UserID on each file, confirmed against a live
        // GetWorkFlowFiles response), and only while the transaction is
        // still Pending (statusData is computed above from
        // workFlowStatusID; once it's Compliant/Non-Compliant, HOC has
        // already acted and the evidence is locked). DeleteDocument's own
        // _04 ownership check still runs server-side regardless - this is
        // purely to avoid showing a delete affordance on other people's
        // files that would just fail.
        const notYetActioned = statusData.label === "Pending";

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
        await setUploadattAchmentsFiles(updatedFiles);
        setViewDetailHeadOfComplianceEscalated(false);
        setIsViewTicketTransactionModal(true);
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
        visible={viewDetailHeadOfComplianceEscalated}
        width={"942px"}
        centered={true}
        onCancel={() => setViewDetailHeadOfComplianceEscalated(false)}
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
                          {isEscalatedHeadOfComplianceViewDetailData
                            ?.details?.[0]?.assetTypeID === "1" && (
                            <span>EQ</span>
                          )}
                        </span>{" "}
                        {`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
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
                        {
                          isEscalatedHeadOfComplianceViewDetailData.requesterName
                        }
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
                          isEscalatedHeadOfComplianceViewDetailData
                            ?.tradedWorkFlowRequests?.[0]?.tradeApprovalID
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
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          isEscalatedHeadOfComplianceViewDetailData
                            ?.details?.[0]?.tradeApprovalID
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
                        Type
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {/* {selectedViewDetail?.type} */}

                        {isEscalatedHeadOfComplianceViewDetailData?.details?.[0]
                          ?.approvalTypeID === "1" && <span>Buy</span>}
                        {isEscalatedHeadOfComplianceViewDetailData?.details?.[0]
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
                          isEscalatedHeadOfComplianceViewDetailData
                            ?.tradedWorkFlowRequests?.[0]?.quantity
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
                          isEscalatedHeadOfComplianceViewDetailData
                            ?.details?.[0]?.quantity
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
                        {isEscalatedHeadOfComplianceViewDetailData?.transactionDate &&
                        isEscalatedHeadOfComplianceViewDetailData?.transactionTime
                          ? formatApiDateTime(
                              `${isEscalatedHeadOfComplianceViewDetailData.transactionDate} ${isEscalatedHeadOfComplianceViewDetailData.transactionTime}`
                            )
                          : "—"}
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
                        {isEscalatedHeadOfComplianceViewDetailData?.details?.[0]
                          ?.assetTypeID === "1" && <span>Equity</span>}
                      </label>
                    </div>
                  </Col>
                </Row>

                <Row style={{ marginTop: "3px" }}>
                  <Col span={24}>
                    <BrokerList
                      statusData={statusData}
                      variant={"Blue"}
                      viewDetailsData={
                        isEscalatedHeadOfComplianceViewDetailData?.details[0]
                          ?.brokers
                      }
                      type={2}
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: "5px" }}>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetailCompliance}>
                      <p className={styles.Compliancelabel}>
                        Compliance Officer Name
                      </p>
                      <p className={styles.Compliancevalue}>
                        {complianceOfficer?.fullName || "—"}
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetailCompliance}>
                      <p className={styles.Compliancelabel}>
                        Compliance Officer Email
                      </p>
                      <p className={styles.Compliancevalue}>
                        {complianceOfficer?.email || "—"}
                      </p>
                    </div>
                  </Col>
                </Row>

                <Row>
                  {/* REWORKED (2026-08-17): now built entirely from
                  escalationSteps, mirroring the HTA sibling screen's
                  approach exactly (see escalationSteps above). */}
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
                        {escalationSteps.map((step) => (
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
                        ))}
                      </Stepper>
                    </div>
                  </div>
                  {!disableViewAndAddTicketButton && (
                    <Col span={[24]}>
                      <div className={styles.addticketBuuton}>
                        <CustomButton
                          text={"View Tickets"}
                          className={"big-ViewTicket-light-button"}
                          onClick={handleViewTicket}
                        />
                        <CustomButton
                          text={"Add Ticket"}
                          onClick={() => {
                            setUploadComplianceModal(true);
                            setViewDetailHeadOfComplianceEscalated(false);
                          }}
                          className="big-ViewTicket-dark-button"
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              </div>

              {/* All Others button Scenario's for footer button */}
              <Row className={styles.mainButtonDivClose}>
                <Col span={[24]}>
                  <>
                    {statusData?.label === "Pending" ? (
                      <>
                        <div className={styles.approvedButtonClass}>
                          <CustomButton
                            text="Non-Compliant"
                            className="Decline-dark-button"
                            disabled={disableCompliantOrNonCompliantBtn}
                            onClick={
                              onClickFromNonCompliantNoteModalFromHeadOfCompliance
                            }
                          />
                          <CustomButton
                            text="Compliant"
                            className="Approved-dark-button"
                            disabled={disableCompliantOrNonCompliantBtn}
                            onClick={
                              onClickFromCompliantNoteModalFromHeadOfCompliance
                            }
                          />
                        </div>
                      </>
                    ) : statusData?.label === "Non Compliant" ? (
                      <div className={styles.noncompliantButtonClass}>
                        <CustomButton
                          text="View Tickets"
                          className="big-light-button"
                          onClick={handleViewTicket}
                        />
                        <CustomButton
                          text="View Comments"
                          className="big-light-button"
                          onClick={() => {
                            setViewCommentReconcileModal(true);
                            setViewDetailHeadOfComplianceEscalated(false);
                          }}
                        />
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailHeadOfComplianceEscalated(false);
                          }}
                          className="big-light-button"
                        />
                      </div>
                    ) : statusData?.label === "Compliant" ? (
                      <div className={styles.noncompliantButtonClass}>
                        <CustomButton
                          text="View Tickets"
                          className="big-light-button"
                          onClick={handleViewTicket}
                        />{" "}
                        <CustomButton
                          text="View Comments"
                          className="big-light-button"
                          onClick={() => {
                            // FIXED: was only closing View Details, never
                            // actually opening the comment modal - copy-paste
                            // gap against the Non Compliant branch above,
                            // which does both.
                            setViewCommentReconcileModal(true);
                            setViewDetailHeadOfComplianceEscalated(false);
                          }}
                        />
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailHeadOfComplianceEscalated(false);
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

export default ViewDetailHeadOfComplianceReconcileTransaction;
