import React from "react";
import { ViewCommentModal } from "../../../../../../components";
import { useReconcileContext } from "../../../../../../context/reconsileContax";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { parseComments } from "../../transactionsSummary/viewDetails/viewComment/utils";

// Numbers acceptance + rejection comments as ONE continuous sequence
// (rejection continues where acceptance left off), matching
// ViewComment.jsx's single merged "1) ... 2) ..." numbering - then
// returns them still split into two arrays, since ViewCommentModal
// renders acceptanceList and rejectionList as two separate sections.
// Scoped to this file only - ViewCommentModal and its other
// commentTypeFlag callers are untouched.
const numberCommentLists = (acceptance, rejection) => {
  const numberedAcceptance = acceptance.map(
    (item, index) => `${index + 1}) ${item}`
  );
  const numberedRejection = rejection.map(
    (item, index) => `${acceptance.length + index + 1}) ${item}`
  );
  return [numberedAcceptance, numberedRejection];
};

const ViewOverDueTransactionComment = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentReconcileModal,
    setViewCommentReconcileModal,
    setViewDetailHeadOfComplianceEscalated,
  } = useGlobalModal();
  //This is the Global state of Context Api
  const { isEscalatedHeadOfComplianceViewDetailData } = useReconcileContext();
  const record = isEscalatedHeadOfComplianceViewDetailData?.details[0] || null;
  const [acceptanceList, rejectionList] = numberCommentLists(
    parseComments(record?.approvalComment),
    parseComments(record?.rejectionComment)
  );
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
        CommentHeading={"View Comments"}
        commentTypeFlag={true}
        showClosed={true}
        acceptanceList={acceptanceList}
        rejectionList={rejectionList}
      />
    </>
  );
};
export default ViewOverDueTransactionComment;
