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
import { useMyApproval } from "../../../context/myApprovalContaxt";

const { TextArea } = Input;
const { Text } = Typography;

const CommentModal = ({
  visible,
  onClose,
  onSubmit,
  predefinedReasons = [], // optional array of reasons
  centered,
  title = "Write Notes",
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
    setHeadOfComplianceApprovalEscalatedVerificationsData,
  } = useReconcileContext();

  const {
    selectedEscalatedPortfolioHeadOfComplianceData,
    selectedPortfolioTransactionData,
  } = usePortfolioContext();

  const { setOverdueVerificationHCOListData, setCoOverdueVerificationListData } =
    useMyApproval();

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

    const workflowID = selectedReconcileTransactionData?.approvalID;
    const requestdata = {
      TradeApprovalID: String(workflowID),
      StatusID: submitText === "Non-Compliant" ? 3 : 2, //Approved Status
      Comment: value,
    };
    const success = await UpdatedComplianceOfficerTransactionRequest({
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

    // ADDED (2026-08-24, per BE_API_Changes/2026-08-24_overdue_
    // verifications_keeps_resolved_records.md - resolved rows now stay in
    // CO's Overdue Verifications report too, same as HOC's): this same
    // submit is shared by the Reconcile Transactions page (currentKey "9",
    // patched live via the COMPLIANCE_OFFICER_TRANSACTION_APPROVAL_REQUEST_
    // APPROVED MQTT echo in dashboard.jsx) and this report - the report had
    // no local update at all, so it stayed showing the pre-resolution
    // status until a full page reload. No-op if the row isn't in this
    // report's list (e.g. submit came from Reconcile Transactions instead).
    if (success) {
      const resolvedStatus = submitText === "Non-Compliant" ? "Non-Compliant" : "Compliant";

      setCoOverdueVerificationListData((prev) => {
        const rows = prev?.overdueVerifications || [];
        const existingIndex = rows.findIndex(
          (row) => String(row.workFlowID) === String(workflowID)
        );
        if (existingIndex === -1) return prev;

        const updatedRows = [...rows];
        updatedRows[existingIndex] = {
          ...updatedRows[existingIndex],
          isEscalationOpen: false,
          status: resolvedStatus,
        };

        return { ...prev, overdueVerifications: updatedRows };
      });
    }
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
    const workflowID =
      selectedEscalatedHeadOfComplianceData?.workflowID ||
      selectedEscalatedPortfolioHeadOfComplianceData?.workflowID;
    const requestdata = {
      TradeApprovalID: String(workflowID),
      StatusID:
        submitText === "HOC-Non-Compliant" ||
        submitText === "HOC-Portfolio-Non-Compliant"
          ? 3
          : 2, //Approved Status
      Comment: value,
    };

    console.log(requestdata, "Checkechecevjcvecvhejv");

    const success = await UpdatedComplianceOfficerTransactionRequest({
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

    // ADDED (2026-08-24): resolving this row (Compliant/Non-Compliant)
    // never updated either HOC list that can show it - this modal is
    // shared by both the Escalated Verifications page (currentKey "15")
    // and the Overdue Verifications report (currentKey "17",
    // hca-reports/hca-overdue-verifications), and neither had a local
    // update here before. A pure HOC user (no Compliance Officer role)
    // also never receives the
    // COMPLIANCE_OFFICER_TRANSACTION_APPROVAL_REQUEST_APPROVED MQTT
    // message dashboard.jsx handles (it's role-gated to role 4), so
    // without this the row just sat there until a full page reload.
    if (success) {
      // Escalated Verifications is an actionable queue - a resolved row
      // no longer belongs there, so it's removed outright.
      setHeadOfComplianceApprovalEscalatedVerificationsData((prev) => {
        const rows = prev?.escalatedVerification || [];
        const filteredRows = rows.filter(
          (row) => String(row.workflowID) !== String(workflowID)
        );
        if (filteredRows.length === rows.length) return prev;

        return {
          ...prev,
          escalatedVerification: filteredRows,
          totalRecordsDataBase: Math.max(
            0,
            (prev?.totalRecordsDataBase || 0) - 1
          ),
          totalRecordsTable: filteredRows.length,
        };
      });

      // REVERTED (2026-08-24, per explicit correction, matching
      // BE_API_Changes/2026-08-24_overdue_verifications_keeps_resolved_
      // records.md - resolved rows now stay in the report with their real
      // status instead of being excluded server-side): don't remove the
      // row, just match it by workFlowID and flip isEscalationOpen off +
      // set its status, so the "Escalated" icon drops and the new Status
      // column (overDueVerificationsReports/utils.jsx) reflects the
      // outcome while the row itself stays listed.
      const resolvedStatus =
        submitText === "HOC-Non-Compliant" ||
        submitText === "HOC-Portfolio-Non-Compliant"
          ? "Non-Compliant"
          : "Compliant";

      setOverdueVerificationHCOListData((prev) => {
        const rows = prev?.overdueVerifications || [];
        const existingIndex = rows.findIndex(
          (row) => String(row.workFlowID) === String(workflowID)
        );
        if (existingIndex === -1) return prev;

        const updatedRows = [...rows];
        updatedRows[existingIndex] = {
          ...updatedRows[existingIndex],
          isEscalationOpen: false,
          status: resolvedStatus,
        };

        return { ...prev, overdueVerifications: updatedRows };
      });
    }
  };
  // For Head Of Compliance Note Api End here

  useEffect(() => {
    // 🔹 Clear your state here
    if (visible) {
      setSelectedOption(null);
      setValue("");
      setManualText(""); // 👈 add this line
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
                placeholder="Write Notes"
                //  placeholder="Write a Note Comment Modal"
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
