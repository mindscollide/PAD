import React, { useEffect, useRef } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { GetAllViewDetailsByTradeApprovalID } from "../../../../../../api/myApprovalApi";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
  formatShowOnlyDate,
} from "../../../../../../commen/funtions/rejex";

const ViewDetailModal = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const { showNotification } = useNotification();

  const { showLoader } = useGlobalLoader();

  const { callApi } = useApi();

  // This is Global State for modal which is create in ContextApi
  const {
    isViewDetail,
    setIsViewDetail,
    selectedViewDetail,
    setIsViewComments,
    setIsConductedTransaction,
    setIsResubmitted,
  } = useGlobalModal();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  //This is the Global state of Context Api
  const { setViewDetailsModalData, viewDetailsModalData } = useMyApproval();

  const { allInstrumentsData, employeeBasedBrokersData } =
    useDashboardContext();

  console.log(viewDetailsModalData, "viewDetailsModalData555");

  console.log(employeeBasedBrokersData, "employeeBasedBrokersDataData555");

  console.log("hierarchyDetails:", viewDetailsModalData?.hierarchyDetails);
  console.log("Type:", typeof viewDetailsModalData?.hierarchyDetails);

  // GETALLVIEWDETAIL API FUNCTION
  const fetchGetAllViewData = async () => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: selectedViewDetail.approvalID };

    const responseData = await GetAllViewDetailsByTradeApprovalID({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    //Extract Data from Api and set in the Context State
    if (responseData) {
      setViewDetailsModalData(responseData);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchGetAllViewData();
  }, []);

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
          labelClassName: styles.approvedDetailHeading,
          divClassName: styles.approvedBorderClass,
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
    viewDetailsModalData?.details?.[0]?.approvalStatus
  );

  console.log(statusData, "statusDatastatusData121");

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(viewDetailsModalData?.details?.[0]?.instrumentID);

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  console.log(selectedInstrument, "selectedInstrument");

  // Extract an brokerName from viewDetailsModalData context Api
  const details = viewDetailsModalData?.details?.[0];
  const selectedBrokers = details?.brokers || [];

  // Match that selected broker Id in viewDetailsModalData and match them with employeeBasedBrokersData context State
  const matchedBrokers = employeeBasedBrokersData.filter(
    (broker) => selectedBrokers.includes(String(broker.brokerID)) // convert brokerID to string
  );

  console.log(matchedBrokers, "CheckceeeerrStatusbroker");

  // To Show View Comments Modal and Closed Declined Modal
  const onClickViewModal = () => {
    setIsViewDetail(false);
    setIsViewComments(true);
  };

  // To Show Modal by click on Conduct Transaction in Approved status
  const onClickOfConductTransaction = () => {
    setIsViewDetail(false);
    setIsConductedTransaction(true);
  };

  //To Close View modal on Pending Status
  const onClickPendingClose = () => {
    setIsViewDetail(false);
  };

  //To Open Modal and close viewDetail modal by clicking on resubmit button in Not Traded status
  const onClickResubmitInNotTradedStatus = () => {
    setIsViewDetail(false);
    setIsResubmitted(true);
  };

  return (
    <>
      <GlobalModal
        visible={isViewDetail}
        width={"942px"}
        centered={true}
        onCancel={() => setIsViewDetail(false)}
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

              {/* Show Approved Status Scenario in View Details Modal */}
              {statusData.label === "Approved" && (
                <>
                  <Row style={{ marginTop: "5px" }}>
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
                          <span className={styles.customTag}>EQ</span> PSO-OCT
                        </label>
                      </div>
                    </Col>
                  </Row>
                </>
              )}

              {/* Show Resubmit,Pending,Declined and Not Traded status Sceanrios */}
              <Row
                gutter={[4, 4]}
                style={{
                  marginTop:
                    // status 1 is Pending
                    statusData.label === "Pending" ||
                    // status 2 is Resubmitted
                    statusData.label === "Resubmitted" ||
                    // status 4 is Declined
                    statusData.label === "Declined" ||
                    // status 6 is Not Traded
                    statusData.label === "Not Traded"
                      ? "16px"
                      : "3px",
                }}
              >
                <Col span={12}>
                  <div
                    className={
                      // status 1 is Pending
                      statusData.label === "Pending" ||
                      // status 2 is Resubmitted
                      statusData.label === "Resubmitted" ||
                      // status 4 is Declined
                      statusData.label === "Declined" ||
                      // status 6 is Not Traded
                      statusData.label === "Not Traded"
                        ? styles.backgrounColorOfInstrumentDetail
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      {/* status 3 is Approved */}
                      {statusData.label === "Approved"
                        ? "Time Remaining to Trade"
                        : "Instrument"}
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {/* status 3 is Approved */}
                      {statusData.label === "Approved" ? (
                        <>{selectedViewDetail?.timeRemaining}</>
                      ) : (
                        <>
                          <span className={styles.customTag}>
                            {/* Extract an assetTypeID id which is 1 then show Equity(EQ) */}
                            {viewDetailsModalData?.details?.[0]?.assetTypeID ===
                              "1" && <span>EQ</span>}
                          </span>
                          <span
                            className={styles.viewDetailSubLabelsForInstrument}
                            title={selectedInstrument?.instrumentName}
                          >
                            {selectedInstrument?.instrumentCode}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </Col>

                {/* status 2 is Resubmitted */}
                {statusData.label === "Resubmitted" ? (
                  <>
                    <Col span={6}>
                      <div
                        className={
                          // status 1 is Pending
                          statusData.label === "Pending" ||
                          // status 4 is Declined
                          statusData.label === "Declined"
                            ? styles.backgrounColorOfApprovalDetail
                            : styles.backgrounColorOfDetail
                        }
                      >
                        <label className={styles.viewDetailMainLabels}>
                          Approval ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          REQ-001
                        </label>
                      </div>
                    </Col>
                    <Col span={6}>
                      {/* You can render some other related info here */}
                      <div
                        className={
                          // status 1 is Pending
                          statusData.label === "1" ||
                          // status 2 is Resubmitted
                          statusData.label === "2"
                            ? styles.backgrounColorOfApprovalDetail
                            : styles.backgrounColorOfDetail
                        }
                      >
                        <label className={styles.viewDetailMainLabels}>
                          Tracking ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          <u>REQ-002</u>
                        </label>
                      </div>
                    </Col>
                  </>
                ) : (
                  <Col span={12}>
                    <div
                      className={
                        // status 1 is Pending
                        statusData.label === "Pending" ||
                        // status 6 is Not Traded
                        statusData.label === "Not Traded"
                          ? styles.backgrounColorOfApprovalDetail
                          : styles.backgrounColorOfDetail
                      }
                    >
                      <label className={styles.viewDetailMainLabels}>
                        Approval ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          viewDetailsModalData?.details?.[0]?.tradeApprovalID
                        )}
                      </label>
                    </div>
                  </Col>
                )}
              </Row>

              {/* Show Other Scenario's SUb Heading and Field Sceanrio's */}
              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>Type</label>
                    <label className={styles.viewDetailSubLabels}>
                      {/* {selectedViewDetail?.type} */}

                      {viewDetailsModalData?.details?.[0]?.approvalTypeID ===
                        "1" && <span>Buy</span>}
                      {viewDetailsModalData?.details?.[0]?.approvalTypeID ===
                        "2" && <span>Sell</span>}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {/* {selectedViewDetail?.quantity} */}
                      {formatNumberWithCommas(
                        viewDetailsModalData?.details?.[0]?.quantity
                      )}
                    </label>
                  </div>
                </Col>
              </Row>

              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Request Date
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {formatApiDateTime(selectedViewDetail?.requestDateTime)}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Asset Class
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      Asset Class{" "}
                    </label>
                  </div>
                </Col>
              </Row>

              {/* <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <div className={styles.backgrounColorOfBrokerDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Brokers
                    </label>
                    <div className={styles.tagContainer}>
                      <Tag className={styles.tagClasses}>
                        AKD Securities Limited
                      </Tag>
                      <Tag className={styles.tagClasses}>
                        K-Trade Securities Ltd
                      </Tag>{" "}
                      <Tag className={styles.tagClasses}>
                        Approval Routing Rules
                      </Tag>
                    </div>
                  </div>
                </Col>
              </Row> */}

              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <div className={styles.backgrounColorOfBrokerDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Brokers
                    </label>
                    <div className={styles.tagContainer}>
                      {viewDetailsModalData?.details?.[0]?.brokers?.map(
                        (brokerId) => {
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
                        }
                      )}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* This is the Stepper Libarary Section */}
              {/* <Row>
                <div className={styles.backgrounColorOfStepper}>
                  <Stepper
                    activeStep={2}
                    connectorStyleConfig={{
                      activeColor: "#00640A", // green line between steps
                      completedColor: "#00640A",
                      disabledColor: "#00640A",
                      size: 1,
                    }}
                    styleConfig={{
                      size: "2em",
                      circleFontSize: "0px", // hide default number
                      labelFontSize: "17px",
                      borderRadius: "50%",
                    }}
                  >
                    {[0, 1, 2].map((step, index) => (
                      <Step
                        key={index}
                        label={
                          <div className={styles.customlabel}>
                            <div className={styles.customtitle}>
                              Emily Johnson
                            </div>
                            <div className={styles.customdesc}>
                              2024-10-01 | 05:30pm
                            </div>
                          </div>
                        }
                        children={
                          <div className={styles.stepCircle}>
                            <img
                              src={CheckIcon}
                              alt="check"
                              className={styles.circleImg}
                            />
                          </div>
                        }
                      />
                    ))}

                    <Step
                      label={
                        <div className={styles.customlabel}>
                          <div className={styles.customtitle}>
                            Emily Johnson
                          </div>
                          <div className={styles.customdesc}>Pending</div>
                        </div>
                      }
                      children={
                        <div className={styles.stepCircle}>
                          <img
                            src={
                              statusData.label === "Declined"
                                ? CrossIcon
                                : EllipsesIcon
                            }
                            className={styles.circleImg}
                            alt="ellipsis"
                          />
                        </div>
                      }
                    />
                  </Stepper>
                </div>
              </Row> */}

              <Row>
                <div className={styles.mainStepperContainer}>
                  <div
                    className={`${styles.backgrounColorOfStepper} ${
                      (viewDetailsModalData?.hierarchyDetails?.length || 0) <= 3
                        ? styles.centerAlignStepper
                        : styles.leftAlignStepper
                    }`}
                  >
                    {/* Agar loginUserID match krti hai hierarchyDetails ki userID sy to wo wala stepper show nahi hoga */}
                    <Stepper
                      activeStep={Math.max(
                        0,
                        Array.isArray(viewDetailsModalData?.hierarchyDetails)
                          ? viewDetailsModalData.hierarchyDetails.filter(
                              (person) => person.userID !== loggedInUserID
                            ).length - 1
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
                      {Array.isArray(viewDetailsModalData?.hierarchyDetails) &&
                        viewDetailsModalData.hierarchyDetails
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

                    {/* <Stepper
                      activeStep={2}
                      connectorStyleConfig={{
                        activeColor: "#00640A", // green line between steps
                        completedColor: "#00640A",
                        disabledColor: "#00640A",
                        size: 1,
                      }}
                      styleConfig={{
                        size: "2em",
                        circleFontSize: "0px", // hide default number
                        labelFontSize: "17px",
                        borderRadius: "50%",
                      }}
                    >
                      {[0, 1, 2, 3].map((step, index) => (
                        <Step
                          key={index}
                          label={
                            <div className={styles.customlabel}>
                              <div className={styles.customtitle}>
                                Emily Johnson
                              </div>
                              <div className={styles.customdesc}>
                                2024-10-01 | 05:30pm
                              </div>
                            </div>
                          }
                          children={
                            <div className={styles.stepCircle}>
                              <img
                                src={CheckIcon}
                                alt="check"
                                className={styles.circleImg}
                              />
                            </div>
                          }
                        />
                      ))}

                      <Step
                        label={
                          <div className={styles.customlabel}>
                            <div className={styles.customtitle}>
                              Emily Johnson
                            </div>
                            <div className={styles.customdesc}>Pending</div>
                          </div>
                        }
                        children={
                          <div className={styles.stepCircle}>
                            <img
                              src={EllipsesIcon}
                              className={styles.circleImg}
                              alt="ellipsis"
                            />
                          </div>
                        }
                      />
                    </Stepper> */}
                  </div>
                </div>
              </Row>

              {/* All Others button Scenario's for footer button */}
              <Row className={styles.mainButtonDivClose}>
                <Col>
                  {statusData.label === "Approved" ? (
                    <>
                      <div className={styles.approvedButtonClass}>
                        <CustomButton
                          text={"View Comment"}
                          className="big-light-button"
                          onClick={onClickViewModal}
                        />
                        <CustomButton
                          text={"Conduct Transaction"}
                          className="big-dark-button"
                          onClick={onClickOfConductTransaction}
                        />
                      </div>
                    </>
                  ) : statusData.label === "Not Traded" ? (
                    <>
                      <div className={styles.approvedButtonClass}>
                        <CustomButton
                          text={"Close"}
                          className="big-light-button"
                          onClick={onClickPendingClose}
                        />
                        <CustomButton
                          text={"Resubmit"}
                          className="big-dark-button"
                          onClick={onClickResubmitInNotTradedStatus}
                        />
                      </div>
                    </>
                  ) : statusData.label === "Declined" ? (
                    <>
                      <div className={styles.approvedButtonClass}>
                        <CustomButton
                          text={"View Comment"}
                          className="big-light-button"
                          onClick={onClickViewModal}
                        />
                        <CustomButton
                          text={"Close"}
                          className="big-light-button"
                        />
                      </div>
                    </>
                  ) : statusData.label === "Pending" ? (
                    <CustomButton
                      text={"Close"}
                      className="big-light-button"
                      onClick={onClickPendingClose}
                    />
                  ) : statusData.label === "Resubmitted" ? (
                    <CustomButton
                      text={"Close"}
                      className="big-light-button"
                      onClick={onClickPendingClose}
                    />
                  ) : (
                    <CustomButton
                      text={"Close"}
                      className="big-light-button"
                      onClick={onClickViewModal}
                    />
                  )}
                </Col>
              </Row>
            </div>
          </>
        }
      />
    </>
  );
};

export default ViewDetailModal;
