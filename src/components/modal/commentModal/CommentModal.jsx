import React, { useEffect, useState } from "react";
import { Col, Row, Input, Typography } from "antd";
import { GlobalModal } from "../../../components";
import CustomButton from "../../../components/buttons/button";
import styles from "./CommentModal.module.css";
import { useGlobalModal } from "../../../context/GlobalModalContext";
import { UpdateApprovalRequestStatusLineManager } from "../../../api/myApprovalApi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useReconcileContext } from "../../../context/reconsileContax";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { UpdatedComplianceOfficerTransactionRequest } from "../../../api/reconsile";
import { usePortfolioContext } from "../../../context/portfolioContax";

const { TextArea } = Input;
const { Text } = Typography;

const CommentModal = ({
  visible,
  onClose,
  onSubmit,
  predefinedReasons = [], // optional array of reasons
  centered,
  title,
  submitText,
  maxChars = 500,
  value, // 🔹 ab parent se aayega
  setValue, // 🔹 parent se setter aayega
}) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const {
    noteGlobalModal,
    setNoteGlobalModal,
    isSelectedViewDetailLineManager,
    setApprovedGlobalModal,
    setCompliantApproveModal,
    setNonCompliantDeclineModal,
    setCompliantPortfolioApproveModal,
    setNonCompliantPortfolioDeclineModal,
    isSelectedViewDetailHeadOfApproval,
    setDeclinedGlobalModal,
    setHeadApprovalNoteModal,
    setHeadDeclineNoteModal,
  } = useGlobalModal();

  //This is the Global state of Context Api
  const {
    selectedReconcileTransactionData,
    selectedEscalatedHeadOfComplianceData,
  } = useReconcileContext();

  const {
    selectedEscalatedPortfolioHeadOfComplianceData,
    selectedPortfolioTransactionData,
  } = usePortfolioContext();

  // State to get option reason while selecting any reason
  const [selectedOption, setSelectedOption] = useState(null);

  const [manualText, setManualText] = useState(""); // text user types

  //A counter show below the TextArea
  const charCount = value?.length;

  //when no reasons or option is selected then button resubmit will disabled
  const isButtonDisabled = value?.trim() === "";

  //OnChange function which tell that the option isselected on textArea field
  const handleChange = (e) => {
    const newText = e.target.value;

    if (newText.length <= maxChars) {
      // If a reason was selected, remove it from text before saving manual part
      if (selectedOption) {
        const reasonText = ` - ${selectedOption.reason}`;
        if (newText.endsWith(reasonText)) {
          setManualText(newText.replace(reasonText, ""));
        } else {
          setManualText(newText);
          setSelectedOption(null);
        }
      } else {
        setManualText(newText);
      }

      setValue(newText);
    }
  };

  // For select options
  const handleOptionSelect = (optionText) => {
    setSelectedOption(optionText);
    const combinedText = manualText
      ? `${manualText} - ${optionText.reason}`
      : optionText.reason;

    setValue(combinedText);
  };

  //When User Click on Approve then note Modal will open then this Api need to Hit
  const fetchUpdateApprovalsRequest = async () => {
    showLoader(true);

    const requestdata = {
      TradeApprovalID: String(isSelectedViewDetailLineManager?.approvalID),
      StatusID: submitText === "Decline" ? 3 : 2, //Approved or Declined Status
      Comment: value,
    };

    await UpdateApprovalRequestStatusLineManager({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setNoteGlobalModal,
      setDeclinedGlobalModal,
      setApprovedGlobalModal,
      setHeadApprovalNoteModal,
      setHeadDeclineNoteModal,
      submitText,
      setValue,
      navigate,
    });
  };

  // When User Click on COmpliant when he was on Reconcile Transaction then this nOte Modal will open and this Api will hit
  const updateCompliantRequestData = async () => {
    showLoader(true);

    const requestdata = {
      TradeApprovalID: String(selectedReconcileTransactionData?.approvalID),
      StatusID: submitText === "Non-Compliant" ? 3 : 2, //Approved Status
      Comment: value,
    };
    await UpdatedComplianceOfficerTransactionRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setNoteGlobalModal,
      setCompliantApproveModal,
      setNonCompliantDeclineModal,
      setCompliantPortfolioApproveModal,
      setNonCompliantPortfolioDeclineModal,
      submitText,
      setValue,
      navigate,
    });
  };

  // When User Click on COmpliant when he was on Reconcile Portfolio  then this nOte Modal will open and this Api will hit
  const updateCompliantPortfolioRequestData = async () => {
    showLoader(true);

    const requestdata = {
      TradeApprovalID: String(selectedPortfolioTransactionData?.approvalID),
      StatusID: submitText === "Portfolio-Non-Compliant" ? 3 : 2, //Approved Status
      Comment: value,
    };
    await UpdatedComplianceOfficerTransactionRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setNoteGlobalModal,
      setCompliantApproveModal,
      setNonCompliantDeclineModal,
      setCompliantPortfolioApproveModal,
      setNonCompliantPortfolioDeclineModal,
      submitText,
      setValue,
      navigate,
    });
  };

  //When User Click on Approve then note Modal will open then this Api need to Hit
  const fetchHeadOfApprovalsRequest = async () => {
    showLoader(true);

    const requestdata = {
      TradeApprovalID: String(isSelectedViewDetailHeadOfApproval?.approvalID),
      StatusID: submitText === "HTA-Decline" ? 3 : 2, //Approved or Declined Status
      Comment: value,
    };

    console.log(requestdata, "requestdatarequestdata");

    await UpdateApprovalRequestStatusLineManager({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setNoteGlobalModal,
      setDeclinedGlobalModal,
      setApprovedGlobalModal,
      setHeadApprovalNoteModal,
      setHeadDeclineNoteModal,
      submitText,
      setValue,
      navigate,
    });
  };

  // For Head Of Compliance Note Api Start here
  const updateHeadOfCompliancePortfolioRequestData = async () => {
    showLoader(true);
    const requestdata = {
      TradeApprovalID: String(
        selectedEscalatedHeadOfComplianceData?.workflowID ||
          selectedEscalatedPortfolioHeadOfComplianceData?.workflowID,
      ),
      StatusID:
        submitText === "HOC-Non-Compliant" ||
        submitText === "HOC-Portfolio-Non-Compliant"
          ? 3
          : 2, //Approved Status
      Comment: value,
    };

    console.log(requestdata, "Checkechecevjcvecvhejv");

    await UpdatedComplianceOfficerTransactionRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setNoteGlobalModal,
      setCompliantApproveModal,
      setNonCompliantDeclineModal,
      setCompliantPortfolioApproveModal,
      setNonCompliantPortfolioDeclineModal,
      submitText,
      setValue,
      navigate,
    });
  };
  // For Head Of Compliance Note Api End here

  useEffect(() => {
    // 🔹 Clear your state here
    if (visible) {
      setSelectedOption(null);
      setValue("");
    }
  }, [visible]);

  return (
    <GlobalModal
      visible={visible}
      width={"902px"}
      height={"620px"}
      centered={centered}
      modalHeader={<></>}
      onCancel={onClose}
      modalBody={
        <div className={styles.mainDivComment}>
          <Row>
            <Col span={24}>
              <label className={styles.mainHeadingResubmit}>{title}</label>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <TextArea
                rows={8}
                value={value}
                onChange={handleChange}
                className={styles.textAreaStyle}
                placeholder="Enter a Notes"
              />
              <div className={styles.maxCharacterClass}>
                <Text type={charCount > maxChars ? "danger" : "secondary"}>
                  {charCount}/{maxChars}
                </Text>
              </div>
            </Col>
          </Row>

          {/* Predefined Reasons (only if passed) */}
          <div className={styles.predefinedReasonMainClass}>
            {predefinedReasons.length > 0 && (
              <Row gutter={[0, 0]} style={{ margin: "20px 0" }}>
                {predefinedReasons.map((option) => (
                  <Col
                    span={24}
                    key={option.predefinedReasonsID}
                    style={{ margin: "10px 0" }}
                  >
                    <div
                      className={`${styles.mainDivClass} ${
                        selectedOption?.predefinedReasonsID ===
                        option.predefinedReasonsID
                          ? styles.selectedOption
                          : ""
                      }`}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <div className={styles.optionClass} title={option.reason}>
                        {option.reason}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
          <Row>
            <Col span={24} style={{ textAlign: "right" }}>
              <div className={styles.buttonGroup}>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={onClose}
                />
                <CustomButton
                  text={"Submit"}
                  className="big-dark-button"
                  disabled={isButtonDisabled}
                  onClick={() => {
                    if (submitText === "Approve") {
                      fetchUpdateApprovalsRequest();
                    } else if (submitText === "Decline") {
                      fetchUpdateApprovalsRequest();
                    } else if (submitText === "HTA-Approve") {
                      fetchHeadOfApprovalsRequest();
                    } else if (submitText === "HTA-Decline") {
                      fetchHeadOfApprovalsRequest();
                    } else if (
                      submitText === "HOC-Compliant" ||
                      submitText === "HOC-Portfolio-Compliant"
                    ) {
                      updateHeadOfCompliancePortfolioRequestData();
                    } else if (
                      submitText === "HOC-Non-Compliant" ||
                      submitText === "HOC-Portfolio-Non-Compliant"
                    ) {
                      updateHeadOfCompliancePortfolioRequestData();
                    } else if (submitText === "Compliant") {
                      updateCompliantRequestData();
                    } else if (submitText === "Non-Compliant") {
                      updateCompliantRequestData();
                    } else if (submitText === "Portfolio-Compliant") {
                      updateCompliantPortfolioRequestData();
                    } else if (submitText === "Portfolio-Non-Compliant") {
                      updateCompliantPortfolioRequestData();
                    } else {
                      onSubmit({ value, selectedOption });
                    }
                  }}
                />
              </div>
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default CommentModal;
