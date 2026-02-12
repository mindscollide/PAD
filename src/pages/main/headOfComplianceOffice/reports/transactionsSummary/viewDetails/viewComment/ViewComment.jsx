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
    "coTransactionSummaryReportViewDetailsListData",
  );

  console.log(selectedWorkFlowViewDetaild, "selectedWorkFlowViewDetaild");

  // Check workflow Id it shows comment against the workFlow ID
  const record = selectedWorkFlowViewDetaild || null;
  const acceptanceList = parseComments(record?.accetanceComments);
  const rejectionList = parseComments(record?.rejectionComments);

  /**
   * STEP 2: Extract required values
   */
  const workflowStatusID = Number(record?.workFlowStatusID);

  console.log(
    workflowStatusID,
    typeof workflowStatusID,
    "workflowStatusID TYPE",
  );

  const accetanceComments = record?.accetanceComments?.trim()
    ? [record.accetanceComments]
    : [];

  const rejectionComments = record?.rejectionComments?.trim()
    ? [record.rejectionComments]
    : [];

  /**
   * STEP 3: Format comments
   */
  const formatComments = (commentsArray) => {
    if (!commentsArray || commentsArray.length === 0) {
      return "No comments available.";
    }

    return commentsArray
      .map((comment, index) => `${index + 1}) ${comment}`)
      .join("\n");
  };

  /**
   * STEP 4: Decide which comment to show
   */
  const getCommentText = () => {
    if (!record) {
      return "No comment available.";
    }

    if (acceptanceList && rejectionList) {
      return (acceptanceList, rejectionList);
    }

    return "No comment available for this status.";
  };

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
        CommentHeading={"View Comment"}
        commentTypeFlag={true}
        acceptanceList={acceptanceList}
        rejectionList={rejectionList}
      />
    </>
  );
};

export default ViewCommentHOCTransaction;
