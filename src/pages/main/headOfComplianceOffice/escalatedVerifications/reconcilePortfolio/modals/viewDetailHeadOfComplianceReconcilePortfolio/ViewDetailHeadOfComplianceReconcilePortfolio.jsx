import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../../components";
import styles from "./ViewDetailHeadOfComplianceReconcilePortfolio.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../../assets/img/Ellipses.png";
import { useDashboardContext } from "../../../../../../../context/dashboardContaxt";
import {
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

  // need to extract and escalatedFrom ID from escalation

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
                        {selectedInstrument?.instrumentCode}
                      </label>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Portfolio ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          isEscalatedPortfolioHeadOfComplianceViewDetailData
                            ?.details?.[0]?.tradeApprovalID
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
                      }
                      variant={"Blue"}
                    />
                  </Col>
                </Row>

                <Row>
                  <div className={styles.mainStepperContainer}>
                    <div
                      className={`${styles.backgrounColorOfStepper} ${
                        (isEscalatedPortfolioHeadOfComplianceViewDetailData
                          ?.hierarchyDetails?.length || 0) <= 3
                          ? styles.centerAlignStepper
                          : styles.leftAlignStepper
                      }`}
                    >
                      {/* Agar loginUserID match krti hai hierarchyDetails ki userID sy to wo wala stepper show nahi hoga */}
                      <Stepper
                        activeStep={Math.max(
                          0,
                          Array.isArray(
                            isEscalatedPortfolioHeadOfComplianceViewDetailData?.hierarchyDetails
                          )
                            ? (isEscalatedPortfolioHeadOfComplianceViewDetailData
                                ?.hierarchyDetails.length > 1
                                ? isEscalatedPortfolioHeadOfComplianceViewDetailData?.hierarchyDetails.filter(
                                    (person) => person.userID !== loggedInUserID
                                  )
                                : isEscalatedPortfolioHeadOfComplianceViewDetailData?.hierarchyDetails
                              ).length - 1 // 🔥 fix here
                            : 0
                        )}
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
                        {Array.isArray(
                          isEscalatedPortfolioHeadOfComplianceViewDetailData?.hierarchyDetails
                        ) &&
                          (isEscalatedPortfolioHeadOfComplianceViewDetailData
                            ?.hierarchyDetails.length > 1
                            ? isEscalatedPortfolioHeadOfComplianceViewDetailData?.hierarchyDetails.filter(
                                (person) => person.userID !== loggedInUserID
                              )
                            : isEscalatedPortfolioHeadOfComplianceViewDetailData?.hierarchyDetails
                          ) // 🔥 fix here
                            .map((person, index) => {
                              const {
                                fullName,
                                bundleStatusID,
                                modifiedDate,
                                modifiedTime,
                                userID,
                              } = person;

                              const formattedDateTime = formatApiDateTime(
                                `${modifiedDate} ${modifiedTime}`
                              );

                              // Decide icon and text based on status
                              let iconSrc;
                              let displayText;

                              switch (bundleStatusID) {
                                case 2: // ✅ Compliant
                                  iconSrc = CheckIcon;
                                  displayText = "You marked this as compliant";
                                  break;
                                case 3: // ❌ Non-Compliant
                                  iconSrc = CrossIcon;
                                  displayText =
                                    "You marked this as non-compliant";
                                  break;
                                case 1: // ⏳ Pending
                                default:
                                  iconSrc = EllipsesIcon;
                                  displayText = fullName;
                              }

                              return (
                                <Step
                                  key={index}
                                  label={
                                    <div
                                      className={`${styles.customlabel} ${
                                        bundleStatusID === 2 || 3
                                          ? styles.centerAlignLabel
                                          : ""
                                      }`}
                                    >
                                      <div className={styles.customtitle}>
                                        {displayText}
                                      </div>
                                      <div
                                        className={`${styles.customdesc} ${
                                          bundleStatusID === 2 || 3
                                            ? styles.centerAlignText
                                            : ""
                                        }`}
                                      >
                                        {bundleStatusID !== 1 &&
                                          formattedDateTime}
                                      </div>
                                    </div>
                                  }
                                  children={
                                    <div className={styles.stepCircle}>
                                      <img
                                        draggable={false}
                                        src={iconSrc}
                                        alt="status-icon"
                                        className={styles.circleImg}
                                      />
                                    </div>
                                  }
                                />
                              );
                            })}
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
                          text="View Comment"
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
                          text="View Comment"
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
