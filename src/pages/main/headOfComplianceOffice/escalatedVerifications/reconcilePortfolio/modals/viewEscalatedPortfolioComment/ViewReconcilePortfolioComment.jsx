import React from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../../components";
import { usePortfolioContext } from "../../../../../../../context/portfolioContax";

const ViewReconcilePortfolioComment = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentPortfolioModal,
    setViewCommentPortfolioModal,
    setViewDetailHeadOfComplianceEscalatedPortfolio,
  } = useGlobalModal();

  const { isEscalatedPortfolioHeadOfComplianceViewDetailData } =
    usePortfolioContext();

  // This is onClick of Go Back Functionality
  const onClickGoBack = () => {
    setViewCommentPortfolioModal(false);
    setViewDetailHeadOfComplianceEscalatedPortfolio(true);
  };

  const workflowStatusID =
    isEscalatedPortfolioHeadOfComplianceViewDetailData?.workFlowStatus
      ?.workFlowStatusID;
  const detail =
    isEscalatedPortfolioHeadOfComplianceViewDetailData?.details?.[0];

  const approvalComment = detail?.approvalComment;
  const rejectionComment = detail?.rejectionComment;

  // CHANGED (API_Changes/2026-08-27_escalated_view_details_comments.md):
  // approvalComment/rejectionComment moved from a single raw string (with a
  // leaking "CO<UserID>" code, and only the last comment surviving when
  // several were left) to an array of resolved {userID, name, comments}
  // objects - live as of the 2026-08-27 PAD_Trade deploy. This still keeps
  // a legacy scalar-string shape working too, defensively.
  /** Formats the new {userID, name, comments}[] shape into display text - one
   * "Name: comment text" line per entry - while still passing a legacy
   * scalar string straight through. */
  const formatCommentText = (comments, emptyMessage) => {
    if (!Array.isArray(comments)) return comments || emptyMessage;
    return (
      comments
        .map((c) => `${c?.name ? `${c.name}: ` : ""}${c?.comments ?? ""}`.trim())
        .filter(Boolean)
        .join("\n") || emptyMessage
    );
  };

  const getCommentText = () => {
    if (workflowStatusID === 8) {
      return formatCommentText(approvalComment, "No approval comment available.");
    } else if (workflowStatusID === 9) {
      return formatCommentText(rejectionComment, "No rejection comment available.");
    } else {
      return "No comment available for this status.";
    }
  };

  //This is the onCLick of Close Comment
  const onClickCloseComment = () => {
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
