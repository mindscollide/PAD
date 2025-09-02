import React from "react";
import { Col, Row } from "antd";
import { GlobalModal } from "./../../../components";
import styles from "./ViewCommentModal.module.css";
import CustomButton from "./../../../components/buttons/button";

const ViewCommentModal = ({
  visible,
  onClose,
  onGoBack,
  CommentHeading,
  commentText,
  width = "951px",
  height = "367px",
}) => {
  return (
    <GlobalModal
      visible={visible}
      width={width}
      height={height}
      centered
      modalHeader={<></>}
      onCancel={onClose}
      modalBody={
        <div className={styles.mainDivComment}>
          <Row>
            <Col span={24}>
              <label className={styles.ViewCommentHeading}>
                {CommentHeading}
              </label>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <p className={styles.ViewCommentParagraph}>{commentText}</p>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <div className={styles.CommentsButtonClass}>
                {onGoBack && (
                  <CustomButton
                    text="Go Back"
                    className="big-light-button"
                    onClick={onGoBack}
                  />
                )}
                <CustomButton
                  text="Close"
                  className="big-light-button"
                  onClick={onClose}
                />
              </div>
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default ViewCommentModal;
