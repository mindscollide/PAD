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
import repeat from "../../../../../../assets/img/repeat.png";
import ApprovedResubmit from "../../../../../../assets/img/ApprovedResubmit.png";
import DeclinedResubmit from "../../../../../../assets/img/DeclinedResubmite.png";

import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../commen/funtions/rejex";
import {
  GetAllLineManagerViewDetailRequest,
  UpdateApprovalRequestStatusLineManager,
} from "../../../../../../api/myApprovalApi";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useNavigate } from "react-router-dom";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

const ViewDetailModal = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailLineManagerModal,
    setViewDetailLineManagerModal,
    isSelectedViewDetailLineManager,
    setNoteGlobalModal,
    setApprovedGlobalModal,
    setViewCommentGlobalModal,
  } = useGlobalModal();

  console.log(
    isSelectedViewDetailLineManager,
    "isSelectedViewDetailLineManager"
  );

  //This is the Global state of Context Api
  const { viewDetailsLineManagerData, setViewDetailsLineManagerData } =
    useMyApproval();

  const { allInstrumentsData, employeeBasedBrokersData } =
    useDashboardContext();

  console.log(viewDetailsLineManagerData, "viewDetailsLineManagerData");

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    viewDetailsLineManagerData?.details?.[0]?.instrumentID
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  console.log(selectedInstrument, "selectedInstrument");

  // To show Note Modal when Click on Declined in ViewDetailLineManager Modal
  const onClickToOpenNoteModal = () => {
    setViewDetailLineManagerModal(false);
    setNoteGlobalModal(true);
  };

  // GETALLVIEWDETAIL OF LINEMANAGER API FUNCTION
  const fetchGetAllViewDataofLineManager = async () => {
    await showLoader(true);
    const requestdata = {
      TradeApprovalID: isSelectedViewDetailLineManager?.approvalID,
    };

    const responseData = await GetAllLineManagerViewDetailRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    //Extract Data from Api and set in the Context State
    if (responseData) {
      setViewDetailsLineManagerData(responseData);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchGetAllViewDataofLineManager();
  }, []);

  // A Function For Fetch api of update Approval Request Status
  const fetchUpdateApprovalsRequest = async () => {
    showLoader(true);

    const requestdata = {
      TradeApprovalID: String(isSelectedViewDetailLineManager?.approvalID),
      StatusID: 2, //Approved Status
    };

    await UpdateApprovalRequestStatusLineManager({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setViewDetailLineManagerModal,
      setApprovedGlobalModal,
      navigate,
    });
  };

  // To open Approved Modal when Click on Approved Button in ViewDetailLineManager Modal
  const onClickToOpenApprovedModal = () => {
    fetchUpdateApprovalsRequest();
  };

  // To open View Comment Line Maneger Modal by click on View COmment button
  const onClickViewCommentModal = () => {
    setViewDetailLineManagerModal(false);
    setViewCommentGlobalModal(true);
  };

  return (
    <>
      <GlobalModal
        visible={viewDetailLineManagerModal}
        width={"942px"}
        centered={true}
        onCancel={() => setViewDetailLineManagerModal(false)}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              {/* Show Heading by Status in View Detail Modal */}
              <Row>
                <Col span={24}>
                  <div
                    className={
                      isSelectedViewDetailLineManager.status === "Approved"
                        ? styles.approvedBorderClass
                        : isSelectedViewDetailLineManager.status === "Declined"
                        ? styles.declinedBorderClass
                        : styles.pendingBorderClass
                    }
                  >
                    {/* This will show when Pending will be Resubmit */}
                    {isSelectedViewDetailLineManager.status === "Resubmit" && (
                      <>
                        <div>
                          <img src={repeat} className={styles.pendingIcon} />
                        </div>
                      </>
                    )}

                    {/* This will show when Approved will be Resubmit */}
                    {/* {isSelectedViewDetailLineManager.status === "Approved" && (
                      <>
                        <div>
                          <img
                            src={ApprovedResubmit}
                            className={styles.pendingIcon}
                          />
                        </div>
                      </>
                    )} */}

                    {/* This will show when Declined will be Resubmit */}
                    {/* {isSelectedViewDetailLineManager.status === "Declined" && (
                      <>
                        <div>
                          <img
                            src={DeclinedResubmit}
                            className={styles.pendingIcon}
                          />
                        </div>
                      </>
                    )} */}

                    <label
                      className={
                        isSelectedViewDetailLineManager.status === "Approved"
                          ? styles.approvedDetailHeading
                          : isSelectedViewDetailLineManager.status ===
                            "Declined"
                          ? styles.declinedDetailHeading
                          : styles.pendingDetailHeading
                      }
                    >
                      {isSelectedViewDetailLineManager.status === "Approved"
                        ? "Approved"
                        : isSelectedViewDetailLineManager.status === "Declined"
                        ? "Declined"
                        : "Pending"}
                    </label>
                  </div>
                </Col>
              </Row>

              {/* Show Approved Status Scenario in View Details Modal */}
              {/* {statusData.label === "Approved" && (
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
              )} */}

              {/* Show Resubmit,Pending,Declined and Not Traded status Sceanrios */}

              <Row
                gutter={[4, 4]}
                style={{
                  marginTop: "13px",
                }}
              >
                <Col span={24}>
                  <div
                    className={styles.backgroundColorOfInstrumentDetailApproved}
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Instrument
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      <>
                        <span className={styles.customTag}>
                          {/* Extract an assetTypeID id which is 1 then show Equity(EQ) */}
                          {viewDetailsLineManagerData?.details?.[0]
                            ?.assetTypeID === "1" && <span>EQ</span>}
                        </span>
                        <span
                          className={styles.viewDetailSubLabelsForInstrument}
                          title={selectedInstrument?.instrumentCode}
                        >
                          {selectedInstrument?.instrumentCode}
                        </span>
                      </>
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
                      Requester Name
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsLineManagerData?.requesterName}
                      {/* {typeof viewDetailsLineManagerData?.requesterName ===
                      "string" ? (
                        <label className={styles.viewDetailSubLabels}>
                          {viewDetailsLineManagerData?.requesterName}
                        </label>
                      ) : null} */}
                    </label>
                  </div>
                </Col>

                {isSelectedViewDetailLineManager.status === "Resubmit" ? (
                  // When status is Approved and Declined Resubmitted
                  // isSelectedViewDetailLineManager.status === "Approved"
                  // isSelectedViewDetailLineManager.status === "Declined"
                  <>
                    <Col span={6}>
                      <div className={styles.backgrounColorOfDetail}>
                        <label className={styles.viewDetailMainLabels}>
                          Approval ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          {dashBetweenApprovalAssets("REQ709")}
                        </label>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className={styles.backgrounColorOfDetail}>
                        {/* You can duplicate or modify the content here as needed */}
                        <label className={styles.viewDetailMainLabels}>
                          Previous req ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          <u style={{ color: "#30426a", cursor: "pointer" }}>
                            {dashBetweenApprovalAssets("REQ709")}
                          </u>
                        </label>
                      </div>
                    </Col>
                  </>
                ) : (
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Approval ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          viewDetailsLineManagerData?.details?.[0]
                            ?.tradeApprovalID
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
                      {viewDetailsLineManagerData?.details?.[0]
                        ?.approvalTypeID === "1" && <span>Buy</span>}
                      {viewDetailsLineManagerData?.details?.[0]
                        ?.approvalTypeID === "2" && <span>Sell</span>}
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
                        viewDetailsLineManagerData?.details?.[0]?.quantity
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
                      2024-10-01
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Asset Class
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsLineManagerData?.assetTypes?.[0]?.title}
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
                      {viewDetailsLineManagerData?.details?.[0]?.brokers?.map(
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
              <Row>
                <div className={styles.mainStepperContainer}>
                  <div
                    className={`${styles.backgrounColorOfStepper} ${
                      (viewDetailsLineManagerData?.hierarchyDetails?.length ||
                        0) <= 3
                        ? styles.centerAlignStepper
                        : styles.leftAlignStepper
                    }`}
                  >
                    {/* Agar loginUserID match krti hai hierarchyDetails ki userID sy to wo wala stepper show nahi hoga */}
                    <Stepper
                      activeStep={Math.max(
                        0,
                        Array.isArray(
                          viewDetailsLineManagerData?.hierarchyDetails
                        )
                          ? viewDetailsLineManagerData.hierarchyDetails.filter(
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
                      {Array.isArray(
                        viewDetailsLineManagerData?.hierarchyDetails
                      ) &&
                        viewDetailsLineManagerData.hierarchyDetails
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
                              case 3:
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
                {isSelectedViewDetailLineManager.status === "Approved" ||
                isSelectedViewDetailLineManager.status === "Declined" ? (
                  <>
                    <Col span={[24]}>
                      <div className={styles.approvedButtonClassViewComment}>
                        <CustomButton
                          text={"View Comment"}
                          className="big-light-button"
                          onClick={onClickViewCommentModal}
                        />
                        <CustomButton
                          text={"Close"}
                          onClick={() => setViewDetailLineManagerModal(false)}
                          className="big-light-button"
                        />
                      </div>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col>
                      <div className={styles.approvedButtonClass}>
                        <CustomButton
                          text={"Decline"}
                          onClick={onClickToOpenNoteModal}
                          className="Decline-dark-button"
                        />
                        <CustomButton
                          text={"Approve"}
                          onClick={onClickToOpenApprovedModal}
                          className="Approved-dark-button"
                        />
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </div>
          </>
        }
      />
    </>
  );
};

export default ViewDetailModal;
