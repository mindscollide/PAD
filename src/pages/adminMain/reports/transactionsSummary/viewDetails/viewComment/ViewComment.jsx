import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";
import { parseComments } from "./utils";

// FIXED (API_Changes/2026-08-28_admin_transaction_summary_view_details_
// fix.md): was reading coTransactionSummaryReportViewDetailsListData (the
// whole fetched *list*, {record: [...], totalRecordsDataBase,
// totalRecordsTable}) as if it were a single row, via field names that
// don't even exist on it ("key" for a status ID, "accetanceComments"/
// "rejectionComment" as arrays when the API returned plain strings back
// then) - and the "View Comments" button never told this component which
// row it was for in the first place. Mirrors CO/HOC's own already-fixed
// version of this report: read the specifically-selected row via the
// shared selectedWorkFlowViewDetaild context field (set by the button's
// onClick in ../../utils.jsx's getBorderlessTableColumnsViewDetails), and
// parse approvalComment/rejectionComment - now arrays of
// {userID, name, comments} per the fixed endpoint.
const ViewCommentTransaction = () => {
  // This is Global State for modal which is create in ContextApi
  const { isViewComments, setIsViewComments, setIsViewDetail } =
    useGlobalModal();

  //This is the Global state of Context Api
  const { selectedWorkFlowViewDetaild } = useMyApproval();

  const record = selectedWorkFlowViewDetaild || null;
  const acceptanceList = parseComments(record?.approvalComment);
  const rejectionList = parseComments(record?.rejectionComment);

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
