import React from "react";
import { ViewCommentModal } from "../../../../../../components";
import { useReconcileContext } from "../../../../../../context/reconsileContax";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { parseComments } from "../../transactionsSummary/viewDetails/viewComment/utils";

const ViewOverDueTransactionComment = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentReconcileModal,
    setViewCommentReconcileModal,
    setViewDetailHeadOfComplianceEscalated
  } = useGlobalModal();

  //This is the Global state of Context Api
  const { isEscalatedHeadOfComplianceViewDetailData } = useReconcileContext();

  console.log(
    isEscalatedHeadOfComplianceViewDetailData,
    "viewCommentReconcileModalviewCommentReconcileModal"
  );
  const record = isEscalatedHeadOfComplianceViewDetailData?.details[0] || null;
    console.log(
    record,
    "viewCommentReconcileModalviewCommentReconcileModal"
  );
  const acceptanceList = parseComments(record?.approvalComment);
  const rejectionList = parseComments(record?.rejectionComment);

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
      {/* Import View Comment Modal Which Is Create inside modal folder Component because now we can use on multiple time */}
      <ViewCommentModal
        visible={viewCommentReconcileModal}
        onClose={onClickCloseComment}
        onGoBack={onClickGoBack}
        CommentHeading={"View Comment"}
        // commentText={getCommentText()}
        
        commentTypeFlag={true}
        showClosed={true}
        acceptanceList={acceptanceList}
        rejectionList={rejectionList}

      />
    </>
  );
};

export default ViewOverDueTransactionComment;
