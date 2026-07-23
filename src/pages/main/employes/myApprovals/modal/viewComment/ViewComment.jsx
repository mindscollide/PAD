import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";

const ViewComment = () => {
  const { isViewComments, setIsViewComments, setIsViewDetail } =
    useGlobalModal();

  const { viewDetailsModalData } = useMyApproval();

  const workflowStatusID =
    viewDetailsModalData?.workFlowStatus?.workFlowStatusID;
  const detail = viewDetailsModalData?.details?.[0];

  // These are arrays of { name, comments } objects, not nested under `.comments`
  const approvalComments = detail?.approvalComments || [];
  const rejectionComments = detail?.rejectionComment || [];

  const formatComments = (commentsArray) => {
    if (!commentsArray || commentsArray.length === 0)
      return "No comments available.";

    return commentsArray
      .map((item, index) => `${index + 1}) ${item.comments} - ${item.name}`)
      .join("\n");
  };

  const getCommentText = () => {
    if (workflowStatusID === 3) {
      return formatComments(approvalComments);
    } else if (workflowStatusID === 4) {
      return formatComments(rejectionComments);
    } else {
      return "No comment available for this status.";
    }
  };

  const onClickGoBack = () => {
    setIsViewComments(false);
    setIsViewDetail(true);
  };

  const onClickCloseComment = () => {
    setIsViewComments(false);
  };

  return (
    <>
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
