import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../../components";
import styles from "./ViewDetailHeadOfComplianceReconcilePortfolio.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../../assets/img/Ellipses.png";
// FIXED (2026-08-17): CrossIcon was referenced below (case 3 /
// Non-Compliant) but never imported - a ReferenceError the moment any
// hierarchy entry had bundleStatusID 3. Same fix category as the sibling
// Transaction modal's missing EscaltedOn import.
import CrossIcon from "../../../../../../../assets/img/Cross.png";
// ADDED (2026-08-17): "Escalated On" step icon. Uses the same
// EscaltedOn.png asset as the HTA sibling modal
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

import { usePortfolioContext } from "../../../../../../../context/portfolioContax";

const ViewDetailHeadOfComplianceReconcilePortfolio = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailHeadOfComplianceEscalatedPortfolio,
    setViewDetailHeadOfComplianceEscalatedPortfolio,
    setNoteGlobalModal,
    setViewCommentPortfolioModal,
  } = useGlobalModal();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  const { isEscalatedPortfolioHeadOfComplianceViewDetailData } =
    usePortfolioContext();

  //This is the Global state of Context Api
  const { headOfComplianceApprovalEscalatedVerificationsData } =
    useReconcileContext();

  const { allInstrumentsData } = useDashboardContext();

  console.log(
    headOfComplianceApprovalEscalatedVerificationsData,
    "headOfComplianceApprovalEscalatedVerificationsData"
  );

  // This is the Status Which is I'm getting from the selectedViewDetail contextApi state
  const getStatusStyle = (status) => {
    console.log(status, "checkStatusessss");
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
      isEscalatedPortfolioHeadOfComplianceViewDetailData?.workFlowStatus
        ?.workFlowStatusID
    )
  );

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    isEscalatedPortfolioHeadOfComplianceViewDetailData?.details?.[0]
      ?.instrumentID
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  //if status is Pending and ticketUpload is false then compliant and Non Compliant is disable
  const disableCompliantOrNonCompliantBtn =
    statusData.label === "Pending" &&
    isEscalatedPortfolioHeadOfComplianceViewDetailData?.ticketUploaded ===
      false;

  // REWORKED (2026-08-17): rebuilt to match the HTA sibling screen's
  // hierarchy handling exactly
  // (headOfTradeApprover/escalatedApprovals/modals/viewDetailHeadOfApprovalModal) -
  // this screen only ever shows requests that have been escalated at
  // least once, so the stepper is built entirely from escalations[]
  // rather than filtering/guessing off the raw hierarchyDetails array.
  // Each escalation contributes exactly two steps - an "Escalated On"
  // step, then either who closed it (escalationClosedBy/
  // escalationClosedByName set) or a "waiting" step while it's still
  // open.
  const escalations = Array.isArray(
    isEscalatedPortfolioHeadOfComplianceViewDetailData?.escalations
  )
    ? isEscalatedPortfolioHeadOfComplianceViewDetailData.escalations
    : [];

  // Escalation closure doesn't carry its own compliant/non-compliant
  // outcome (only who closed it), so cross-reference the closer's own
  // hierarchyDetails entry for their real bundleStatusID - lets the
  // closure step show Compliant vs Non-Compliant correctly instead of
  // collapsing both into one generic "closed" step.
  const hierarchyByUserID = new Map(
    (
      isEscalatedPortfolioHeadOfComplianceViewDetailData?.hierarchyDetails ||
      []
    ).map((person) => [person.userID, person])
  );

  const escalationSteps = escalations.flatMap((esc) => {
    const escalatedStep = {
      key: `${esc?.escalationID}-escalated`,
      iconSrc: EscaltedOn,
      title:
        esc?.escalatedFromID === loggedInUserID
          ? "Escalated by You"
          : `Escalated by ${esc?.escalatedFrom}`,
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

  const onClickFromCompliantNoteModalFromHeadOfCompliance = () => {
    setNoteGlobalModal({ visible: true, action: "HOC-Portfolio-Compliant" });
    setViewDetailHeadOfComplianceEscalatedPortfolio(false);
  };

  const onClickFromNonCompliantNoteModalFromHeadOfCompliance = () => {
    setNoteGlobalModal({
      visible: true,
      action: "HOC-Portfolio-Non-Compliant",
    });
    setViewDetailHeadOfComplianceEscalatedPortfolio(false);
  };

  return (
    <>
      <GlobalModal
        visible={viewDetailHeadOfComplianceEscalatedPortfolio}
        width={"942px"}
        centered={true}
        onCancel={() => setViewDetailHeadOfComplianceEscalatedPortfolio(false)}
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
                {/* Show Resubmit,Pending,Declined and Not Traded status Sceanrios */}
                <Row
                  gutter={[4, 4]}
                  style={{
                    marginTop: "15px",
                  }}
                >
                  {/* status 2 is Resubmitted */}
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Instrument
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        <span className={styles.customTag}>
                          {isEscalatedPortfolioHeadOfComplianceViewDetailData
                            ?.details?.[0]?.assetTypeID === "1" && (
                            <span>EQ</span>
                          )}
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
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Portfolio ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {isEscalatedPortfolioHeadOfComplianceViewDetailData
                          ?.details?.[0]?.tradeApprovalID
                          ? isEscalatedPortfolioHeadOfComplianceViewDetailData.details[0].tradeApprovalID.replace(
                              /^P/,
                              "P-"
                            )
                          : ""}
                      </label>
                    </div>
                  </Col>
                </Row>

                {/* Show Other Scenario's SUb Heading and Field Sceanrio's */}
                <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Requester Name
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {
                          isEscalatedPortfolioHeadOfComplianceViewDetailData?.requesterName
                        }
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

                        {isEscalatedPortfolioHeadOfComplianceViewDetailData
                          ?.details?.[0]?.approvalTypeID === "1" && (
                          <span>Buy</span>
                        )}
                        {isEscalatedPortfolioHeadOfComplianceViewDetailData
                          ?.details?.[0]?.approvalTypeID === "2" && (
                          <span>Sell</span>
                        )}
                      </label>
                    </div>
                  </Col>
                </Row>

                <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Quantity
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {formatNumberWithCommas(
                          isEscalatedPortfolioHeadOfComplianceViewDetailData
                            ?.details?.[0]?.quantity
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
                        {isEscalatedPortfolioHeadOfComplianceViewDetailData
                          ?.details?.[0]?.assetTypeID === "1" && (
                          <span>Equity</span>
                        )}
                      </label>
                    </div>
                  </Col>
                </Row>

                <Row style={{ marginTop: "3px" }}>
                  <Col span={24}>
                    <BrokerList
                      statusData={statusData}
                      viewDetailsData={
                        isEscalatedPortfolioHeadOfComplianceViewDetailData
                          ?.details[0]?.brokers
                      }
                      variant={"Blue"}
                      type={2}
                    />
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
                            label={
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
              </div>

              {/* All Others button Scenario's for footer button */}
              <Row className={styles.mainButtonDivClose}>
                <Col span={[24]}>
                  <>
                    {statusData?.label === "Pending" ? (
                      <>
                        <div className={styles.approvedButtonClass}>
                          <CustomButton
                            text="Non Compliant"
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
                          text="View Comments"
                          className="big-light-button"
                          onClick={() => {
                            setViewCommentPortfolioModal(true);
                            setViewDetailHeadOfComplianceEscalatedPortfolio(
                              false
                            );
                          }}
                        />{" "}
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailHeadOfComplianceEscalatedPortfolio(
                              false
                            );
                          }}
                          className="big-light-button"
                        />
                      </div>
                    ) : statusData?.label === "Compliant" ? (
                      <div className={styles.noncompliantButtonClass}>
                        <CustomButton
                          text="View Comments"
                          className="big-light-button"
                          onClick={() => {
                            setViewCommentPortfolioModal(true);
                            setViewDetailHeadOfComplianceEscalatedPortfolio(
                              false
                            );
                          }}
                        />{" "}
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailHeadOfComplianceEscalatedPortfolio(
                              false
                            );
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

export default ViewDetailHeadOfComplianceReconcilePortfolio;
