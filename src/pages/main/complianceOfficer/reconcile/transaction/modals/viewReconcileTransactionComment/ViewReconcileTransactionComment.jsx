import React from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../../components";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";

const ViewReconcileTransactionComment = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    isViewComments,
    setIsViewComments,
    setIsViewDetail,
    viewCommentReconcileModal,
    setViewCommentReconcileModal,
    setViewDetailReconcileTransaction,
  } = useGlobalModal();

  //This is the Global state of Context Api
  const { reconcileTransactionViewDetailData } = useReconcileContext();

  console.log(
    reconcileTransactionViewDetailData,
    "viewCommentReconcileModalviewCommentReconcileModal"
  );

  const workflowStatusID =
    reconcileTransactionViewDetailData?.workFlowStatus?.workFlowStatusID;
  const detail = reconcileTransactionViewDetailData?.details?.[0];

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
    setViewDetailReconcileTransaction(true);
  };

  //This is the onCLick of Close Comment
  const onClickCloseComment = () => {
    setViewDetailReconcileTransaction(false);
    setViewCommentReconcileModal(false);
  };

  return (
    <>
      {/* Import View Comment Modal Which Is Create inside modal folder Component because now we can use on multiple time */}
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

export default ViewReconcileTransactionComment;
