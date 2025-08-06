import React, { useState } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
import styles from "./ViewComment.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const ViewComment = () => {
  const { isViewComments, setIsViewComments, setIsViewDetail } =
    useGlobalModal();

  const onClickGoBack = () => {
    setIsViewComments(false);
    setIsViewDetail(true);
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
              <Col span={24} style={{ textAlign: "right" }}>
                <CustomButton
                  text={"Go Back"}
                  className="big-light-button"
                  onClick={onClickGoBack}
                />
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default ViewComment;
