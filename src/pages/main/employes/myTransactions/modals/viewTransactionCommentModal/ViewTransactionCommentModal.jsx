import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";
import { useTransaction } from "../../../../../../context/myTransaction";

const ViewTransactionCommentModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentTransactionModal,
    setViewCommentTransactionModal,
    setViewDetailTransactionModal,
  } = useGlobalModal();

  const { employeeTransactionViewDetailData } = useTransaction();

  const workflowStatusID =
    employeeTransactionViewDetailData?.workFlowStatus?.workFlowStatusID;
  const detail =
    employeeTransactionViewDetailData?.details?.[0];

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
    setViewCommentTransactionModal(false);
    setViewDetailTransactionModal(true);
  };

  //This is the onCLick of Close Comment
  const onClickCloseComment = () => {
    setViewCommentTransactionModal(false);
  };

  return (
    <>
      {/* Import View Comment Modal Which Is Create inside modal folder Component because now we can use on multiple time */}
      <ViewCommentModal
        visible={viewCommentTransactionModal}
        onClose={onClickCloseComment}
        onGoBack={onClickGoBack}
        CommentHeading={"View Comment"}
        commentText={getCommentText()}
      />
    </>
  );
};

export default ViewTransactionCommentModal;
