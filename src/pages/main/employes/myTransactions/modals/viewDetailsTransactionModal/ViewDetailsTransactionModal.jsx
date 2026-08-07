/**
 * 📄 ViewDetailsTransactionModal.jsx
 *
 * A modal component to display detailed information about a transaction.
 * Integrates with global contexts for modal handling, API calls, notifications, loaders, and transaction data.
 *
 * Features:
 *  - Displays transaction details: Instrument, Approval ID, Transaction ID, Quantity, Type, Asset Class
 *  - Shows hierarchical approval workflow using a stepper
 *  - Supports viewing comments and associated tickets
 *  - Fetches workflow files for ticket view
 *  - Uses status mapping to dynamically apply label text, label style, and border style
 */

import React, { useRef } from "react";
import { Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { Stepper, Step } from "react-form-stepper";

// 🔹 Components & Contexts
import { GlobalModal, BrokerList } from "../../../../../../components";
import CustomButton from "../../../../../../components/buttons/button";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { useTransaction } from "../../../../../../context/myTransaction";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

// 🔹 Assets
import CrossIcon from "../../../../../../assets/img/Cross.png";
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";

// 🔹 Utils & APIs
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../common/funtions/rejex";
import { getStatusConfig } from "./util";
import {
  GetAnnotationOfFilesAttachementAPI,
  GetWorkFlowFilesAPI,
} from "../../../../../../api/fileApi";

// 🔹 Styles
import styles from "./ViewDetailTransactionModal.module.css";

const ViewDetailsTransactionModal = () => {
  // -----------------------
  // 🔹 Hooks & Contexts
  // -----------------------
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const { employeeBasedBrokersData } = useDashboardContext();
  const { employeeTransactionViewDetailData } = useTransaction();

  const {
    viewDetailTransactionModal,
    setViewDetailTransactionModal,
    setViewCommentTransactionModal,
    setIsViewTicketTransactionModal,
    selectedViewDetailOfTransaction,
    setUploadattAchmentsFiles,
  } = useGlobalModal();

  // -----------------------
  // 🔹 Extract Data
  // -----------------------
  const statusId =
    employeeTransactionViewDetailData?.workFlowStatus?.workFlowStatusID;

  // Get label and styles for the current status
  const { label, labelClass, borderClass } = getStatusConfig(statusId) || {
    label: "Unknown",
    labelClass: styles.approvedDetailHeading,
    borderClass: styles.approvedBorderClass,
  };

  const variableOfAssetType =
    employeeTransactionViewDetailData?.assetTypes?.[0];
  const variableOfInstrument =
    employeeTransactionViewDetailData?.details?.[0]?.instrument || null;
  const variableOfDetailData =
    employeeTransactionViewDetailData?.details?.[0] || null;

  const tradedWorkFlowData =
    employeeTransactionViewDetailData?.tradedWorkFlowReqeust?.map((item) => ({
      tradeApprovalID: item.tradeApprovalID,
      quantity: item.quantity,
      tradeWorkFlowID: item.tradeWorkFlowID,
    }));

  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  // -----------------------
  // 🔹 Handlers
  // -----------------------
  console.log(
    "employeeTransactionViewDetailData",
    employeeTransactionViewDetailData
  );
  /**
   * Fetch workflow files for viewing tickets and open the ticket modal
   */
  const handleViewTicket = async () => {
    showLoader(true);
    try {
      const res = await GetWorkFlowFilesAPI({
        callApi,
        showNotification,
        showLoader,
        requestData: {
          WorkFlowID: employeeTransactionViewDetailData?.TradeApprovalID,
        },
        navigate,
      });

      if (res?.length > 0) {
        // Show the delete icon only for the requesting user's own uploads
        // (fK_UserID on each file, confirmed against a live
        // GetWorkFlowFiles response), and only while the transaction hasn't
        // been verified yet (statusId 8/9 = Compliant / Non-Compliant —
        // once the CO has acted, evidence is locked). DeleteDocument's own
        // _04 ownership check still runs server-side regardless - this is
        // purely to avoid showing a delete affordance on other people's
        // files that would just fail.
        const notYetActioned = ![8, 9].includes(Number(statusId));

        // Add empty blob initially
        const updatedFiles = res.map((file) => ({
          ...file,
          attachmentBlob: "",
          canDelete:
            notYetActioned &&
            String(file.fK_UserID) === String(loggedInUserID),
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
        setUploadattAchmentsFiles(updatedFiles);

        // 🔹 Open modal after files are fully ready
        setIsViewTicketTransactionModal(true);
        setViewDetailTransactionModal(false);
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

  // -----------------------
  // 🔹 Render
  // -----------------------
  return (
    <GlobalModal
      visible={viewDetailTransactionModal}
      width="942px"
      centered
      modalHeader={null}
      onCancel={() => setViewDetailTransactionModal(false)}
      modalBody={
        <div className={styles.modalBodyWrapper}>
          {/* Status Header */}
          <Row>
            <Col span={24}>
              <div className={borderClass}>
                <label className={labelClass}>{label}</label>
              </div>
            </Col>
          </Row>

          {/* Transaction Summary */}
          <Row gutter={[4, 4]} style={{ marginTop: "13px" }}>
            <Col span={24}>
              <div className={styles.backgroundColorOfInstrumentDetailApproved}>
                <label className={styles.viewDetailMainLabels}>
                  Instrument
                </label>
                <label className={styles.viewDetailSubLabels}>
                  <span className={styles.customTag}>
                    {variableOfAssetType?.shortCode}
                  </span>
                  <span
                    className={styles.viewDetailSubLabelsForInstrument}
                    title={variableOfInstrument?.instrumentName}
                  >
                    {`${variableOfInstrument?.instrumentShortCode} - ${variableOfInstrument?.instrumentName}`}
                  </span>
                </label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Approval ID
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {dashBetweenApprovalAssets(
                    tradedWorkFlowData?.[0]?.tradeApprovalID
                  )}
                </label>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Transaction ID
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {dashBetweenApprovalAssets(
                    variableOfDetailData?.tradeApprovalID
                  )}
                </label>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfDetail}>
                <label className={styles.viewDetailMainLabels}>Type</label>
                <label className={styles.viewDetailSubLabels}>
                  {variableOfDetailData?.approvalTypeID === "1"
                    ? "Buy"
                    : variableOfDetailData?.approvalTypeID === "2"
                    ? "Sell"
                    : "-"}
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
                  {formatNumberWithCommas(variableOfDetailData?.quantity)}
                </label>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.backgrounColorOfDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Shared Traded
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {formatNumberWithCommas(tradedWorkFlowData?.[0]?.quantity)}
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

          {/* Broker List */}
          <Row style={{ marginTop: "3px" }}>
            <Col span={24}>
              <BrokerList
                statusData={label}
                // This is a historical/completed transaction record — the
                // brokers chosen at submission time must keep showing even
                // if they've since been unassigned from this employee, so
                // resolve against the full broker master list (type 2:
                // allBrokersData), not the employee's *current* assigned
                // list (type 1, the default), which silently drops brokers
                // that are no longer assigned.
                viewDetailsData={
                  employeeTransactionViewDetailData?.details?.[0]?.brokers
                }
                variant="Blue"
                type={2}
              />
            </Col>
          </Row>

          {/* Approval Stepper */}
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

                        const iconSrc =
                          bundleStatusID === 2
                            ? CheckIcon
                            : bundleStatusID === 3
                            ? CrossIcon
                            : EllipsesIcon;

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

          {/* Footer Buttons */}
          <Row>
            <Col span={24}>
              <div className={styles.approvedButtonClassViewComment}>
                <CustomButton
                  text="View Comments"
                  className="big-light-button"
                  onClick={() => {
                    setViewCommentTransactionModal(true);
                    setViewDetailTransactionModal(false);
                  }}
                />
                <CustomButton
                  text="View Tickets"
                  className="big-light-button"
                  onClick={handleViewTicket}
                />
                <CustomButton
                  text="Close"
                  className="big-light-button"
                  onClick={() => setViewDetailTransactionModal(false)}
                />
              </div>
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default ViewDetailsTransactionModal;
