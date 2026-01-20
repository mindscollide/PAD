import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailHeadOfApprovalModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";
import ApprovedResubmit from "../../../../../../assets/img/ApprovedResubmit.png";
import DeclinedResubmit from "../../../../../../assets/img/DeclinedResubmite.png";
import EscaltedOn from "../../../../../../assets/img/EscaltedOn.png";

import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../common/funtions/rejex";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import { useEscalatedApprovals } from "../../../../../../context/escalatedApprovalContext";

const ViewDetailHeadOfApprovalModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailsHeadOfApprovalModal,
    setViewDetailsHeadOfApprovalModal,
    isSelectedViewDetailHeadOfApproval,
    setNoteGlobalModal,
    setViewCommentGlobalModal,
  } = useGlobalModal();

  const { viewDetailsHeadOfApprovalData } = useEscalatedApprovals();

  const { allInstrumentsData } = useDashboardContext();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}",
  );
  const loggedInUserID = userProfileData?.userID;

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    viewDetailsHeadOfApprovalData?.details?.[0]?.instrumentID,
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId,
  );

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
          label: "Not-Compliant",
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

  const statusDataHTA = getStatusStyle(
    String(viewDetailsHeadOfApprovalData?.workFlowStatus?.workFlowStatusID),
  );

  // When its already approve or ddecline by you then button should be disabled
  const hasAlreadyApprovedOrDeclined =
    viewDetailsHeadOfApprovalData?.hierarchyDetails?.some(
      (item) => item.userID === loggedInUserID && item.bundleStatusID === 2, // 2 is approved
    );

  const escalatedFromID =
    viewDetailsHeadOfApprovalData?.escalations?.[0]?.escalatedFromID;

  // To open Approved Modal when Click on Approved Button in ViewDetailLineManager Modal
  const onClickToOpenApprovedModal = () => {
    setNoteGlobalModal({ visible: true, action: "HTA-Approve" });
    setViewDetailsHeadOfApprovalModal(false);
  };

  // To show Note Modal when Click on Declined in ViewDetailLineManager Modal
  const onClickToOpenNoteDeclineModal = () => {
    setNoteGlobalModal({ visible: true, action: "HTA-Decline" });
    setViewDetailsHeadOfApprovalModal(false);
  };

  // To open View Comment Line Maneger Modal by click on View COmment button
  const onClickViewCommentModal = () => {
    setViewDetailsHeadOfApprovalModal(false);
    setViewCommentGlobalModal(true);
  };

  return (
    <>
      <GlobalModal
        visible={viewDetailsHeadOfApprovalModal}
        width={"942px"}
        centered={true}
        onCancel={() => setViewDetailsHeadOfApprovalModal(false)}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              {/* Show Heading by Status in View Detail Modal */}

              <Row>
                <Col span={24}>
                  <div className={statusDataHTA.divClassName}>
                    <label className={statusDataHTA.labelClassName}>
                      {statusDataHTA.label}
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
                    className={styles.backgroundColorOfInstrumentDetailApproved}
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Instrument
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      <>
                        <span className={styles.customTag}>
                          {/* Extract an assetTypeID id which is 1 then show Equity(EQ) */}
                          {viewDetailsHeadOfApprovalData?.details?.[0]
                            ?.assetTypeID === "1" && <span>EQ</span>}
                        </span>
                        <span
                          className={styles.viewDetailSubLabelsForInstrument}
                          title={selectedInstrument?.instrumentName}
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
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Requester Name
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsHeadOfApprovalData?.requesterName}
                    </label>
                  </div>
                </Col>

                {isSelectedViewDetailHeadOfApproval?.status === "Resubmit" ||
                isSelectedViewDetailHeadOfApproval.status === "Approved" ||
                isSelectedViewDetailHeadOfApproval.status === "Declined" ? (
                  // When status is Approved and Declined Resubmitted
                  // isSelectedViewDetailHeadOfApproval.status === "Approved"
                  // isSelectedViewDetailHeadOfApproval.status === "Declined"
                  <>
                    <Col span={6}>
                      <div className={styles.backgrounColorOfDetail}>
                        <label className={styles.viewDetailMainLabels}>
                          Approval ID
                        </label>
                        <label className={styles.viewDetailSubLabels}>
                          {dashBetweenApprovalAssets(
                            viewDetailsHeadOfApprovalData?.details?.[0]
                              ?.tradeApprovalID,
                          )}
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
                          viewDetailsHeadOfApprovalData?.details?.[0]
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
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>Type</label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsHeadOfApprovalData?.details?.[0]
                        ?.approvalTypeID === "1" && <span>Buy</span>}
                      {viewDetailsHeadOfApprovalData?.details?.[0]
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
                      {formatNumberWithCommas(
                        viewDetailsHeadOfApprovalData?.details?.[0]?.quantity,
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
                      {formatApiDateTime(
                        isSelectedViewDetailHeadOfApproval?.requestDateTime,
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
                      {viewDetailsHeadOfApprovalData?.assetTypes?.[0]?.title}
                    </label>
                  </div>
                </Col>
              </Row>

              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <BrokerList
                    statusData={statusDataHTA}
                    variant={"Orange"}
                    viewDetailsData={
                      viewDetailsHeadOfApprovalData?.details[0]?.brokers
                    }
                    type={2}
                  />
                </Col>
              </Row>

              {/* This is the Stepper Libarary Section */}
              <Row>
                <div className={styles.mainStepperContainer}>
                  <div
                    className={`${styles.backgrounColorOfStepper} ${
                      (viewDetailsHeadOfApprovalData?.hierarchyDetails
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
                          viewDetailsHeadOfApprovalData?.hierarchyDetails,
                        )
                          ? viewDetailsHeadOfApprovalData.hierarchyDetails
                              .length - 1
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
                        viewDetailsHeadOfApprovalData?.hierarchyDetails,
                      ) &&
                        [...viewDetailsHeadOfApprovalData.hierarchyDetails]
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

                            // 👉 Escalation condition
                            const isEscalatedUser = userID === escalatedFromID;

                            if (isEscalatedUser) {
                              iconSrc = EscaltedOn;
                              labelContent = (
                                <div className={styles.customlabel}>
                                  <div className={styles.customtitle}>
                                    Escalated On
                                  </div>
                                  <div className={styles.customdesc}>
                                    {formattedDateTime}
                                  </div>
                                </div>
                              );
                            } else {
                              switch (bundleStatusID) {
                                case 1:
                                  iconSrc = EllipsesIcon;
                                  if (loggedInUserID === userID) {
                                    statusText = "Waiting for Approval";
                                  }
                                  labelContent = (
                                    <div className={styles.customlabel}>
                                      <div className={styles.customtitle}>
                                        {loggedInUserID === userID
                                          ? ""
                                          : fullName}
                                      </div>
                                      <div className={styles.customdesc}>
                                        {loggedInUserID === userID
                                          ? ""
                                          : formattedDateTime}
                                      </div>
                                    </div>
                                  );
                                  break;

                                case 2:
                                  iconSrc = CheckIcon;
                                  labelContent = (
                                    <div className={styles.customlabel}>
                                      <div className={styles.customtitle}>
                                        {loggedInUserID === userID
                                          ? "Approved by You"
                                          : fullName}
                                      </div>
                                      <div className={styles.customdesc}>
                                        {formattedDateTime}
                                      </div>
                                    </div>
                                  );
                                  break;

                                default:
                                  iconSrc = EllipsesIcon;
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
                {isSelectedViewDetailHeadOfApproval?.status === "Approved" ||
                isSelectedViewDetailHeadOfApproval?.status === "Declined" ? (
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
                          onClick={() =>
                            setViewDetailsHeadOfApprovalModal(false)
                          }
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
                          {statusDataHTA?.label === "Pending" ? (
                            <>
                              {" "}
                              <div className={styles.approvedButtonClass}>
                                <CustomButton
                                  text={"Decline"}
                                  onClick={onClickToOpenNoteDeclineModal}
                                  className="Decline-dark-button"
                                />
                                <CustomButton
                                  text={"Approve"}
                                  onClick={onClickToOpenApprovedModal}
                                  className="Approved-dark-button"
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

export default ViewDetailHeadOfApprovalModal;
