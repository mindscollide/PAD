import React from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../../components";
import { usePortfolioContext } from "../../../../../../../context/portfolioContax";

// ADDED (API_Changes/2026-09-15_get_all_view_details_portfolio_by_
// tradeapprovalid.md): mirrors ViewTransactionCommentModal.jsx
// (myTransactions) exactly - the response shape for
// GetAllViewDetailsPortfolioByTradeApprovalID was deliberately built to
// match GetAllTransactionViewDetails field-for-field (approvalComments
// plural, rejectionComment singular, each entry {userID, name, comments})
// so the same read/render approach applies here. Unlike Transactions'
// version, this one opens directly from the Pending Approvals list row
// (no prior View Details modal), so there's no "Go Back" step.
const ViewPortfolioCommentModal = () => {
  const {
    viewPortfolioPendingApprovalCommentModal,
    setViewPortfolioPendingApprovalCommentModal,
  } = useGlobalModal();

  const { employeePendingPortfolioViewDetailData } = usePortfolioContext();

  const workflowStatusID =
    employeePendingPortfolioViewDetailData?.workFlowStatus?.workFlowStatusID;
  const detail = employeePendingPortfolioViewDetailData?.details?.[0];

  // Arrays of { userID, name, comments } objects, not nested under `.comments`
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
    if (workflowStatusID === 8) {
      return formatComments(approvalComments);
    } else if (workflowStatusID === 9) {
      return formatComments(rejectionComments);
    } else {
      return "No comment available for this status.";
    }
  };

  const onClickCloseComment = () => {
    setViewPortfolioPendingApprovalCommentModal(false);
  };

  return (
    <ViewCommentModal
      visible={viewPortfolioPendingApprovalCommentModal}
      onClose={onClickCloseComment}
      CommentHeading={"View Comments"}
      commentText={getCommentText()}
    />
  );
};

export default ViewPortfolioCommentModal;
