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
                {/* FIXED (2026-08-17): span={36} is out of AntD's 24-column
                grid range - clamp to 24. */}
                <Col span={24}>
                  {/* Acceptance Comments */}
                  {acceptanceList?.length > 0 && (
                    <div className={styles.commentSection}>
                      {acceptanceList.map((item, index) => (
                        <div
                          key={`acc-${index}`}
                          className={styles.acceptComment}
                        >
                          {`${item} (Accepted)`}
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
                          className={styles.acceptComment}
                        >
                          {`${item} (Rejected)`}
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
                {/* FIXED (2026-08-17): was `!commentTypeFlag ||
                (showClosed && <Button/>)` - with showClosed defaulting to
                false and neither commentTypeFlag=true caller (CO/HOC
                Transaction Summary Report) ever passing it, the Close
                button silently never rendered in that mode. Always show
                it when onClose is provided, same as the single-comment
                mode already did unconditionally. */}
                {onClose && (
                  <CustomButton
                    text="Close"
                    className="big-light-button"
                    onClick={onClose}
                  />
                )}
              </div>
            </Col>
          </Row>
        </>
      }
    />
  );
};

export default ViewCommentModal;
