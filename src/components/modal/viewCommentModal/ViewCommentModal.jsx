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
  commentTypeFlag = false,
  showClosed = false,
  acceptanceList = [],
  rejectionList = [],
  width = "951px",
  height = "367px",
}) => {
  return (
    <GlobalModal
      visible={visible}
      width={width}
      height={height}
      modalHeader={<></>}
      onCancel={onClose}
      modalBody={
        <>
          <Row>
            <Col span={24}>
              <label className={styles.ViewCommentHeading}>
                {CommentHeading}
              </label>
            </Col>
          </Row>
          <div className={styles.mainDivComment}>
            {commentTypeFlag && (
              <Row>
                <Col span={24}>
                  {/* Acceptance Comments */}
                  {acceptanceList?.length > 0 && (
                    <div className={styles.commentSection}>
                      {acceptanceList.map((item, index) => (
                        <div
                          key={`acc-${index}`}
                          className={styles.acceptComment}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rejection Comments */}
                  {rejectionList?.length > 0 && (
                    <div className={styles.commentSection}>
                      {rejectionList.map((item, index) => (
                        <div
                          key={`rej-${index}`}
                          className={styles.rejectComment}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}

                  {!acceptanceList?.length && !rejectionList?.length && (
                    <p className={styles.noComment}>—</p>
                  )}
                </Col>
              </Row>
            )}
            {!commentTypeFlag && (
              <Row>
                <Col span={24} style={{ whiteSpace: "pre-line" }}>
                  <p className={styles.ViewCommentParagraph}>{commentText}</p>
                </Col>
              </Row>
            )}
          </div>
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
                {!commentTypeFlag ||
                  (showClosed && (
                    <CustomButton
                      text="Close"
                      className="big-light-button"
                      onClick={onClose}
                    />
                  ))}
              </div>
            </Col>
          </Row>
        </>
      }
    />
  );
};

export default ViewCommentModal;
