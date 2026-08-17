import React from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../../components";
import { useMyApproval } from "../../../../../../../context/myApprovalContaxt";
import { parseComments } from "./utils";

// REWORKED (2026-08-17): was reading
// coTransactionSummaryReportViewDetailsListData (the whole fetched
// *list*, `{record: [...], totalRecordsDataBase, totalRecordsTable}`) as
// if it were a single row, and via field names that don't exist on it at
// all ("key" for a status ID, "accetanceComments"/"rejectionComment" as
// arrays when they're plain strings) - the "View Comments" button never
// even told this component which row it was for in the first place (see
// the fix in ../../utils.jsx's getBorderlessTableColumnsViewDetails).
// Mirrors HOC's own version of this report
// (headOfComplianceOffice/reports/transactionsSummary/viewDetails/viewComment/ViewComment.jsx),
// which already gets this right: read the specifically-selected row via
// selectedWorkFlowViewDetaild, parse both comment fields (each a single
// string that may itself contain multiple comments), and show whichever
// of acceptance/rejection actually has content instead of gating on a
// status-code check.
const ViewCommentTransaction = () => {
  // This is Global State for modal which is create in ContextApi
  const { isViewComments, setIsViewComments, setIsViewDetail } =
    useGlobalModal();

  //This is the Global state of Context Api
  const { selectedWorkFlowViewDetaild } = useMyApproval();

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

export default ViewCommentTransaction;
