import React from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../../components";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";

const ViewCommentHeadOfComplianceModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentReconcileModal,
    setViewCommentReconcileModal,
    setViewDetailHeadOfComplianceEscalated,
  } = useGlobalModal();

  // This is the Global state of Context Api (HCA's own escalated transaction view detail,
  // not the Compliance Officer's reconcileTransactionViewDetailData)
  const { isEscalatedHeadOfComplianceViewDetailData } = useReconcileContext();

  // GetAllViewDetailsEscalatedTransactionsAndPortFolioByTradeApprovalID is unaffected by
  // the 2026-07-23 comment restructure — still a scalar approvalComment/rejectionComment string
  const workflowStatusID =
    isEscalatedHeadOfComplianceViewDetailData?.workFlowStatus
      ?.workFlowStatusID;
  const detail = isEscalatedHeadOfComplianceViewDetailData?.details?.[0];

  const approvalComment = detail?.approvalComment;
  const rejectionComment = detail?.rejectionComment;

  const getCommentText = () => {
    if (workflowStatusID === 8) {
      return approvalComment || "No approval comment available.";
    } else if (workflowStatusID === 9) {
      return rejectionComment || "No rejection comment available.";
    } else {
      return "No comment available for this status.";
    }
  };

  // This is onClick of Go Back Functionality
  const onClickGoBack = () => {
    setViewCommentReconcileModal(false);
    setViewDetailHeadOfComplianceEscalated(true);
  };

  //This is the onCLick of Close Comment
  const onClickCloseComment = () => {
    setViewCommentReconcileModal(false);
  };

  return (
    <>
      <ViewCommentModal
        visible={viewCommentReconcileModal}
        onClose={onClickCloseComment}
        onGoBack={onClickGoBack}
        CommentHeading={"View Comment"}
        commentText={getCommentText()}
      />
    </>
  );
};

export default ViewCommentHeadOfComplianceModal;
