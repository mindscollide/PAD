import React, { useEffect, useMemo, useRef } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../../components";
import styles from "./ViewDetailHeadOfComplianceReconcileTransaction.module.css";
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
} from "../../../../../../../common/funtions/rejex";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";
import {
  GetAnnotationOfFilesAttachementAPI,
  GetWorkFlowFilesAPI,
} from "../../../../../../../api/fileApi";
import { useGlobalLoader } from "../../../../../../../context/LoaderContext";
import { useNotification } from "../../../../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";

const ViewDetailHeadOfComplianceReconcileTransaction = () => {
  const navigate = useNavigate();

  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailHeadOfComplianceEscalated,
    setViewDetailHeadOfComplianceEscalated,
    setUploadComplianceModal,
    setNoteGlobalModal,
    setIsViewTicketTransactionModal,
    setUploadattAchmentsFiles,
  } = useGlobalModal();
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  //This is the Global state of Context Api
  const {
    isEscalatedHeadOfComplianceViewDetailData,
    headOfComplianceApprovalEscalatedVerificationsData,
    selectedEscalatedHeadOfComplianceData,
  } = useReconcileContext();

  const { allInstrumentsData } = useDashboardContext();

  console.log(
    isEscalatedHeadOfComplianceViewDetailData,
    "isEscalatedHeadOfComplianceViewDetailData"
  );

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
      isEscalatedHeadOfComplianceViewDetailData?.workFlowStatus
        ?.workFlowStatusID
    )
  );

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    isEscalatedHeadOfComplianceViewDetailData?.details?.[0]?.instrumentID
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  //if status is Pending and ticketUpload is false then compliant and Non Compliant is disable
  const disableCompliantOrNonCompliantBtn =
    statusData.label === "Pending" &&
    isEscalatedHeadOfComplianceViewDetailData?.ticketUploaded === false;

  // need to extract and escalatedFrom ID from escalation

  const escalatedFromID =
    isEscalatedHeadOfComplianceViewDetailData?.escalations?.[0]
      ?.escalatedFromID;

  console.log(escalatedFromID, "escalatedFromIDescalatedFromID");

  const complianceOfficer =
    isEscalatedHeadOfComplianceViewDetailData?.hierarchyDetails?.find(
      (item) => item.roleID === 4
    );

  const onClickFromCompliantNoteModalFromHeadOfCompliance = () => {
    setNoteGlobalModal({ visible: true, action: "HOC-Compliant" });
    setViewDetailHeadOfComplianceEscalated(false);
  };

  const onClickFromNonCompliantNoteModalFromHeadOfCompliance = () => {
    setNoteGlobalModal({ visible: true, action: "HOC-Non-Compliant" });
    setViewDetailHeadOfComplianceEscalated(false);
  };

  const handleViewTicket = async () => {
    showLoader(true);
    try {
      const res = await GetWorkFlowFilesAPI({
        callApi,
        showNotification,
        showLoader,
        requestData: {
          WorkFlowID: selectedEscalatedHeadOfComplianceData?.workflowID,
        },
        navigate,
      });

      if (res?.length > 0) {
        // Add empty blob initially
        const updatedFiles = res.map((file) => ({
          ...file,
          attachmentBlob: "",
        }));

        // Work only on the first file
        const firstFile = updatedFiles[0];

        // 🔹 Wait for blob
        const blob = await GetAnnotationOfFilesAttachementAPI({
          callApi,
          showNotification,
          showLoader,
          requestData: { FileID: firstFile.pK_FileID },
          navigate,
        });

        if (blob) {
          // 🔹 Only after blob is ready, update index 0
          updatedFiles[0] = { ...firstFile, attachmentBlob: blob };
        }

        // 🔹 Now set final files in state (with blob injected in 0th index)
        console.log("updatedFiles workflow files", updatedFiles);
        await setUploadattAchmentsFiles(updatedFiles);
        setViewDetailHeadOfComplianceEscalated(false);
        setIsViewTicketTransactionModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch workflow files", err);
      showNotification({
        type: "error",
        title: "Error",
        description: "Unable to fetch workflow files.",
      });
    } finally {
      showLoader(false);
    }
  };

  return (
    <>
      <GlobalModal
        visible={viewDetailHeadOfComplianceEscalated}
        width={"942px"}
        centered={true}
        onCancel={() => setViewDetailHeadOfComplianceEscalated(false)}
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
                {/* Show Approved Status Scenario in View Details Modal */}

                <Row style={{ marginTop: "12px" }}>
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
                          {isEscalatedHeadOfComplianceViewDetailData
                            ?.details?.[0]?.assetTypeID === "1" && (
                            <span>EQ</span>
                          )}
                        </span>{" "}
                        {selectedInstrument?.instrumentCode}
                      </label>
                    </div>
                  </Col>
                </Row>

                {/* Show Resubmit,Pending,Declined and Not Traded status Sceanrios */}
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
                        {"Saif"}
                      </label>
                    </div>
                  </Col>

                  {/* status 2 is Resubmitted */}

                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Approval ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          isEscalatedHeadOfComplianceViewDetailData
                            ?.tradedWorkFlowRequests?.[0]?.tradeApprovalID
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
                        Transaction ID
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {dashBetweenApprovalAssets(
                          isEscalatedHeadOfComplianceViewDetailData
                            ?.details?.[0]?.tradeApprovalID
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
                        Type
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {/* {selectedViewDetail?.type} */}

                        {isEscalatedHeadOfComplianceViewDetailData?.details?.[0]
                          ?.approvalTypeID === "1" && <span>Buy</span>}
                        {isEscalatedHeadOfComplianceViewDetailData?.details?.[0]
                          ?.approvalTypeID === "2" && <span>Sell</span>}
                      </label>
                    </div>
                  </Col>
                </Row>

                <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Approved Quantity
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {formatNumberWithCommas(
                          isEscalatedHeadOfComplianceViewDetailData
                            ?.tradedWorkFlowRequests?.[0]?.quantity
                        )}
                      </label>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetail}>
                      <label className={styles.viewDetailMainLabels}>
                        Shares Traded
                      </label>
                      <label className={styles.viewDetailSubLabels}>
                        {formatNumberWithCommas(
                          isEscalatedHeadOfComplianceViewDetailData
                            ?.details?.[0]?.quantity
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
                          headOfComplianceApprovalEscalatedVerificationsData
                            ?.data[0]?.transactionDate
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
                        {isEscalatedHeadOfComplianceViewDetailData?.details?.[0]
                          ?.assetTypeID === "1" && <span>Equity</span>}
                      </label>
                    </div>
                  </Col>
                </Row>

                <Row style={{ marginTop: "3px" }}>
                  <Col span={24}>
                    <BrokerList
                      statusData={statusData}
                      viewDetailsData={
                        isEscalatedHeadOfComplianceViewDetailData
                      }
                      variant={"Blue"}
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: "5px" }}>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetailCompliance}>
                      <p className={styles.Compliancelabel}>
                        Compliance Officer Name
                      </p>
                      <p className={styles.Compliancevalue}>
                        {complianceOfficer?.fullName || "—"}
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.backgrounColorOfDetailCompliance}>
                      <p className={styles.Compliancelabel}>
                        Compliance Officer Email
                      </p>
                      <p className={styles.Compliancevalue}>
                        {complianceOfficer?.email || "—"}
                      </p>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <div className={styles.mainStepperContainer}>
                    <div
                      className={`${styles.backgrounColorOfStepper} ${
                        (isEscalatedHeadOfComplianceViewDetailData
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
                            isEscalatedHeadOfComplianceViewDetailData?.hierarchyDetails
                          )
                            ? (isEscalatedHeadOfComplianceViewDetailData
                                ?.hierarchyDetails.length > 1
                                ? isEscalatedHeadOfComplianceViewDetailData?.hierarchyDetails.filter(
                                    (person) => person.userID !== loggedInUserID
                                  )
                                : isEscalatedHeadOfComplianceViewDetailData?.hierarchyDetails
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
                          isEscalatedHeadOfComplianceViewDetailData?.hierarchyDetails
                        ) &&
                          (isEscalatedHeadOfComplianceViewDetailData
                            ?.hierarchyDetails.length > 1
                            ? isEscalatedHeadOfComplianceViewDetailData?.hierarchyDetails.filter(
                                (person) => person.userID !== loggedInUserID
                              )
                            : isEscalatedHeadOfComplianceViewDetailData?.hierarchyDetails
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

                              let iconSrc;
                              let statusText = ""; // Initialize variable for status text
                              let labelContent = null; // Define a variable for label content

                              // 👉 Escalation condition
                              const isEscalatedUser =
                                userID === escalatedFromID;

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
                  <Col span={[24]}>
                    <div className={styles.addticketBuuton}>
                      <CustomButton
                        text={"View Ticket"}
                        className={"big-ViewTicket-light-button"}
                        onClick={handleViewTicket}
                      />
                      <CustomButton
                        text={"Add Ticket"}
                        onClick={() => {
                          setUploadComplianceModal(true);
                          setViewDetailHeadOfComplianceEscalated(false);
                        }}
                        className="big-ViewTicket-dark-button"
                      />
                    </div>
                  </Col>
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
                          text="View Ticket"
                          className="big-light-button"
                          onClick={handleViewTicket}
                        />{" "}
                        <CustomButton
                          text="View Comment"
                          className="big-light-button"
                          onClick={() => {
                            setViewDetailHeadOfComplianceEscalated(false);
                          }}
                        />{" "}
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailHeadOfComplianceEscalated(false);
                          }}
                          className="big-light-button"
                        />
                      </div>
                    ) : statusData?.label === "Compliant" ? (
                      <div className={styles.noncompliantButtonClass}>
                        <CustomButton
                          text="View Ticket"
                          className="big-light-button"
                          onClick={handleViewTicket}
                        />{" "}
                        <CustomButton
                          text="View Comment"
                          className="big-light-button"
                          onClick={() => {
                            setViewDetailHeadOfComplianceEscalated(false);
                          }}
                        />{" "}
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailHeadOfComplianceEscalated(false);
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

export default ViewDetailHeadOfComplianceReconcileTransaction;
