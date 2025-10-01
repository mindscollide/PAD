import React from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { ViewCommentModal } from "../../../../../../components";

const ViewCommentHeadOfApprovalModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentGlobalModal,
    setViewCommentGlobalModal,
    setViewDetailsHeadOfApprovalModal,
  } = useGlobalModal();

  // This is onClick of Go Back Functionality
  const onClickGoBack = () => {
    setViewCommentGlobalModal(false);
    setViewDetailsHeadOfApprovalModal(true);
  };

  //This is the onCLick of Close Comment
  const onClickCloseComment = () => {
    setViewCommentGlobalModal(false);
  };

  return (
    <>
      {/* Import View Comment Modal Which Is Create inside modal folder Component because now we can use on multiple time */}
      <ViewCommentModal
        visible={viewCommentGlobalModal}
        onClose={onClickCloseComment}
        onGoBack={onClickGoBack}
        CommentHeading={"View Comment"}
        commentText="Your transaction request for [Buying 500 Shares of StarTech Inc] has been rejected due to insufficient 
       documentation and discrepancies in the provided financial details. Please review the required documents and resubmit
       the request with accurate information."
      />
    </>
  );
};

export default ViewCommentHeadOfApprovalModal;
