import React, { useMemo, useState } from "react";
import { Col, Row, Tag } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal, TextField } from "../../../../../../components";
import styles from "./ConductTransaction.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import classNames from "classnames";
import copyIcon from "../../../../../../assets/img/copy-dark.png";
import {
  allowOnlyNumbers,
  dashBetweenApprovalAssets,
  formatApiDateTime,
  formatNumberWithCommas,
} from "../../../../../../commen/funtions/rejex";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

const ConductTransaction = () => {
  //This is the ContextApi of Global Modal States
  const {
    isConductedTransaction,
    setIsConductedTransaction,
    setIsViewDetail,
    setIsSubmit,
    selectedViewDetail,
  } = useGlobalModal();

  //This is the Global state of Context Api
  const { viewDetailsModalData } = useMyApproval();

  const { allInstrumentsData, employeeBasedBrokersData } =
    useDashboardContext();

  // Refactor sessionStorage read with useMemo for performance & error handling
  const complianceOfficerDetails = useMemo(() => {
    try {
      const storedData = JSON.parse(
        sessionStorage.getItem("user_Hierarchy_Details") || "[]"
      );

      if (!Array.isArray(storedData)) return {};

      const found = storedData.find(
        (item) =>
          item.roleName === "Compliance Officer (CO)" && item.levelNo === 1
      );

      return found
        ? { managerName: found.managerName, managerEmail: found.managerEmail }
        : {};
    } catch (e) {
      console.error("Invalid JSON in sessionStorage", e);
      return {};
    }
  }, []);

  // Extarct and Instrument from viewDetailsModalData context Api
  const instrumentId = Number(viewDetailsModalData?.details?.[0]?.instrumentID);

  // Match that selected instrument Id in viewDetailsModalData and match them with allinstrumentsData context State
  const selectedInstrument = allInstrumentsData?.find(
    (item) => item.instrumentID === instrumentId
  );

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

  // A Function For Fetch api of Conduct Transaction Api
    // const fetchAddApprovalsRequest = async (formData) => {
    //   showLoader(true);
  
    //   const quantityNumber = formData.quantity
    //     ? Number(formData.quantity.replace(/,/g, ""))
    //     : null;
  
    //   const requestdata = {
    //     TradeApprovalID: 0,
    //     InstrumentID: formData.selectedInstrument?.id || null,
    //     InstrumentName: formData.selectedInstrument?.description || "",
    //     AssetTypeID: formData.selectedAssetTypeID,
    //     ApprovalTypeID: formData.selectedTradeApprovalType,
    //     Quantity: quantityNumber,
    //     InstrumentShortCode: formData.selectedInstrument?.name || "",
    //     ApprovalType: formData.selectedAssetTypeName,
    //     ApprovalStatusID: 1,
    //     ResubmittedCommentID: 0,
    //     Comments: "",
    //     BrokerIds: formData.selectedBrokers.map((b) => b.brokerID),
    //     ListOfTradeApprovalActionableBundle: [
    //       {
    //         instrumentID: formData.selectedInstrument?.id || null,
    //         instrumentShortName: formData.selectedInstrument?.name || "",
    //         Entity: { EntityID: 1, EntityTypeID: 1 },
    //       },
    //     ],
    //   };
  
    //   await AddTradeApprovalRequest({
    //     callApi,
    //     showNotification,
    //     showLoader,
    //     requestdata,
    //     setIsEquitiesModalVisible,
    //     setIsSubmit,
    //     navigate,
    //   });
    // };

  //This is the onClick of Submit Button
  const onClickSubmit = () => {
    setIsConductedTransaction(false);
    setIsSubmit(true);
  };

  // This is the onChange of qunatity Field
  const handleQuantityChange = (e) => {
    const value = e.target.value;

    // Only allow numeric values
    if (!allowOnlyNumbers(value) && value !== "") return;

    setQuantity(value);

    // Store approved quantity in a variable
    const approvedQuantity =
      Number(viewDetailsModalData?.details?.[0]?.quantity) || 0;

    // Convert entered value to a number
    const enteredQuantity = Number(value);

    // Validate: entered quantity must be <= approvedQuantity
    if (enteredQuantity > approvedQuantity) {
      setError(
        `Quantity must be less than or equal to the approved quantity (${approvedQuantity}).`
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
                      <span className={styles.customTag}>
                        {viewDetailsModalData?.details?.[0]?.assetTypeID ===
                          "1" && <span>EQ</span>}
                      </span>
                      {selectedInstrument?.instrumentCode}
                    </label>
                  </div>
                </Col>

                <Col span={12}>
                  <div className={styles.backgrounColorOfApproved}>
                    <label className={styles.viewDetailMainLabels}>
                      Approval ID
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {dashBetweenApprovalAssets(
                        viewDetailsModalData?.details?.[0]?.tradeApprovalID
                      )}
                    </label>
                  </div>
                </Col>
              </Row>

              <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>Type</label>
                    <label className={styles.viewDetailSubLabels}>
                      {" "}
                      {viewDetailsModalData?.details?.[0]?.approvalTypeID ===
                        "1" && <span>Buy</span>}
                      {viewDetailsModalData?.details?.[0]?.approvalTypeID ===
                        "2" && <span>Sell</span>}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Approved Quantity
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {" "}
                      {formatNumberWithCommas(
                        viewDetailsModalData?.details?.[0]?.quantity
                      )}
                    </label>
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
                      {formatApiDateTime(selectedViewDetail?.requestDateTime)}
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.backgrounColorOfDetail}>
                    <label className={styles.viewDetailMainLabels}>
                      Asset Class
                    </label>
                    <label className={styles.viewDetailSubLabels}>
                      {viewDetailsModalData?.details?.[0]?.assetTypeID ===
                        "1" && <span>Equity</span>}
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
                      {viewDetailsModalData?.details?.[0]?.brokers?.map(
                        (brokerId) => {
                          const broker = employeeBasedBrokersData?.find(
                            (b) => String(b.brokerID) === String(brokerId)
                          );
                          console.log(broker, "brokerNamerChecker");
                          return (
                            broker && (
                              <Tag
                                key={broker.brokerID}
                                className={styles.tagClasses}
                              >
                                {broker.brokerName}
                              </Tag>
                            )
                          );
                        }
                      )}
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
                        {complianceOfficerDetails?.managerName || "-"}
                      </span>
                    </label>
                    <label className={styles.complianceHeading}>
                      Email:
                      <div className={styles.complianceSubHeading}>
                        {complianceOfficerDetails?.managerEmail || "-"}
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
