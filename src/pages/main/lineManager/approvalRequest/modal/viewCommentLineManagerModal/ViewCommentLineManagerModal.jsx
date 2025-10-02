import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";

const ViewCommentLineManagerModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentGlobalModal,
    setViewCommentGlobalModal,
    setViewDetailLineManagerModal,
  } = useGlobalModal();

  //This is the Global state of Context Api
  const { viewDetailsLineManagerData } = useMyApproval();

  // Check workflow Id it shows comment against the workFlow ID
  const workflowStatusID =
    viewDetailsLineManagerData?.workFlowStatus?.workFlowStatusID;
  const detail = viewDetailsLineManagerData?.details?.[0];

  const approvalComment = detail?.approvalComment;
  const rejectionComment = detail?.rejectionComment;

  //To Show Approval or Rejection Comments
  const getCommentText = () => {
    //For Approved Comment Show
    if (workflowStatusID === 3) {
      return approvalComment || "No approval comment available.";
    }
    //For Declined Comment Show
    else if (workflowStatusID === 4) {
      return rejectionComment || "No rejection comment available.";
    } else {
      return "No comment available for this status.";
    }
  };

  // This is onClick of Go Back Functionality
  const onClickGoBack = () => {
    setViewCommentGlobalModal(false);
    setViewDetailLineManagerModal(true);
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
        CommentHeading={"View Comment"}
        commentText={getCommentText()}
      />
    </>
  );
};

export default ViewCommentLineManagerModal;
