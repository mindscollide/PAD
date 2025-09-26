import React, { useEffect, useRef } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailTransactionModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { GetAllTransactionViewDetails } from "../../../../../../api/myTransactionsApi";
import { useTransaction } from "../../../../../../context/myTransaction";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../commen/funtions/rejex";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

const ViewDetailsTransactionModal = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailTransactionModal,
    setViewDetailTransactionModal,
    selectedViewDetailOfTransaction,
    setViewCommentTransactionModal,
    setIsViewTicketTransactionModal,
  } = useGlobalModal();

  const { employeeBasedBrokersData } = useDashboardContext();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  //This is Global STate for modal of viewDetail Data in contextApi of transaction
  const {
    employeeTransactionViewDetailData,
    setEmployeeTransactionViewDetailData,
  } = useTransaction();

  console.log(
    "selectedViewDetailOfTransaction",
    employeeTransactionViewDetailData
  );

  // Extract workFlowStatusID from API response
  const statusId =
    employeeTransactionViewDetailData?.workFlowStatus?.workFlowStatusID;

  // Mapping for each status → label text + label style + border style
  const statusConfig = {
    1: {
      label: "Pending",
      labelClass: styles.pendingDetailHeading,
      borderClass: styles.pendingBorderClass,
    },
    2: {
      label: "Resubmit",
      labelClass: styles.resubmittedDetailHeading,
      borderClass: styles.resubmittedBorderClass,
    },
    3: {
      label: "Approved",
      labelClass: styles.approvedDetailHeading,
      borderClass: styles.approvedBorderClass,
    },
    4: {
      label: "Declined",
      labelClass: styles.declinedDetailHeading,
      borderClass: styles.declinedBorderClass,
    },
    5: {
      label: "Traded",
      labelClass: styles.pendingDetailHeading,
      borderClass: styles.pendingBorderClass,
    },
    6: {
      label: "Not-Traded",
      labelClass: styles.notTradedDetailHeading,
      borderClass: styles.notTradedBorderClass,
    },
    8: {
      label: "Compliant",
      labelClass: styles.approvedDetailHeading,
      borderClass: styles.approvedBorderClass,
    },
    9: {
      label: "Non-Compliant",
      labelClass: styles.declinedDetailHeading,
      borderClass: styles.declinedBorderClass,
    },
  };

  // Pick values from mapping using statusId
  // If statusId not found → show fallback "Unknown"
  const { label, labelClass, borderClass } = statusConfig[statusId] || {
    label: "Unknown",
    labelClass: styles.approvedDetailHeading,
    borderClass: styles.approvedBorderClass,
  };

  console.log(typeof label, "checkecehlabelHere");

  // safely extract data from the assetType
  // outside return
  const variableOfAssetType =
    employeeTransactionViewDetailData?.assetTypes?.[0];

  // Extract Instrument outside return
  const variableOfInstrument =
    employeeTransactionViewDetailData?.details?.[0]?.instrument || null;

  //Extract other nonObject data from details
  const variableOfDeatilData =
    employeeTransactionViewDetailData?.details[0] || null;

  console.log(variableOfAssetType, "variableOfAssetType");

  // Extract the trade Apprvoal Request ID data and their quantity
  const tradedWorkFlowDataVariable =
    employeeTransactionViewDetailData.tradedWorkFlowReqeust.map((item) => ({
      tradeApprovalID: item.tradeApprovalID,
      quantity: item.quantity,
      tradeWorkFlowID: item.tradeWorkFlowID,
    }));

  return (
    <>
      <GlobalModal
        visible={viewDetailTransactionModal}
        width={"942px"}
        centered={true}
        onCancel={() => setViewDetailTransactionModal(false)}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              {/* Show Heading by Status in View Detail Modal */}

              <Row>
                <Col span={24}>
                  {/* borderClass and labelClass come from mapping */}
                  <div className={borderClass}>
                    <label className={labelClass}>{label}</label>
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
                <Col span={12}>
                  <div
                    className={styles.backgroundColorOfInstrumentDetailApproved}
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Instrument
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      <>
                        <span className={styles.customTag}>
                          <span>{variableOfAssetType?.shortCode}</span>
                        </span>
                        <span
                          className={styles.viewDetailSubLabelsForInstrument}
                        >
                          {variableOfInstrument?.instrumentShortCode}
                        </span>
                      </>
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfApprovedDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Approval ID
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {dashBetweenApprovalAssets(
                        tradedWorkFlowDataVariable?.[0]?.tradeApprovalID
                      )}
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
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Transaction ID
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {dashBetweenApprovalAssets(
                        variableOfDeatilData?.tradeApprovalID
                      )}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>Type</label>
                    <label className={styles.viewDetailSubLabels}>
                      {variableOfDeatilData?.approvalTypeID === "1" && (
                        <span>Buy</span>
                      )}
                      {variableOfDeatilData?.approvalTypeID === "2" && (
                        <span>Sell</span>
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
                      Approved Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {formatNumberWithCommas(variableOfDeatilData?.quantity)}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Shared Traded
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {formatNumberWithCommas(
                        tradedWorkFlowDataVariable?.[0]?.quantity
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
                      {formatApiDateTime(
                        `${selectedViewDetailOfTransaction?.transactionConductedDate} ${selectedViewDetailOfTransaction?.transactionConductedTime}`
                      )}
                    </label>
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

              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  {/* <div className={styles.backgrounColorOfBrokerDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Brokers
                    </label>
                    <div className={styles.tagContainer}>
                      {variableOfDeatilData?.brokers?.map((brokerId) => {
                        const broker = employeeBasedBrokersData?.find(
                          (b) => String(b.brokerID) === String(brokerId)
                        );
                        console.log(broker, "brokerNamerChecker");
                        return (
                          broker && (
                            <Tag
                              key={broker.brokerID}
                              className={styles.tagClasses}
                            >
                              {broker.brokerName}
                            </Tag>
                          )
                        );
                      })}
                    </div>
                  </div> */}
                  <BrokerList
                    statusData={label}
                    viewDetailsData={employeeTransactionViewDetailData}
                    variant={"Blue"}
                  />
                </Col>
              </Row>

              {/* This is the Stepper Libarary Section */}
              <Row>
                <div className={styles.mainStepperContainer}>
                  <div
                    className={`${styles.backgrounColorOfStepper} ${
                      (employeeTransactionViewDetailData?.hierarchyDetails
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
                          employeeTransactionViewDetailData?.hierarchyDetails
                        )
                          ? employeeTransactionViewDetailData.hierarchyDetails.filter(
                              (person) => person.userID !== loggedInUserID
                            ).length - 1
                          : 0
                      )}
                    >
                      {Array.isArray(
                        employeeTransactionViewDetailData?.hierarchyDetails
                      ) &&
                        employeeTransactionViewDetailData.hierarchyDetails
                          .filter((person) => person.userID !== loggedInUserID)
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
                                      {formattedDateTime}
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

              {/* All Others button Scenario's for footer button */}
              <Row>
                <>
                  <Col span={[24]}>
                    <div className={styles.approvedButtonClassViewComment}>
                      <CustomButton
                        text={"View Comment"}
                        onClick={() => {
                          setViewCommentTransactionModal(true);
                          setViewDetailTransactionModal(false);
                        }}
                        className="big-light-button"
                      />
                      <CustomButton
                        text={"View Ticket"}
                        className="big-light-button"
                        onClick={() => {
                          setIsViewTicketTransactionModal(true);
                          setViewDetailTransactionModal(false);
                        }}
                      />
                      <CustomButton
                        text={"Close"}
                        onClick={() => {
                          setViewDetailTransactionModal(false);
                        }}
                        className="big-light-button"
                      />
                    </div>
                  </Col>
                </>
              </Row>
            </div>
          </>
        }
      />
    </>
  );
};

export default ViewDetailsTransactionModal;
