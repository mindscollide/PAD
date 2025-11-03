import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";

const ViewComment = () => {
  // This is Global State for modal which is create in ContextApi
  const { isViewComments, setIsViewComments, setIsViewDetail } =
    useGlobalModal();

  //This is the Global state of Context Api
  const { viewDetailsModalData } = useMyApproval();

  // Check workflow Id it shows comment against the workFlow ID
  const workflowStatusID =
    viewDetailsModalData?.workFlowStatus?.workFlowStatusID;
  const detail = viewDetailsModalData?.details?.[0];

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
    setIsViewComments(false);
    setIsViewDetail(true);
  };

  //This is the onCLick of Close Comment
  const onClickCloseComment = () => {
    setIsViewComments(false);
  };

  return (
    <>
      {/* Import View Comment Modal Which Is Create inside modal folder Component because now we can use on multiple time */}
      <ViewCommentModal
        visible={isViewComments}
        onClose={onClickCloseComment}
        onGoBack={onClickGoBack}
        CommentHeading={"View Comment"}
        commentText={getCommentText()}
      />
    </>
  );
};

export default ViewComment;
