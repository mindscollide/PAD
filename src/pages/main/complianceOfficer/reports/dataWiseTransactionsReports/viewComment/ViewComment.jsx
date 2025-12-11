import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";

const ViewComment = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    isViewComments,
    setIsViewComments,
    setIsViewDetail,
    checkTradeApprovalID,
  } = useGlobalModal();

  // Global approval state
  const { coDatewiseTransactionReportListData } = useMyApproval();
  const approvalsList =
    coDatewiseTransactionReportListData?.complianceOfficerApprovalsList || [];

  // Find the specific approval for the current tradeApprovalID
  const currentApproval = approvalsList.find(
    (item) => item.approvalID === checkTradeApprovalID
  );

  // Format comments
  const getCommentText = () => {
    if (!currentApproval) return "No comments available.";

    const comments = [];

    if (
      currentApproval.approvalComment &&
      currentApproval.approvalComment.trim() !== ""
    ) {
      comments.push(currentApproval.approvalComment.trim());
    }

    if (
      currentApproval.rejectionComment &&
      currentApproval.rejectionComment.trim() !== ""
    ) {
      comments.push(currentApproval.rejectionComment.trim());
    }

    if (!comments.length) return "No comments available.";

    // Number the comments
    return comments.map((c, idx) => `${idx + 1}) ${c}`).join("\n\n");
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
