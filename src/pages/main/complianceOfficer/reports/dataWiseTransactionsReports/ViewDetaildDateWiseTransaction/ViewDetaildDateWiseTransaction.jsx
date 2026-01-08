/**
 * ViewDetaildDateWiseTransaction
 * ---------------------------------------------
 * This component renders a detailed modal view
 * for a selected reconcile transaction.
 *
 * Features:
 * - Displays transaction details based on workflow status
 * - Shows approval hierarchy using a stepper
 * - Allows compliance / non-compliance actions
 * - Integrates ticket viewing & comments
 */

import React from "react";
import { Col, Row } from "antd";
import { Stepper, Step } from "react-form-stepper";
import { useNavigate } from "react-router-dom";

/* ========================== CONTEXTS ========================== */
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { useReconcileContext } from "../../../../../../context/reconsileContax";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

/* ========================== COMPONENTS ========================== */
import { BrokerList, GlobalModal } from "../../../../../../components";
import CustomButton from "../../../../../../components/buttons/button";

/* ========================== HELPERS ========================== */
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../common/funtions/rejex";

/* ========================== ASSETS ========================== */
import CheckIcon from "../../../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../../../assets/img/Cross.png";

/* ========================== STYLES ========================== */
import styles from "./ViewDetaildDateWiseTransaction.module.css";

const ViewDetaildDateWiseTransaction = () => {
  /* ========================== GLOBAL MODAL STATE ========================== */
  const { isViewComments, setIsViewComments, setNoteGlobalModal } =
    useGlobalModal();

  /* ========================== CONTEXT DATA ========================== */
  const { reconcileTransactionViewDetailData } = useReconcileContext();

  const { allInstrumentsData } = useDashboardContext();

  /* ========================== USER SESSION ========================== */
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  /* ================================================================
     STATUS HANDLING
     Maps workflow status ID to UI styles & labels
  ================================================================= */
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

  const statusData = getStatusStyle(
    String(reconcileTransactionViewDetailData?.workFlowStatus?.workFlowStatusID)
  );

  /* ========================== INSTRUMENT ========================== */
  const instrumentId = Number(
    reconcileTransactionViewDetailData?.details?.[0]?.instrumentID
  );

  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

  /* ========================== BUTTON STATES ========================== */
  const isTicketUploaded =
    reconcileTransactionViewDetailData?.ticketUploaded === false;

  /* ========================== ACTION HANDLERS ========================== */
  const closedModal = () => {
    setIsViewComments(false);
  };

  /* ================================================================
     RENDER
  ================================================================= */
  return (
    <GlobalModal
      visible={isViewComments}
      width="942px"
      centered
      onCancel={() => {
        setIsViewComments(false);
        setNoteGlobalModal({ visible: false, action: null });
      }}
      modalHeader={<></>}
      modalBody={
        <div className={styles.modalBodyWrapper}>
          {/* ========================== STATUS HEADER ========================== */}
          <Row>
            <Col span={24}>
              <div className={statusData.divClassName}>
                <label className={statusData.labelClassName}>
                  {statusData.label}
                </label>
              </div>
            </Col>
          </Row>

          {/* ========================== CONTENT ========================== */}
          <div className={styles.modalBodyContentScroller}>
            {/* Instrument */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div
                  className={styles.backgroundColorOfInstrumentDetailApproved}
                >
                  <label className={styles.viewDetailMainLabels}>
                    Instrument
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    <span className={styles.customTag}>EQ</span>{" "}
                    <span
                      title={selectedInstrument?.instrumentName}
                      className={styles.viewDetailSubLabelsForInstrument}
                    >
                      {`${selectedInstrument?.instrumentCode} - ${selectedInstrument?.instrumentName}`}
                    </span>
                  </label>
                </div>
              </Col>
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
            </Row>
            {/* •	Quantity & •	Type */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Quantity
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {reconcileTransactionViewDetailData?.details[0]?.quantity}
                  </label>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>Type</label>
                  <label className={styles.viewDetailSubLabels}>
                    {reconcileTransactionViewDetailData?.details[0]
                      ?.assetTypeID === "1"
                      ? "Buy"
                      : "Sell"}
                  </label>
                </div>
              </Col>
            </Row>
            {/* Employee Name & Employee ID */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Employee Name
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {reconcileTransactionViewDetailData?.requesterName}
                  </label>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Employee ID
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {reconcileTransactionViewDetailData?.requesterEmployeeID}
                  </label>
                </div>
              </Col>
            </Row>
            {/* 	Transaction Date & 	Action  Date */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Transaction Date
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {formatApiDateTime(
                      [
                        reconcileTransactionViewDetailData?.hierarchyDetails[0]
                          ?.requestDate,
                        reconcileTransactionViewDetailData?.hierarchyDetails[0]
                          ?.requestTime,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    )}
                  </label>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Action Date
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {formatApiDateTime(
                      [
                        reconcileTransactionViewDetailData?.hierarchyDetails[0]
                          ?.modifiedDate,
                        reconcileTransactionViewDetailData?.hierarchyDetails[0]
                          ?.modifiedTime,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    )}
                  </label>
                </div>
              </Col>
            </Row>
            {/* Action by */}
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Action by
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {
                      reconcileTransactionViewDetailData?.hierarchyDetails[0]
                        ?.fullName
                    }
                  </label>
                </div>
              </Col>

              <Col span={12}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>
                    Shares Traded
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {
                      reconcileTransactionViewDetailData
                        ?.complianceMappedTradeSummary[0]?.tradeWorkFlowID
                    }
                  </label>
                </div>
              </Col>
            </Row>
            <Row gutter={[4, 4]} style={{ marginTop: 3 }}>
              <Col span={24}>
                <div className={styles.backgrounColorOfDetail}>
                  <label className={styles.viewDetailMainLabels}>Notes</label>
                  <label className={styles.viewDetailSubLabels}>
                    {reconcileTransactionViewDetailData?.details?.[0]
                      ?.approvalComments?.length > 0 &&
                      reconcileTransactionViewDetailData.details[0].approvalComments.map(
                        (comment, index) => (
                          <div key={`approval-${index}`}>{comment}</div>
                        )
                      )}

                    {reconcileTransactionViewDetailData?.details?.[0]
                      ?.rejectionComment?.length > 0 &&
                      reconcileTransactionViewDetailData.details[0].rejectionComment.map(
                        (comment, index) => (
                          <div key={`rejection-${index}`}>{comment}</div>
                        )
                      )}
                  </label>
                </div>
              </Col>
            </Row>
          </div>

          {/* ========================== FOOTER ACTIONS ========================== */}
          <Row className={styles.mainButtonDivClose}>
            <Col span={24}>
              <div className={styles.approvedButtonClass}>
                <CustomButton
                  text="Close"
                  className="small-light-button"
                  onClick={closedModal}
                />
              </div>
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default ViewDetaildDateWiseTransaction;
