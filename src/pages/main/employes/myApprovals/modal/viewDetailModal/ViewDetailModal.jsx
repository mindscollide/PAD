import React, { useMemo } from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../components";
import styles from "./ViewDetailModal.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";
import copyIcon from "../../../../../../assets/img/copy-dark.png";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../commen/funtions/rejex";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import CopyToClipboard from "../../../../../../hooks/useClipboard";

const ViewDetailModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    isViewDetail,
    setIsViewDetail,
    selectedViewDetail,
    setIsViewComments,
    setIsConductedTransaction,
    setIsResubmitted,
  } = useGlobalModal();
  const { showNotification } = useNotification();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  //This is the Global state of Context Api
  const { viewDetailsModalData } = useMyApproval();

  console.log(viewDetailsModalData, "viewDetailsModalData");

  const { allInstrumentsData } = useDashboardContext();

  // Refactor sessionStorage read with useMemo for performance & error handling
  const complianceOfficerDetails = useMemo(() => {
    try {
      const storedData = JSON.parse(
        sessionStorage.getItem("user_Hierarchy_Details") || "[]"
      );

      if (!Array.isArray(storedData)) return {};

      const found = storedData.find(
        (item) =>
          item.roleName === "Compliance Officer (CO)" && item.levelNo === 1
      );

      return found
        ? { managerName: found.managerName, managerEmail: found.managerEmail }
        : {};
    } catch (e) {
      console.error("Invalid JSON in sessionStorage", e);
      return {};
    }
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
    String(viewDetailsModalData?.workFlowStatus?.workFlowStatusID)
  );

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(viewDetailsModalData?.details?.[0]?.instrumentID);

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

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

  //This the Copy Functionality where user can copy email by click on COpyIcon
  const handleCopyEmail = async () => {
    const emailToCopy =
      complianceOfficerDetails?.managerEmail || "compliance@horizoncapital.com";

    try {
      await CopyToClipboard(emailToCopy); // ✅ Use your utility function here
      showNotification({
        type: "success",
        title: "Copied",
        description: "Email copied to clipboard.",
        placement: "bottomLeft",
      });
    } catch (error) {
      console.error("Email Not Copied:", error);
    }
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
                          <span className={styles.customTag}>
                            {viewDetailsModalData?.details?.[0]?.assetTypeID ===
                              "1" && <span>EQ</span>}
                          </span>{" "}
                          {selectedInstrument?.instrumentCode}
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
                    statusData.label === "Not Traded" ||
                    statusData.label === "Traded"
                      ? "16px"
                      : "3px",
                }}
              >
                <Col span={12}>
                  <div
                    className={
                      // status 5 is Traded
                      statusData.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTraded
                        : // status 1 is Pending
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
                        <>{selectedViewDetail?.timeRemainingToTrade}</>
                      ) : (
                        <>
                          <span className={styles.customTag}>
                            {/* Extract an assetTypeID id which is 1 then show Equity(EQ) */}
                            {viewDetailsModalData?.assetTypes?.[0]?.shortCode}
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
                          {dashBetweenApprovalAssets(
                            viewDetailsModalData?.details?.[0]?.tradeApprovalID
                          )}
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
                          <u>
                            {dashBetweenApprovalAssets(
                              viewDetailsModalData?.details?.[0]
                                ?.resubmitRequestTrackingID
                            )}
                          </u>
                        </label>
                      </div>
                    </Col>
                  </>
                ) : (
                  <Col span={12}>
                    <div
                      className={
                        // status 5 is Traded
                        statusData.label === "Traded"
                          ? styles.backgroundColorOfInstrumentDetailTradedRight
                          : // status 1 is Pending
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
                  <div
                    className={
                      statusData.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
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
                  <div
                    className={
                      statusData.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
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
                  <div
                    className={
                      statusData.label === "Traded"
                        ? styles.backgroundColorOfInstrumentDetailTradednoradius
                        : styles.backgrounColorOfDetail
                    }
                  >
                    <label className={styles.viewDetailMainLabels}>
                      Request Date
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {formatApiDateTime(selectedViewDetail?.requestDateTime)}
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
                      {viewDetailsModalData?.assetTypes?.[0]?.title}
                    </label>
                  </div>
                </Col>
              </Row>

              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <BrokerList
                    statusData={statusData}
                    viewDetailsData={viewDetailsModalData}
                    variant={"Orange"}
                  />
                </Col>
              </Row>

              {statusData.label === "Traded" ? (
                <>
                  <Row style={{ marginTop: "16px" }}>
                    <Col span={24}>
                      <label className={styles.complianceOfficerText}>
                        Compliance Officer
                      </label>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "3px" }}>
                    <Col span={24}>
                      <div className={styles.backgrounColorOfConduct}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <label className={styles.complianceHeading}>
                              Name:
                            </label>
                            <div className={styles.complianceSubHeading}>
                              {complianceOfficerDetails?.managerName || "-"}
                            </div>
                          </Col>

                          <Col span={12} style={{ position: "relative" }}>
                            <label className={styles.complianceHeading}>
                              Email:
                            </label>
                            <div className={styles.complianceSubHeading}>
                              {complianceOfficerDetails?.managerEmail || "-"}
                            </div>
                            <div className={styles.copyEmailConductMainClass}>
                              <img
                                draggable={false}
                                src={copyIcon}
                                onClick={handleCopyEmail}
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </>
              ) : (
                <>
                  <Row>
                    <div className={styles.mainStepperContainer}>
                      <div
                        className={`${styles.backgrounColorOfStepper} ${
                          (viewDetailsModalData?.hierarchyDetails?.length ||
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
                              viewDetailsModalData?.hierarchyDetails
                            )
                              ? viewDetailsModalData?.hierarchyDetails.filter(
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
                            viewDetailsModalData?.hierarchyDetails
                          ) &&
                            viewDetailsModalData?.hierarchyDetails
                              .filter(
                                (person) => person.userID !== loggedInUserID
                              )
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
                                  case 3:
                                    iconSrc = CrossIcon;
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
                </>
              )}

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
                          onClick={onClickPendingClose}
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
                  ) : statusData.label === "Resubmitted" ||
                    statusData.label === "Traded" ? (
                    <CustomButton
                      text={"Close"}
                      className="big-light-button"
                      onClick={onClickPendingClose}
                    />
                  ) : null}
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
