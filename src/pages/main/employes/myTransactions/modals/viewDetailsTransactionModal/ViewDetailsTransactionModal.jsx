import React, { useEffect, useRef } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
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

  // GETALLVIEWDETAIL OF Transaction API FUNCTION
  const fetchGetAllViewDataofTransaction = async () => {
    await showLoader(true);

    //WorkFlow Id treat as approvalID
    const requestdata = {
      TradeApprovalID: selectedViewDetailOfTransaction?.workFlowID,
    };
    const responseData = await GetAllTransactionViewDetails({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    //Extract Data from Api and set in the Context State
    if (responseData) {
      setEmployeeTransactionViewDetailData(responseData);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchGetAllViewDataofTransaction();
  }, []);

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
                  <div className={styles.approvedBorderClass}>
                    <label className={styles.approvedDetailHeading}>
                      {"Compliant"}
                    </label>
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
                      {/* {dashBetweenApprovalAssets(
                        variableOfDeatilData?.approvalrequestID
                      )} */}
                      REQ-100
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
                      {variableOfDeatilData?.quantity}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Shared Traded
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {"100,0000"}
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
                  <div className={styles.backgrounColorOfBrokerDetail}>
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
                  </div>
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
                              requestDate,
                              requestTime,
                            } = person;

                            const formattedDateTime = formatApiDateTime(
                              `${requestDate} ${requestTime}`
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
                        className="big-light-button"
                      />
                      <CustomButton
                        text={"View Ticket"}
                        className="big-light-button"
                      />
                      <CustomButton
                        text={"Close"}
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
