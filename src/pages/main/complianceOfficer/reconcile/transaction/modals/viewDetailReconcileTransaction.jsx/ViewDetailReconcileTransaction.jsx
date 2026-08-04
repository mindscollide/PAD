import React, { useEffect, useMemo, useRef } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { BrokerList, GlobalModal } from "../../../../../../../components";
import styles from "./ViewDetailReconcileTransaction.module.css";
import { Stepper, Step } from "react-form-stepper";
import CustomButton from "../../../../../../../components/buttons/button";
import CheckIcon from "../../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../../assets/img/Cross.png";
import { useDashboardContext } from "../../../../../../../context/dashboardContaxt";
import {
  convertUTCToCurrentTimeZone,
  dashBetweenApprovalAssets,
  formatNumberWithCommas,
} from "../../../../../../../common/funtions/rejex";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";
import {
  GetAnnotationOfFilesAttachementAPI,
  GetWorkFlowFilesAPI,
} from "../../../../../../../api/fileApi";
import { useApi } from "../../../../../../../context/ApiContext";
import { useNotification } from "../../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";

const ViewDetailReconcileTransaction = () => {
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const navigate = useNavigate();

  // This is Global State for modal which is create in ContextApi
  const {
    viewDetailReconcileTransaction,
    setViewDetailReconcileTransaction,
    setNoteGlobalModal,
    setViewCommentReconcileModal,
    setIsViewTicketTransactionModal,
    setUploadComplianceModal,
    setUploadattAchmentsFiles,
  } = useGlobalModal();
  console.log(viewDetailReconcileTransaction, "viewDetailReconcileTransaction");

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  //This is the Global state of Context Api
  const {
    reconcileTransactionViewDetailData,
    selectedReconcileTransactionData,
  } = useReconcileContext();

  const { allInstrumentsData } = useDashboardContext();
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

  //This is how I can pass the status in statusData Variables (workflow-level —
  // only still used for the "Traded" background-styling checks below)
  const statusData = getStatusStyle(
    String(reconcileTransactionViewDetailData?.workFlowStatus?.workFlowStatusID)
  );

  // Header badge + action buttons show the CO's own action (myActionStatusID:
  // 2=Compliant, 3=Non-Compliant), not the overall workFlowStatus — the overall
  // workflow can still be Pending (awaiting other approvers) after this CO
  // already acted on their own level. Map onto the same "8"/"9" codes
  // getStatusStyle already uses for Compliant/Non Compliant labels/styles.
  const myActionStatusID = reconcileTransactionViewDetailData?.myActionStatusID;
  const myActionStatusCode =
    myActionStatusID === 2
      ? "8"
      : myActionStatusID === 3
        ? "9"
        : String(myActionStatusID ?? "");
  const myActionStatusData = getStatusStyle(myActionStatusCode);

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(
    reconcileTransactionViewDetailData?.details?.[0]?.instrumentID
  );

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  //Button condition on Compliant, Non-Compliant and View Ticket it will be false when ticketUploaded is false
  const isTicketUploaded =
    reconcileTransactionViewDetailData?.ticketUploaded === false;

  // Hierarchy list: show only up to (and including) the logged-in user's own
  // step, same as ViewDetailPortfolioTransaction.jsx — the previous logic
  // filtered the logged-in user OUT of the list entirely whenever there was
  // more than one entry, which hid their own action and miscounted activeStep.
  const hierarchyDetails =
    reconcileTransactionViewDetailData?.hierarchyDetails || [];

  const currentUserIndex = hierarchyDetails.findIndex(
    (item) => item.userID === loggedInUserID
  );

  const visibleHierarchy =
    currentUserIndex !== -1
      ? hierarchyDetails.slice(0, currentUserIndex + 1)
      : hierarchyDetails;

  // To Show Note Modal When Click on Compliant Click
  const openNoteModalOnCompliantClick = () => {
    setNoteGlobalModal({ visible: true, action: "Compliant" });
    setViewDetailReconcileTransaction(false);
  };

  // To Show Note Modal When Click on Non-Compliant Click
  const openNoteModalOnNonCompliantClick = () => {
    setNoteGlobalModal({ visible: true, action: "Non-Compliant" });
    setViewDetailReconcileTransaction(false);
  };
  // const handleViewTicket = async () => {
  //   showLoader(true);
  //   const res = await GetWorkFlowFilesAPI({
  //     callApi,
  //     showNotification,
  //     showLoader,
  //     requestData: {
  //       WorkFlowID: selectedReconcileTransactionData.approvalID,
  //     },
  //     navigate,
  //   });
  //   // 🔹 Add blobName = ""
  //   const updatedFiles = res.map((file) => ({
  //     ...file,
  //     attachmentBlob: "",
  //   }));
  //   await setUploadattAchmentsFiles(updatedFiles);
  //   setViewDetailReconcileTransaction(false);
  //   setIsViewTicketTransactionModal(true);
  // };
  const handleViewTicket = async () => {
    showLoader(true);
    try {
      const res = await GetWorkFlowFilesAPI({
        callApi,
        showNotification,
        showLoader,
        requestData: {
          WorkFlowID: selectedReconcileTransactionData.approvalID,
        },
        navigate,
      });

      if (res?.length > 0) {
        // Leave attachmentBlob unset so ViewTicketReconcileModal's own
        // handleSelectFile lazily fetches it per-file on selection.
        const updatedFiles = res.map((file) => ({
          ...file,
          attachmentBlob: "",
        }));

        setUploadattAchmentsFiles(updatedFiles);
        setViewDetailReconcileTransaction(false);
        setIsViewTicketTransactionModal(true);
      } else {
        showNotification({
          type: "info",
          title: "No Tickets",
          description: "No ticket files found for this transaction.",
        });
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
        visible={viewDetailReconcileTransaction}
        width={"942px"}
        centered={true}
        onCancel={() => {
          setViewDetailReconcileTransaction(false);
          setNoteGlobalModal({ visible: false, action: null });
        }}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              {/* Show Heading by Status in View Detail Modal */}
              <Row>
                <Col span={24}>
                  <div className={myActionStatusData.divClassName}>
                    <label className={myActionStatusData.labelClassName}>
                      {myActionStatusData.label}
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
                          {reconcileTransactionViewDetailData?.details?.[0]
                            ?.assetTypeID === "1" && <span>EQ</span>}
                        </span>{" "}
                        <span
                          className={styles.viewDetailSubLabelsForInstrument}
                          title={selectedInstrument?.instrumentName}
                        >
                          {`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
                        </span>
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
                        {reconcileTransactionViewDetailData?.reqeusterName}
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
                          reconcileTransactionViewDetailData
                            ?.tradedWorkFlowReqeust?.[0]?.tradeApprovalID
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
                          reconcileTransactionViewDetailData?.details?.[0]
                            ?.tradeApprovalID
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

                        {reconcileTransactionViewDetailData?.details?.[0]
                          ?.approvalTypeID === "1" && <span>Buy</span>}
                        {reconcileTransactionViewDetailData?.details?.[0]
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
                          reconcileTransactionViewDetailData
                            ?.tradedWorkFlowReqeust?.[0]?.quantity
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
                          reconcileTransactionViewDetailData?.details?.[0]
                            ?.quantity
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
                        {/* Row value is a combined UTC "YYYYMMDD HHmmss" string */}
                        {convertUTCToCurrentTimeZone(
                          selectedReconcileTransactionData?.transactionDate
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
                        {reconcileTransactionViewDetailData?.details?.[0]
                          ?.assetTypeID === "1" && <span>Equity</span>}
                      </label>
                    </div>
                  </Col>
                </Row>

                <Row style={{ marginTop: "3px" }}>
                  <Col span={24}>
                    <BrokerList
                      statusData={statusData}
                      // viewDetailsData={reconcileTransactionViewDetailData}
                      variant={"Blue"}
                      viewDetailsData={
                        reconcileTransactionViewDetailData?.details[0]?.brokers
                      }
                      type={2}
                    />
                  </Col>
                </Row>

                <Row>
                  <div className={styles.mainStepperContainer}>
                    <div
                      className={`${styles.backgrounColorOfStepper} ${
                        visibleHierarchy.length <= 3
                          ? styles.centerAlignStepper
                          : styles.leftAlignStepper
                      }`}
                    >
                      <Stepper
                        activeStep={Math.max(0, visibleHierarchy.length - 1)}
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
                        {Array.isArray(visibleHierarchy) &&
                          visibleHierarchy.map((person, index) => {
                            const {
                              fullName,
                              bundleStatusID,
                              modifiedDate,
                              modifiedTime,
                              userID,
                            } = person;

                            // BE sends these in UTC — convert for display only
                            const formattedDateTime = convertUTCToCurrentTimeZone(
                              modifiedDate,
                              modifiedTime
                            );

                            // Decide icon and text based on status
                            let iconSrc;
                            let displayText;
                            let isApprovedOrDeclined = false;

                            if (bundleStatusID === 2) {
                              // ✅ Compliant
                              iconSrc = CheckIcon;
                              displayText =
                                loggedInUserID === userID
                                  ? "You marked this as compliant"
                                  : `${fullName}`;
                              isApprovedOrDeclined = true;
                            } else if (bundleStatusID === 3) {
                              // ❌ Non-Compliant
                              iconSrc = CrossIcon;
                              displayText =
                                loggedInUserID === userID
                                  ? "You marked this as non-compliant"
                                  : `${fullName}`;
                              isApprovedOrDeclined = true;
                            } else {
                              // ⏳ Pending
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

                {myActionStatusData.label === "Pending" && (
                  <>
                    <Row>
                      <Col span={[24]}>
                        <div className={styles.addticketBuuton}>
                          <CustomButton
                            text={"View Ticket"}
                            className={"big-ViewTicket-light-button"}
                            onClick={() => handleViewTicket()}
                            disabled={isTicketUploaded}
                          />
                          <CustomButton
                            text={"Add Ticket"}
                            onClick={() => {
                              setUploadComplianceModal(true);
                              setViewDetailReconcileTransaction(false);
                            }}
                            className="big-ViewTicket-dark-button"
                          />
                        </div>
                      </Col>
                    </Row>
                  </>
                )}
              </div>

              {/* All Others button Scenario's for footer button */}
              <Row className={styles.mainButtonDivClose}>
                <Col span={[24]}>
                  <>
                    {myActionStatusData.label === "Pending" ? (
                      <>
                        <div className={styles.approvedButtonClass}>
                          <CustomButton
                            text="Non Compliant"
                            className="Decline-dark-button"
                            disabled={isTicketUploaded}
                            onClick={openNoteModalOnNonCompliantClick}
                          />
                          <CustomButton
                            text="Compliant"
                            className="Approved-dark-button"
                            disabled={isTicketUploaded}
                            onClick={openNoteModalOnCompliantClick}
                          />
                        </div>
                      </>
                    ) : myActionStatusData.label === "Non Compliant" ? (
                      <div className={styles.noncompliantButtonClass}>
                        <CustomButton
                          text="View Ticket"
                          className="big-light-button"
                          onClick={() => {
                            setIsViewTicketTransactionModal(true);
                            setViewDetailReconcileTransaction(false);
                          }}
                        />{" "}
                        <CustomButton
                          text="View Comment"
                          className="big-light-button"
                          onClick={() => {
                            setViewCommentReconcileModal(true);
                            setViewDetailReconcileTransaction(false);
                          }}
                        />{" "}
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailReconcileTransaction(false);
                          }}
                          className="big-light-button"
                        />
                      </div>
                    ) : myActionStatusData.label === "Compliant" ? (
                      <div className={styles.noncompliantButtonClass}>
                        <CustomButton
                          text="View Ticket"
                          className="big-light-button"
                          onClick={() => handleViewTicket()} // no disabled check
                        />
                        <CustomButton
                          text="View Comment"
                          className="big-light-button"
                          onClick={() => {
                            setViewCommentReconcileModal(true);
                            setViewDetailReconcileTransaction(false);
                          }}
                        />{" "}
                        <CustomButton
                          text="Close"
                          onClick={() => {
                            setViewDetailReconcileTransaction(false);
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

export default ViewDetailReconcileTransaction;
