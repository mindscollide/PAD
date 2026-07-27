import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../../components";
import { useDashboardContext } from "../../../../../../../context/dashboardContaxt";

const NoteHeadOfCompliancePortfolioModal = () => {
  const {
    noteGlobalModal,
    setNoteGlobalModal,
    setViewDetailHeadOfComplianceEscalatedPortfolio,
    setDeclinedGlobalModal,
  } = useGlobalModal();

  // Context Api For Reasons which is coming from the API and stored in contextApi
  const { getAllPredefineReasonData } = useDashboardContext();

  // 🔹 Local state upar uthao
  const [commentValue, setCommentValue] = useState("");

  //onClose button Handler
  const onClickClose = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailHeadOfComplianceEscalatedPortfolio(true);
    setCommentValue("");
  };

  //submit click to open Declined Modal
  const onClickOpenDeclinedModal = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setDeclinedGlobalModal(true);
    setCommentValue("");
  };

  return (
    // This is the global modal of Comment in which text Area defines
    <CommentModal
      visible={noteGlobalModal.visible}
      onClose={onClickClose}
      value={commentValue} // pass controlled value
      predefinedReasons={
        noteGlobalModal.action === "HOC-Portfolio-Compliant"
          ? getAllPredefineReasonData?.reasonForCOAndHCO?.approved || []
          : getAllPredefineReasonData?.reasonForCOAndHCO?.decline || []
      }
      setValue={setCommentValue}
      width={"902px"}
      centered={false}
      submitText={
        noteGlobalModal.action === "HOC-Portfolio-Compliant"
          ? "HOC-Portfolio-Compliant"
          : "HOC-Portfolio-Non-Compliant"
      }
      onCancel={() => setNoteGlobalModal({ visible: false, action: null })}
      title={"Write a Notes"}
      onSubmit={onClickOpenDeclinedModal}
    />
  );
};

export default NoteHeadOfCompliancePortfolioModal;
