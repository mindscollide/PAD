import React, { useEffect, useMemo, useRef } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../../components";
import styles from "./ViewDetailPortfolioTransaction.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../../assets/img/Ellipses.png";
import copyIcon from "../../../../../../../assets/img/copy-dark.png";
import CrossIcon from "../../../../../../../assets/img/Cross.png";
import { useDashboardContext } from "../../../../../../../context/dashboardContaxt";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
  formatTransactionId,
} from "../../../../../../../common/funtions/rejex";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";
import { usePortfolioContext } from "../../../../../../../context/portfolioContax";

const ViewDetailPortfolioTransaction = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailPortfolioTransaction,
    setViewDetailPortfolioTransaction,
    setNoteGlobalModal,
    setViewCommentPortfolioModal,
  } = useGlobalModal();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  //This is the Global state of Context Api
  const { complianceOfficerReconcilePortfolioData } = useReconcileContext();

  const {
    reconcilePortfolioViewDetailData,
    setReconcilePortfolioViewDetailData,
  } = usePortfolioContext();

  const { allInstrumentsData } = useDashboardContext();

  console.log(
    reconcilePortfolioViewDetailData,
    "reconcilePortfolioViewDetailData"
  );

  console.log(
    complianceOfficerReconcilePortfolioData,
    "complianceOfficerReconcilePortfolioData"
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
    String(reconcilePortfolioViewDetailData?.workFlowStatus?.workFlowStatusID)
  );

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    reconcilePortfolioViewDetailData?.details?.[0]?.instrumentID
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  // To Show Note Modal When Click on Compliant on Portfolio Reconcile Click
  const openNoteModalOnCompliantClick = () => {
    setNoteGlobalModal({ visible: true, action: "Portfolio-Compliant" });
    setViewDetailPortfolioTransaction(false);
  };

  // To Show Note Modal When Click on Non-Compliant on Portfolio Reconcile Click
  const openNoteModalOnNonCompliantClick = () => {
    setNoteGlobalModal({ visible: true, action: "Portfolio-Non-Compliant" });
    setViewDetailPortfolioTransaction(false);
  };

  return (
    <>
      <GlobalModal
        visible={viewDetailPortfolioTransaction}
        width={"942px"}
        centered={true}
        onCancel={() => setViewDetailPortfolioTransaction(false)}
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
                    marginTop: "10px",
                  }}
                >
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Instrument
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        <span className={styles.customTag}>
                          {
                            reconcilePortfolioViewDetailData?.assetTypes?.[0]
                              ?.shortCode
                          }
                        </span>{" "}
                        <span
                          className={styles.viewDetailSubLabelsForInstrument}
                          title={selectedInstrument?.instrumentName}
                        >
                          {selectedInstrument?.instrumentCode}
                        </span>
                      </label>
                    </div>
                  </Col>

                  {/* status 2 is Resubmitted */}

                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Portfolio ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {formatTransactionId(
                          reconcilePortfolioViewDetailData?.details?.[0]
                            ?.tradeApprovalID
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
                        {reconcilePortfolioViewDetailData?.requesterName}
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

                        {reconcilePortfolioViewDetailData?.details?.[0]
                          ?.approvalTypeID === "1" && <span>Buy</span>}
                        {reconcilePortfolioViewDetailData?.details?.[0]
                          ?.approvalTypeID === "2" && <span>Sell</span>}
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
                          reconcilePortfolioViewDetailData?.details?.[0]
                            ?.quantity
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
                        {
                          reconcilePortfolioViewDetailData?.assetTypes?.[0]
                            ?.title
                        }
                      </label>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <BrokerList
                      statusData={statusData}
                      viewDetailsData={reconcilePortfolioViewDetailData}
                      variant={"Blue"}
                    />
                  </Col>
                </Row>

                <Row>
                  <div className={styles.mainStepperContainer}>
                    <div
                      className={`${styles.backgrounColorOfStepper} ${
                        (reconcilePortfolioViewDetailData?.hierarchyDetails
                          ?.length || 0) <= 3
                          ? styles.centerAlignStepper
                          : styles.leftAlignStepper
                      }`}
                    >
                      {/* Agar loginUserID match krti hai hierarchyDetails ki userID sy to wo wala stepper show nahi hoga */}
                      <Stepper
                        activeStep={Math.max(
                          0,
                          (reconcilePortfolioViewDetailData?.hierarchyDetails
                            ?.length || 1) - 1
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
                          reconcilePortfolioViewDetailData?.hierarchyDetails
                        ) &&
                          reconcilePortfolioViewDetailData.hierarchyDetails.map(
                            (person, index) => {
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

                              // Decide icon and label
                              let iconSrc;
                              let displayText;
                              let isApprovedOrDeclined = false;

                              if (bundleStatusID === 2) {
                                iconSrc = CheckIcon;
                                displayText =
                                  loggedInUserID === userID
                                    ? "You marked this as compliant"
                                    : `${fullName} `;
                                isApprovedOrDeclined = true;
                              } else if (bundleStatusID === 3) {
                                iconSrc = CrossIcon;
                                displayText =
                                  loggedInUserID === userID
                                    ? "You marked this as non-compliant"
                                    : `${fullName}`;
                                isApprovedOrDeclined = true;
                              } else {
                                iconSrc = EllipsesIcon;
                                displayText = "Awaiting for action";
                              }

                              return (
                                <Step
                                  key={index}
                                  label={
                                    <div
                                      className={`${styles.customlabel} ${
                                        isApprovedOrDeclined
                                          ? styles.centerAlignLabel
                                          : ""
                                      }`}
                                    >
                                      <div className={styles.customtitle}>
                                        {displayText}
                                      </div>
                                      <div
                                        className={`${styles.customdesc} ${
                                          isApprovedOrDeclined
                                            ? styles.centerAlignText
                                            : ""
                                        }`}
                                      >
                                        {bundleStatusID !== 1 &&
                                          formattedDateTime}
                                      </div>
                                    </div>
                                  }
                                >
                                  <div className={styles.stepCircle}>
                                    <img
                                      draggable={false}
                                      src={iconSrc}
                                      alt="status-icon"
                                      className={styles.circleImg}
                                    />
                                  </div>
                                </Step>
                              );
                            }
                          )}
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
                        {" "}
                        <div className={styles.approvedButtonClass}>
                          <CustomButton
                            text={"Non Compliant"}
                            className="Decline-dark-button"
                            onClick={openNoteModalOnNonCompliantClick}
                          />
                          <CustomButton
                            text={"Compliant"}
                            onClick={openNoteModalOnCompliantClick}
                            className="Approved-dark-button"
                          />
                        </div>
                      </>
                    ) : statusData.label === "Compliant" ? (
                      <>
                        <div className={styles.compliantNonCompliant}>
                          <CustomButton
                            text={"View Comment"}
                            onClick={() => {
                              setViewDetailPortfolioTransaction(false);
                              setViewCommentPortfolioModal(true);
                            }}
                            className="big-light-button"
                          />
                          <CustomButton
                            text={"Close"}
                            onClick={() =>
                              setViewDetailPortfolioTransaction(false)
                            }
                            className="big-light-button"
                          />
                        </div>
                      </>
                    ) : statusData.label === "Non Compliant" ? (
                      <>
                        <div className={styles.compliantNonCompliant}>
                          <CustomButton
                            text={"View Comment"}
                            onClick={() => {
                              setViewDetailPortfolioTransaction(false);
                              setViewCommentPortfolioModal(true);
                            }}
                            className="big-light-button"
                          />
                          <CustomButton
                            text={"Close"}
                            onClick={() =>
                              setViewDetailPortfolioTransaction(false)
                            }
                            className="big-light-button"
                          />
                        </div>
                      </>
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

export default ViewDetailPortfolioTransaction;
