import React from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./RequestRestrictedModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";

const RequestRestrictedModal = () => {
  // This is the Global States for modal which is made in Context Api
  const {
    setIsEquitiesModalVisible,
    isTradeRequestRestricted,
    setIsTradeRequestRestricted,
    // ADDED (SRS 11.2.1, API_Changes/2026-09-14_add_trade_approval_policy_
    // violation_detail_not_shown_fe_bug.md): this modal was already built
    // (matches the SRS "Trade Request Restricted" mockup) but was never
    // wired to real data - it only ever rendered 3 hardcoded placeholder
    // tags ("Pre-Trade Compliance Checks"/"Expiry Rules"/"Approval Routing
    // Rules") regardless of what actually failed. Now driven by the real
    // violatedPolicies array from AddTradeApprovalRequest's response.
    violatedPolicies,
    setViolatedPolicies,
  } = useGlobalModal();

  const { addApprovalRequestData, setAddApprovalRequestData } = useMyApproval();

  console.log(
    addApprovalRequestData,
    "addApprovalRequestDataaddApprovalRequestData"
  );

  const policies = Array.isArray(violatedPolicies) ? violatedPolicies : [];

  //This is Onclick func of close button
  // SRS 11.2.1: "On click Close, system will close this modal and take the
  // user back to Add Trade Approval Request modal, with all the information
  // intact" - re-opens the Equities modal (still mounted underneath with its
  // form state) instead of navigating away.
  const onClickClose = () => {
    setIsTradeRequestRestricted(false);
    setViolatedPolicies([]);
    setIsEquitiesModalVisible(true);
    setAddApprovalRequestData({
      tradeAction: "",
      instrumentName: "",
    });
  };

  // SRS 11.2.1: "system will inform the user about every violation in
  // detail" - list every violated policy, not just a single generic line.
  const subheadingOverride =
    policies.length > 0 ? (
      <>
        Your request to {addApprovalRequestData?.tradeAction} shares of{" "}
        {addApprovalRequestData?.instrumentName} cannot be processed due to the
        violation of polic{policies.length > 1 ? "ies" : "y"}
      </>
    ) : undefined;

  return (
    <GlobalModal
      visible={isTradeRequestRestricted}
      centered={true}
      width={"946px"}
      height={"540px"}
      onCancel={() => {
        setIsTradeRequestRestricted(false);
        setViolatedPolicies([]);
        setAddApprovalRequestData({ tradeAction: "", instrumentName: "" });
      }}
      modalBody={
        <>
          <div className={styles.RestrictedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates
                  type="TradeRestricted"
                  subheadingClassName={styles.RestrictedTextSubHeading}
                  subheadingOverride={subheadingOverride}
                />
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <div className={styles.violationList}>
                  {policies.length > 0 ? (
                    policies.map((policy, idx) => (
                      <div
                        key={policy?.policyID ?? policy?.policyCode ?? idx}
                        className={styles.violationRow}
                      >
                        <Tag
                          icon={<ExclamationCircleOutlined />}
                          color="warning"
                          className={styles.tagClasses}
                        >
                          {policy?.scenario}
                        </Tag>
                        {/* <span className={styles.violationConsequence}>
                          {policy?.consequence ||
                            policy?.scenario ||
                            "This request breaches this policy."}
                        </span> */}
                      </div>
                    ))
                  ) : (
                    <span className={styles.violationConsequence}>
                      This request breaches one or more assigned policies.
                    </span>
                  )}
                </div>
              </Col>
            </Row>

            <Row className={styles.mainButtonDiv}>
              <Col>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={onClickClose}
                />
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default RequestRestrictedModal;
