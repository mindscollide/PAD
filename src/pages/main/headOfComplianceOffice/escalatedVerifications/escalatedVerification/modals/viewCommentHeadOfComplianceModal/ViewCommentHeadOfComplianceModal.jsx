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

  // CHANGED (API_Changes/2026-08-27_escalated_view_details_comments.md):
  // approvalComment/rejectionComment moved from a single raw string (with a
  // leaking "CO<UserID>" code, and only the last comment surviving when
  // several were left) to an array of resolved {userID, name, comments}
  // objects - live as of the 2026-08-27 PAD_Trade deploy. formatCommentText
  // below still keeps a legacy scalar-string shape working too, defensively.
  const workflowStatusID =
    isEscalatedHeadOfComplianceViewDetailData?.workFlowStatus?.workFlowStatusID;
  const detail = isEscalatedHeadOfComplianceViewDetailData?.details?.[0];

  const approvalComment = detail?.approvalComment;
  const rejectionComment = detail?.rejectionComment;

  /** Formats the new {userID, name, comments}[] shape into display text - one
   * "Name: comment text" line per entry - while still passing a legacy
   * scalar string straight through. */
  const formatCommentText = (comments, emptyMessage) => {
    if (!Array.isArray(comments)) return comments || emptyMessage;
    return (
      comments
        .map((c) => `${c?.name ? `${c.name}: ` : ""}${c?.comments ?? ""}`.trim())
        .filter(Boolean)
        .join("\n") || emptyMessage
    );
  };

  const getCommentText = () => {
    if (workflowStatusID === 8) {
      return formatCommentText(approvalComment, "No approval comment available.");
    } else if (workflowStatusID === 9) {
      return formatCommentText(rejectionComment, "No rejection comment available.");
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
        CommentHeading={"View Comments"}
        commentText={getCommentText()}
      />
    </>
  );
};

export default ViewCommentHeadOfComplianceModal;
