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

  const getCommentText = () => {
    if (workflowStatusID === 8) {
      return approvalComment || "No approval comment available.";
    } else if (workflowStatusID === 9) {
      return rejectionComment || "No rejection comment available.";
    } else {
      return "No comment available for this status.";
    }
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
        CommentHeading={"View Comment"}
        commentText={getCommentText()}
      />
    </>
  );
};

export default ViewReconcilePortfolioComment;
