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
import { useDashboardContext } from "../../../../../../../context/dashboardContaxt";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../../commen/funtions/rejex";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";
import { usePortfolioContext } from "../../../../../../../context/portfolioContax";

const ViewDetailPortfolioTransaction = () => {
  // This is Global State for modal which is create in ContextApi
  const { viewDetailPortfolioTransaction, setViewDetailPortfolioTransaction } =
    useGlobalModal();

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

  //This the Copy Functionality where user can copy email by click on COpyIcon
  const handleCopyEmail = () => {
    const emailToCopy =
      complianceOfficerDetails?.managerEmail || "compliance@horizoncapital.com";
    navigator.clipboard.writeText(emailToCopy);
    message.success("Email copied to clipboard!");
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
                  <div className={styles.pendingBorderClass}>
                    <label className={styles.pendingDetailHeading}>
                      {/* {statusData.label} */}
                      Pending
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
                          {reconcilePortfolioViewDetailData?.details?.[0]
                            ?.assetTypeID === "1" && <span>EQ</span>}
                        </span>{" "}
                        {selectedInstrument?.instrumentCode}
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
                        P-0231
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
                        {reconcilePortfolioViewDetailData?.details?.[0]
                          ?.assetTypeID === "1" && <span>Equity</span>}
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
                          Array.isArray(
                            reconcilePortfolioViewDetailData?.hierarchyDetails
                          )
                            ? (reconcilePortfolioViewDetailData
                                ?.hierarchyDetails.length > 1
                                ? reconcilePortfolioViewDetailData?.hierarchyDetails.filter(
                                    (person) => person.userID !== loggedInUserID
                                  )
                                : reconcilePortfolioViewDetailData?.hierarchyDetails
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
                          reconcilePortfolioViewDetailData?.hierarchyDetails
                        ) &&
                          (reconcilePortfolioViewDetailData?.hierarchyDetails
                            .length > 1
                            ? reconcilePortfolioViewDetailData?.hierarchyDetails.filter(
                                (person) => person.userID !== loggedInUserID
                              )
                            : reconcilePortfolioViewDetailData?.hierarchyDetails
                          ) // 🔥 fix here
                            .map((person, index) => {
                              const {
                                fullName,
                                bundleStatusID,
                                modifiedDate,
                                modifiedTime,
                              } = person;

                              const formattedDateTime = formatApiDateTime(
                                `${modifiedDate} ${modifiedTime}`
                              );

                              let iconSrc;
                              console.log(
                                bundleStatusID,
                                "CheckerrrrrbundleStatusID"
                              );
                              switch (bundleStatusID) {
                                case 1:
                                  iconSrc = EllipsesIcon;
                                  break;
                                case 2:
                                  iconSrc = CheckIcon;
                                  break;
                                default:
                                  iconSrc = EllipsesIcon;
                              }

                              return (
                                <Step
                                  key={index}
                                  label={
                                    <div className={styles.customlabel}>
                                      <div className={styles.customtitle}>
                                        {fullName}
                                      </div>
                                      <div className={styles.customdesc}>
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
                    <div className={styles.approvedButtonClass}>
                      <CustomButton
                        text={"Non Compliant"}
                        className="Decline-dark-button"
                      />
                      <CustomButton
                        text={"Compliant"}
                        className="Approved-dark-button"
                      />
                    </div>
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
