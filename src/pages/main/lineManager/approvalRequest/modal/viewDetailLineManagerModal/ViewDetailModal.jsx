import React, { useEffect, useRef } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../components";
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
} from "../../../../../../common/funtions/rejex";
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
    "isSelectedViewDetailLineManager",
  );

  //This is the Global state of Context Api
  const { viewDetailsLineManagerData, setViewDetailsLineManagerData } =
    useMyApproval();

  const { allInstrumentsData, employeeBasedBrokersData } =
    useDashboardContext();

  console.log(viewDetailsLineManagerData, "viewDetailsLineManagerData");

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}",
  );
  const loggedInUserID = userProfileData?.userID;

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    viewDetailsLineManagerData?.details?.[0]?.instrumentID,
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId,
  );

  // To show Note Modal when Click on Declined in ViewDetailLineManager Modal
  const onClickToOpenNoteModal = () => {
    setViewDetailLineManagerModal(false);
    setNoteGlobalModal({ visible: true, action: "Decline" });
  };

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
          label: "Approved",
          labelClassName: styles.approvedDetailHeading,
          divClassName: styles.approvedBorderClass,
        };
      case "3":
        return {
          label: "Declined",
          labelClassName: styles.declinedDetailHeading,
          divClassName: styles.declinedBorderClass,
        };
      default:
        return {
          label: "Pending",
          labelClassName: styles.pendingDetailHeading,
          divClassName: styles.pendingBorderClass,
        };
    }
  };

  const statusDataLM = getStatusStyle(
    String(viewDetailsLineManagerData?.workFlowStatus?.workFlowStatusID),
  );
  console.log("statusDataLM.label", viewDetailsLineManagerData);
  console.log("statusDataLM.label", statusDataLM);
  // When its already approve or ddecline by you then button should be disabled
  const hasAlreadyApprovedOrDeclined =
    viewDetailsLineManagerData?.hierarchyDetails?.some(
      (item) => item.userID === loggedInUserID && item.bundleStatusID === 2, // 2 is approved
    );

  // To open Approved Modal when Click on Approved Button in ViewDetailLineManager Modal
  const onClickToOpenApprovedModal = () => {
    setViewDetailLineManagerModal(false);
    setNoteGlobalModal({ visible: true, action: "Approve" });
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
                  <div className={statusDataLM.divClassName}>
                    <label className={statusDataLM.labelClassName}>
                      {statusDataLM.label}
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
                <Col span={24}>
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgroundColorOfInstrumentDetailApproved
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Instrument
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      <>
                        <span className={styles.customTag}>
                          {/* Extract an assetTypeID id which is 1 then show Equity(EQ) */}
                          {
                            viewDetailsLineManagerData?.assetTypes?.[0]
                              ?.shortCode
                          }
                        </span>
                        <span
                          className={styles.viewDetailSubLabelsForInstrument}
                          title={`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
                        >
                          {`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
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
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Requester Name
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsLineManagerData?.requesterName}
                    </label>
                  </div>
                </Col>

                {isSelectedViewDetailLineManager?.status === "Resubmit" ? (
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
                    <div
                      className={
                        statusDataLM.label === "Traded"
                          ? styles.backgroundColorOfInstrumentDetailTradednoradius
                          : styles.backgrounColorOfDetail
                      }
                    >
                      <label className={styles.viewDetailMainLabels}>
                        Approval ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          viewDetailsLineManagerData?.details?.[0]
                            ?.tradeApprovalID,
                        )}
                      </label>
                    </div>
                  </Col>
                )}
              </Row>

              {/* Show Other Scenario's SUb Heading and Field Sceanrio's */}
              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>Type</label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsLineManagerData?.details?.[0]
                        ?.approvalTypeID === "1" && <span>Buy</span>}
                      {viewDetailsLineManagerData?.details?.[0]
                        ?.approvalTypeID === "2" && <span>Sell</span>}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {formatNumberWithCommas(
                        viewDetailsLineManagerData?.details?.[0]?.quantity,
                      )}
                    </label>
                  </div>
                </Col>
              </Row>

              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Request Date
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {formatApiDateTime(
                        isSelectedViewDetailLineManager?.requestDateTime,
                      )}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    className={
                      statusDataLM.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
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
                  <BrokerList
                    statusData={statusDataLM}
                    variant={"Orange"}
                    viewDetailsData={
                      viewDetailsLineManagerData?.details[0]?.brokers
                    }
                    type={2}
                  />
                </Col>
              </Row>

              {/* This is the Stepper Libarary Section */}
              <Row>
                <div className={styles.mainStepperContainer}>
                  <div
                    className={`${
                      statusDataLM?.label === "Traded"
                        ? styles.TradedbackgrounColorOfStepper
                        : styles.backgrounColorOfStepper
                    } ${
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
                          viewDetailsLineManagerData?.hierarchyDetails,
                        )
                          ? viewDetailsLineManagerData.hierarchyDetails.length -
                              1
                          : 0,
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
                        viewDetailsLineManagerData?.hierarchyDetails,
                      ) &&
                        [...viewDetailsLineManagerData.hierarchyDetails]
                          .sort((a, b) => {
                            if (
                              a.bundleStatusID === 1 &&
                              b.bundleStatusID !== 1
                            )
                              return 1;
                            if (
                              a.bundleStatusID !== 1 &&
                              b.bundleStatusID === 1
                            )
                              return -1;
                            return 0;
                          })
                          .map((person, index) => {
                            const {
                              fullName,
                              bundleStatusID,
                              modifiedDate,
                              modifiedTime,
                              userID,
                            } = person;

                            const formattedDateTime = formatApiDateTime(
                              `${modifiedDate} ${modifiedTime}`,
                            );

                            let iconSrc;
                            let statusText = ""; // Initialize variable for status text
                            let labelContent = null; // Define a variable for label content

                            switch (bundleStatusID) {
                              case 1:
                                // Check if the logged-in user is the same as this person
                                if (loggedInUserID === userID) {
                                  console.log("Check is waiting fro approval");
                                  iconSrc = EllipsesIcon; // Set the ellipses icon for waiting
                                  statusText = "Waiting for Approval"; // Add the status text
                                  labelContent = null; // Don't show name and date when loggedInUserID matches
                                } else {
                                  console.log("Check is waiting fro approval");
                                  iconSrc = EllipsesIcon; // Default icon for case 1
                                  labelContent = (
                                    <div className={styles.customlabel}>
                                      <div className={styles.customtitle}>
                                        {fullName}
                                      </div>
                                      <div className={styles.customdesc}>
                                        {bundleStatusID !== 1 &&
                                          formattedDateTime}
                                      </div>
                                    </div>
                                  );
                                }
                                break;
                              case 2:
                                iconSrc = CheckIcon;
                                if (loggedInUserID === userID) {
                                  labelContent = (
                                    <div className={styles.customlabel}>
                                      <div className={styles.customtitle}>
                                        Approved by You
                                      </div>
                                      <div className={styles.customdesc}>
                                        {formattedDateTime}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  labelContent = (
                                    <div className={styles.customlabel}>
                                      <div className={styles.customtitle}>
                                        {fullName}
                                      </div>
                                      <div className={styles.customdesc}>
                                        {formattedDateTime}
                                      </div>
                                    </div>
                                  );
                                }
                                break;
                              case 3:
                                iconSrc = CrossIcon; // Cross icon for declined
                                if (loggedInUserID === userID) {
                                  labelContent = (
                                    <div className={styles.customlabel}>
                                      <div className={styles.customtitle}>
                                        Declined by You
                                      </div>
                                      <div className={styles.customdesc}>
                                        {formattedDateTime}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  labelContent = (
                                    <div className={styles.customlabel}>
                                      <div className={styles.customtitle}>
                                        {fullName}
                                      </div>
                                      <div className={styles.customdesc}>
                                        {formattedDateTime}
                                      </div>
                                    </div>
                                  );
                                }
                                break;
                              default:
                                iconSrc = EllipsesIcon; // Default icon for other cases
                                labelContent = (
                                  <div className={styles.customlabel}>
                                    <div className={styles.customtitle}>
                                      {fullName}
                                    </div>
                                    <div className={styles.customdesc}>
                                      {formattedDateTime}
                                    </div>
                                  </div>
                                );
                            }

                            return (
                              <Step
                                key={index}
                                className={styles.stepButtonActive}
                                label={
                                  <div className={styles.stepLabelWrapper}>
                                    {statusText && (
                                      <div
                                        className={styles.waitingApprovalText}
                                      >
                                        {statusText}
                                      </div>
                                    )}
                                    {labelContent}
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
                          })}
                    </Stepper>
                  </div>
                </div>
              </Row>

              {/* All Others button Scenario's for footer button */}
              <Row>
                {isSelectedViewDetailLineManager?.status === "Approved" ||
                isSelectedViewDetailLineManager?.status === "Declined" ? (
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
                ) : statusDataLM.label === "Not Traded" ? (
                  <>
                    <Col span={[24]}>
                      <div className={styles.approvedButtonClassViewComment}>
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
                    {!hasAlreadyApprovedOrDeclined && (
                      <>
                        <Col span={[24]}>
                          {statusDataLM?.label === "Pending" ? (
                            <>
                              {" "}
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
                            </>
                          ) : statusDataLM?.label === "Compliant" ? (
                            <>
                              {" "}
                              <div className={styles.CompliantButtonClass}>
                                <CustomButton
                                  text={"View Ticket"}
                                  className="big-light-button"
                                />
                                <CustomButton
                                  text={"close"}
                                  onClick={() =>
                                    setViewDetailLineManagerModal(false)
                                  }
                                  className="big-light-button"
                                />
                              </div>
                            </>
                          ) : null}
                        </Col>
                      </>
                    )}
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
