import React, { useState } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, TextField } from "../../../../../../components";
import styles from "./ConductTransaction.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import classNames from "classnames";
import copyIcon from "../../../../../../assets/img/copy-dark.png";
import { allowOnlyNumbers } from "../../../../../../commen/funtions/rejex";

const ConductTransaction = () => {
  //This is the ContextApi of Global Modal States
  const {
    isConductedTransaction,
    setIsConductedTransaction,
    setIsViewDetail,
    setIsSubmit,
  } = useGlobalModal();

  //This is the quantity state in which user can enter the quantity for specific limit or Limitation
  const [quantity, setQuantity] = useState("");

  //This is the State when Limitation of quantity states exceed then it show error
  const [error, setError] = useState("");

  //This is the Cancel button functionality
  const onCancelTransaction = () => {
    setIsConductedTransaction(false);
    setIsViewDetail(true);
  };

  //This the Copy Functionality where user can copy email by click on COpyIcon
  const handleCopyEmail = () => {
    navigator.clipboard.writeText("compliance@horizoncapital.com");
    message.success("Email copied to clipboard!");
  };

  //This is the onClick of Submit Button
  const onClickSubmit = () => {
    setIsConductedTransaction(false);
    setIsSubmit(true);
  };

  // This is the onChange of qunatity Field
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Use your regex function here
    if (!allowOnlyNumbers(value) && value !== "") return;
    setQuantity(value);
    if (parseInt(value) > 50000) {
      setError(
        "Please enter a quantity less than or equal to the approved quantity"
      );
    } else {
      setError("");
    }
  };

  return (
    <>
      <GlobalModal
        visible={isConductedTransaction}
        width={"942px"}
        centered={true}
        onCancel={() => setIsConductedTransaction(false)}
        modalHeader={<></>}
        modalBody={
          <>
            <div className={styles.modalBodyWrapper}>
              <Row>
                <Col span={24}>
                  <div className={styles.conductBorderClass}>
                    <label className={styles.conductedHeading}>
                      Conduct Transaction
                    </label>
                  </div>
                </Col>
              </Row>

              <Row
                gutter={[4, 4]}
                style={{
                  marginTop: "16px",
                }}
              >
                <Col span={12}>
                  <div className={styles.backgrounColorOfInstrument}>
                    <label className={styles.viewDetailMainLabels}>
                      Instrument
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      <span className={styles.customTag}>EQ</span> PSO-OCT
                    </label>
                  </div>
                </Col>

                <Col span={12}>
                  <div className={styles.backgrounColorOfApproved}>
                    <label className={styles.viewDetailMainLabels}>
                      Approval ID
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      REQ-001
                    </label>
                  </div>
                </Col>
              </Row>

              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>Type</label>
                    <label className={styles.viewDetailSubLabels}>Buy</label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Approved Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>40,000</label>
                  </div>
                </Col>
              </Row>
              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Request Date
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      2024-10-01
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Asset Class
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      Asset Class{" "}
                    </label>
                  </div>
                </Col>
              </Row>
              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <div className={styles.backgrounColorOfBrokerDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Brokers
                    </label>
                    <div className={styles.tagContainer}>
                      <Tag className={styles.tagClasses}>
                        AKD Securities Limited
                      </Tag>
                      <Tag className={styles.tagClasses}>
                        K-Trade Securities Ltd
                      </Tag>{" "}
                      <Tag className={styles.tagClasses}>
                        Approval Routing Rules
                      </Tag>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row style={{ marginTop: "16px" }}>
                <Col span={6}>
                  <label className={styles.sharedandCompliance}>
                    Shares Traded
                  </label>
                </Col>
                <Col span={18}>
                  <label className={styles.sharedandCompliance}>
                    Compliance Officer
                  </label>
                </Col>
              </Row>
              <Row
                align={"middle"}
                gutter={[20, 20]}
                style={{ marginTop: "3px" }}
              >
                <Col span={6}>
                  <div className={styles.backgrounColorOfConduct}>
                    <label className={styles.viewDetailMainLabels}>
                      Enter Quantity
                    </label>
                    <TextField
                      placeholder={0}
                      size="medium"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className={classNames({
                        [styles["input-error"]]: error,
                      })}
                    />
                  </div>
                </Col>
                <Col span={18}>
                  <div className={styles.backgrounColorOfConduct}>
                    <label className={styles.complianceHeading}>
                      Name:
                      <span className={styles.complianceSubHeading}>
                        Ms. Jessica Carter
                      </span>
                    </label>
                    <label className={styles.complianceHeading}>
                      Email:
                      <div className={styles.complianceSubHeading}>
                        compliance@horizoncapital.com
                      </div>
                    </label>
                    <div className={styles.copyEmailConductMainClass}>
                      <img src={copyIcon} onClick={handleCopyEmail} />
                    </div>
                  </div>
                </Col>
                {error && (
                  <div className={styles.errorInsideClass}>{error}</div>
                )}
              </Row>

              <Row>
                <Col span={24}>
                  <>
                    <div className={styles.mainButtonDivClose}>
                      <CustomButton
                        text={"Cancel"}
                        className="big-light-button"
                        onClick={onCancelTransaction}
                      />
                      <CustomButton
                        text={"Submit"}
                        className="big-dark-button"
                        onClick={onClickSubmit}
                      />
                    </div>
                  </>
                </Col>
              </Row>
            </div>
          </>
        }
      />
    </>
  );
};

export default ConductTransaction;
