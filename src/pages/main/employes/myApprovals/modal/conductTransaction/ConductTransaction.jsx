import React, { useEffect, useMemo, useState } from "react";
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
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { ConductTransactionUpdateApi } from "../../../../../../api/myApprovalApi";
import CopyToClipboard from "../../../../../../hooks/useClipboard";

const ConductTransaction = () => {
  const navigate = useNavigate();

  const { showNotification } = useNotification();

  const { showLoader } = useGlobalLoader();

  const { callApi } = useApi();

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

  //Local state to track is approved quantity is greater than current quantity
  const [approvedQuantity, setApprovedQuantity] = useState(0);

  // Initialize Approved Quantity when modal data changes
  useEffect(() => {
    const approvedQty =
      Number(viewDetailsModalData?.details?.[0]?.quantity) || 0;
    setApprovedQuantity(approvedQty);
    setQuantity(String(approvedQty)); // ✅ prefill TextField with approved qty
  }, [viewDetailsModalData]);

  //This the Copy Functionality where user can copy email by click on COpyIcon
  const handleCopyEmail = async () => {
    const emailToCopy =
      complianceOfficerDetails?.managerEmail || "compliance@horizoncapital.com";

    try {
      await CopyToClipboard(emailToCopy); // ✅ Use your utility function here
      showNotification({
        type: "success",
        title: "Copied",
        description: "Email copied to clipboard.",
        placement: "bottomLeft",
      });
    } catch (error) {
      console.error("Email Not Copied:", error);
    }
  };

  // This is the onChange of qunatity Field
  const handleQuantityChange = (e) => {
    let rawValue = e.target.value.replace(/,/g, ""); // remove commas
    if (!allowOnlyNumbers(rawValue) && rawValue !== "") return;

    // Trim leading zeros
    if (rawValue.length > 1) {
      rawValue = rawValue.replace(/^0+/, "");
    }

    setQuantity(rawValue);

    const approvedQty =
      Number(viewDetailsModalData?.details?.[0]?.quantity) || 0;
    const enteredQty = Number(rawValue);

    // Validation
    if (enteredQty === 0) {
      setError("Quantity cannot be zero.");
    } else if (enteredQty > approvedQty) {
      setError(
        `Quantity must be less than or equal to the approved quantity (${formatNumberWithCommas(
          approvedQty
        )}).`
      );
    } else {
      setError("");
    }
  };

  // A Function For Fetch api of Conduct Transaction Api
  const fetchConductTransactionRequest = async () => {
    showLoader(true);

    const detail = viewDetailsModalData?.details?.[0]; // 🔥 Extract the first item

    const requestdata = {
      TradeApprovalID: selectedViewDetail?.approvalID,
      InstrumentID: Number(selectedInstrument?.instrumentID) || 0,
      AssetTypeID: Number(detail?.assetTypeID) || 0,
      ApprovalTypeID: Number(detail?.approvalTypeID) || 0,
      Quantity: Number(detail?.quantity) || 0,
      ApprovalStatusID: Number(detail?.approvalStatus) || 0,
      Comments: "",
      BrokerIds: detail?.brokers?.map((brokerID) => Number(brokerID)) || [],
      ResubmittedCommentID: 0,
      ListOfTradeApprovalActionableBundle: [
        {
          instrumentID: Number(selectedInstrument?.instrumentID) || 0,
          instrumentShortName: selectedInstrument?.instrumentCode || "",
          Entity: {
            EntityID: Number(selectedInstrument?.instrumentID) || 0,
            EntityTypeID: 2,
          },
        },
      ],
    };

    console.log(requestdata, "CheckeWHatMyRequestData");

    await ConductTransactionUpdateApi({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setIsConductedTransaction,
      setIsSubmit,
      navigate,
    });
  };

  //This is the onClick of Submit Button
  const onClickSubmit = () => {
    //Conduct Api Func Call here
    fetchConductTransactionRequest();
  };

  //This is the Cancel button functionality
  const onCancelTransaction = () => {
    setIsConductedTransaction(false);
    setIsViewDetail(true);
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
                        {viewDetailsModalData?.assetTypes?.[0]?.shortCode}
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
                      {viewDetailsModalData?.assetTypes?.[0]?.title}
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
                      value={formatNumberWithCommas(quantity)}
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
                      <img
                        draggable={false}
                        src={copyIcon}
                        onClick={handleCopyEmail}
                      />
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
                        disabled={
                          Number(quantity) > approvedQuantity ||
                          Number(quantity) === 0
                        }
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
