import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
import styles from "./ViewCommentLineManagerModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const ViewCommentLineManagerModal = () => {
  // This is Global State for modal which is create in ContextApi
  const {
    viewCommentGlobalModal,
    setViewCommentGlobalModal,
    setViewDetailLineManagerModal,
  } = useGlobalModal();

  // This is onClick of Go Back Functionality
  const onClickGoBack = () => {
    setViewCommentGlobalModal(false);
    setViewDetailLineManagerModal(true);
  };

  //This is the onCLick of Close Comment
  const onClickCloseComment = () => {
    setViewCommentGlobalModal(false);
  };

  return (
    <GlobalModal
      visible={viewCommentGlobalModal}
      width={"951px"}
      centered={true}
      modalHeader={<></>}
      height={"367px"}
      onCancel={() => setViewCommentGlobalModal(false)}
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

export default ViewCommentLineManagerModal;
