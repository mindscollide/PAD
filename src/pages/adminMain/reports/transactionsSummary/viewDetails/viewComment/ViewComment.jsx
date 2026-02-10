import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";

const ViewCommentTransaction = () => {
  // This is Global State for modal which is create in ContextApi
  const { isViewComments, setIsViewComments, setIsViewDetail } =
    useGlobalModal();

  //This is the Global state of Context Api
  const { coTransactionSummaryReportViewDetailsListData } = useMyApproval();
  console.log(
    coTransactionSummaryReportViewDetailsListData,
    "coTransactionSummaryReportViewDetailsListData"
  );

  // Check workflow Id it shows comment against the workFlow ID
  const workflowStatusID = coTransactionSummaryReportViewDetailsListData?.key;
  // const detail = viewDetailsModalData?.details?.[0];

  const accetanceComments =
    coTransactionSummaryReportViewDetailsListData?.accetanceComments || [];
  const rejectionComments =
    coTransactionSummaryReportViewDetailsListData?.rejectionComment || [];

  const formatComments = (commentsArray) => {
    if (!commentsArray || commentsArray.length === 0)
      return "No comments available.";

    return commentsArray
      .map((comment, index) => `${index + 1}) ${comment}`)
      .join("\n");
  };

  //To Show Approval or Rejection Comments
  const getCommentText = () => {
    if (workflowStatusID === 3) {
      return formatComments(accetanceComments);
    } else if (workflowStatusID === 4) {
      return formatComments(rejectionComments);
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

export default ViewCommentTransaction;
