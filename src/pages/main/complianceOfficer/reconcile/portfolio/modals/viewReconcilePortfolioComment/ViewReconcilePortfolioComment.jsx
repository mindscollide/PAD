import React from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../../components";
import { usePortfolioContext } from "../../../../../../../context/portfolioContax";

const ViewReconcilePortfolioComment = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentPortfolioModal,
    setViewCommentPortfolioModal,
    setViewDetailPortfolioTransaction,
  } = useGlobalModal();

  const { reconcilePortfolioViewDetailData } = usePortfolioContext();

  // Gate on the CO's own action (myActionStatusID: 2 = Compliant, 3 = Non-Compliant),
  // not the overall workFlowStatus — the overall workflow can still be Pending
  // (awaiting other approvers) after this CO already acted on their own level.
  const myActionStatusID = reconcilePortfolioViewDetailData?.myActionStatusID;
  const detail = reconcilePortfolioViewDetailData?.details?.[0];

  // GetComplianceOfficerViewDetailsByTradeApprovalID returns these as arrays of
  // strings (e.g. ["Level 1 approve"]), not a single scalar string
  const approvalComments = Array.isArray(detail?.approvalComment)
    ? detail.approvalComment
    : [];
  const rejectionComments = Array.isArray(detail?.rejectionComment)
    ? detail.rejectionComment
    : [];

  //To Show Approval or Rejection Comments
  const getCommentText = () => {
    //For Compliant Comment Show
    if (myActionStatusID === 2) {
      return approvalComments.length > 0
        ? approvalComments.join("\n")
        : "No approval comment available.";
    }
    //For Non-Compliant Comment Show
    else if (myActionStatusID === 3) {
      return rejectionComments.length > 0
        ? rejectionComments.join("\n")
        : "No rejection comment available.";
    } else {
      return "No comment available for this status.";
    }
  };

  // This is onClick of Go Back Functionality
  const onClickGoBack = () => {
    setViewCommentPortfolioModal(false);
    setViewDetailPortfolioTransaction(true);
  };

  //This is the onCLick of Close Comment
  const onClickCloseComment = () => {
    setViewDetailPortfolioTransaction(false);
    setViewCommentPortfolioModal(false);
  };

  return (
    <>
      {/* Import View Comment Modal Which Is Create inside modal folder Component because now we can use on multiple time */}
      <ViewCommentModal
        visible={viewCommentPortfolioModal}
        onClose={onClickCloseComment}
        onGoBack={onClickGoBack}
        CommentHeading={"View Comments"}
        commentText={getCommentText()}
      />
    </>
  );
};

export default ViewReconcilePortfolioComment;
