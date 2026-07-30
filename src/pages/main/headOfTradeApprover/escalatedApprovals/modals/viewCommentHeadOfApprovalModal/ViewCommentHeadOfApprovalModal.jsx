import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";
import { useEscalatedApprovals } from "../../../../../../context/escalatedApprovalContext";

const ViewCommentHeadOfApprovalModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentGlobalModal,
    setViewCommentGlobalModal,
    setViewDetailsHeadOfApprovalModal,
  } = useGlobalModal();

  const { viewDetailsHeadOfApprovalData } = useEscalatedApprovals();

  // GetHTAViewDetailsByTradeApprovalID is unaffected by the 2026-07-23 comment
  // restructure — still a scalar approvalComment/rejectionComment string (like LM's own view)
  const workflowStatusID =
    viewDetailsHeadOfApprovalData?.workFlowStatus?.workFlowStatusID;
  const detail = viewDetailsHeadOfApprovalData?.details?.[0];

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
    setViewCommentGlobalModal(false);
    setViewDetailsHeadOfApprovalModal(true);
  };

  //This is the onCLick of Close Comment
  const onClickCloseComment = () => {
    setViewCommentGlobalModal(false);
  };

  return (
    <>
      {/* Import View Comment Modal Which Is Create inside modal folder Component because now we can use on multiple time */}
      <ViewCommentModal
        visible={viewCommentGlobalModal}
        onClose={onClickCloseComment}
        onGoBack={onClickGoBack}
        CommentHeading={"View Comments"}
        commentText={getCommentText()}
      />
    </>
  );
};

export default ViewCommentHeadOfApprovalModal;
