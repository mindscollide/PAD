import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";

const ViewComment = () => {
  const { isViewComments, setIsViewComments, setIsViewDetail } =
    useGlobalModal();

  const { viewDetailsModalData } = useMyApproval();

  const detail = viewDetailsModalData?.details?.[0];
  const hierarchyDetails = viewDetailsModalData?.hierarchyDetails || [];

  const approvalComments = detail?.approvalComments || [];
  const rejectionComments = detail?.rejectionComment || [];

  // Merge both comment arrays into one, tagging each with its type
  const mergeAllComments = () => {
    const combined = [
      ...approvalComments.map((c) => ({ ...c, type: "approved" })),
      ...rejectionComments.map((c) => ({ ...c, type: "rejected" })),
    ];
    return combined;
    // Order them using hierarchyDetails sequence (matches actual approval order)
    // const orderMap = hierarchyDetails.reduce((acc, person, index) => {
    //   acc[person.userID] = index;
    //   return acc;
    // }, {});

    // return combined.sort((a, b) => {
    //   const orderA = orderMap[a.userID] ?? Number.MAX_SAFE_INTEGER;
    //   const orderB = orderMap[b.userID] ?? Number.MAX_SAFE_INTEGER;
    //   return orderA - orderB;
    // });
  };

  const formatComments = (commentsArray) => {
    if (!commentsArray || commentsArray.length === 0)
      return "No comments available.";

    return commentsArray
      .map(
        (item, index) =>
          `${index + 1}) ${item.comments} - ${item.name}${
            item.type
              ? ` (${item.type === "approved" ? "Approved" : "Rejected"})`
              : ""
          }`
      )
      .join("\n");
  };

  const getCommentText = () => {
    const allComments = mergeAllComments();
    return formatComments(allComments);
  };

  const onClickGoBack = () => {
    setIsViewComments(false);
    setIsViewDetail(true);
  };

  const onClickCloseComment = () => {
    setIsViewComments(false);
  };

  return (
    <>
      <ViewCommentModal
        visible={isViewComments}
        onClose={onClickCloseComment}
        onGoBack={onClickGoBack}
        CommentHeading={"View Comments"}
        commentText={getCommentText()}
      />
    </>
  );
};

export default ViewComment;
