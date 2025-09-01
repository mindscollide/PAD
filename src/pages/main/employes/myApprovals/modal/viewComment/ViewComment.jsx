import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ViewCommentModal } from "../../../../../../components";
import styles from "./ViewComment.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const ViewComment = () => {
  // This is Global State for modal which is create in ContextApi
  const { isViewComments, setIsViewComments, setIsViewDetail } =
    useGlobalModal();

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
        commentText="Your transaction request for [Buying 500 Shares of StarTech Inc] has been rejected due to insufficient 
        documentation and discrepancies in the provided financial details. Please review the required documents and resubmit
        the request with accurate information."
      />
    </>
  );
};

export default ViewComment;
