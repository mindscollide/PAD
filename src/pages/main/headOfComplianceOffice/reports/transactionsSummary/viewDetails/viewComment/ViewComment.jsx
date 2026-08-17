import React from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../../components";
import { useMyApproval } from "../../../../../../../context/myApprovalContaxt";
import { parseComments } from "./utils";

const ViewCommentHOCTransaction = () => {
  // This is Global State for modal which is create in ContextApi
  const { isViewComments, setIsViewComments, setIsViewDetail } =
    useGlobalModal();

  //This is the Global state of Context Api
  const {
    coTransactionSummaryReportViewDetailsListData,
    selectedWorkFlowViewDetaild,
  } = useMyApproval();
  console.log(
    coTransactionSummaryReportViewDetailsListData,
    "coTransactionSummaryReportViewDetailsListData"
  );

  console.log(selectedWorkFlowViewDetaild, "selectedWorkFlowViewDetaild");

  // Check workflow Id it shows comment against the workFlow ID
  const record = selectedWorkFlowViewDetaild || null;
  const acceptanceList = parseComments(record?.accetanceComments);
  const rejectionList = parseComments(record?.rejectionComments);

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
        CommentHeading={"View Comments"}
        commentTypeFlag={true}
        acceptanceList={acceptanceList}
        rejectionList={rejectionList}
      />
    </>
  );
};

export default ViewCommentHOCTransaction;
