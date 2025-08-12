import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
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
    <GlobalModal
      visible={isViewComments}
      width={"951px"}
      centered={true}
      modalHeader={<></>}
      height={"367px"}
      onCancel={() => setIsViewComments(false)}
      modalBody={
        <>
          <div className={styles.mainDivComment}>
            <Row>
              <Col span={24}>
                <label className={styles.ViewCommentHeading}>
                  View Comment
                </label>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <p className={styles.ViewCommentParagraph}>
                  Your transaction request for [Buying 500 Shares of StarTech
                  Inc] has been rejected due to insufficient documentation and
                  discrepancies in the provided financial details. Please review
                  the required documents and resubmit the request with accurate
                  information.
                </p>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <div className={styles.CommentsButtonClass}>
                  <CustomButton
                    text={"Go Back"}
                    className="big-light-button"
                    onClick={onClickGoBack}
                  />
                  <CustomButton
                    text={"Close"}
                    className="big-light-button"
                    onClick={onClickCloseComment}
                  />
                </div>
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default ViewComment;
