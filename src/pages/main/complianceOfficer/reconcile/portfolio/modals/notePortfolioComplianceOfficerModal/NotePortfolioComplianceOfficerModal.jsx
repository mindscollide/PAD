import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../../components";
import { useDashboardContext } from "../../../../../../../context/dashboardContaxt";

const NotePortfolioComplianceOfficerModal = () => {
  const {
    noteGlobalModal,
    setNoteGlobalModal,
    setViewDetailPortfolioTransaction,
    viewDetailPortfolioTransaction,
  } = useGlobalModal();

  // console.log(noteGlobalModal, "viewDetailReconcileTransaction");

  // Context Api For Reasons which is coming from the API and stored in contextApi
  const { getAllPredefineReasonData } = useDashboardContext();

  console.log(
    getAllPredefineReasonData,
    "getAllPredefineReasonDatagetAllPredefineReasonData"
  );

  // 🔹 Local state upar uthao
  const [commentValue, setCommentValue] = useState("");

  //onClose button Handler
  const onClickClose = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailPortfolioTransaction(true);
    setCommentValue("");
  };

  return (
    // This is the global modal of Comment in which text Area defines
    <CommentModal
      visible={noteGlobalModal.visible}
      onClose={onClickClose}
      value={commentValue} // pass controlled value
      predefinedReasons={
        noteGlobalModal.action === "Portfolio-Compliant"
          ? getAllPredefineReasonData?.reasonForCOAndHCO?.approved || []
          : getAllPredefineReasonData?.reasonForCOAndHCO?.decline || []
      }
      setValue={setCommentValue}
      // width={"902px"}
      // height={"620px"}
      centered={true}
      submitText={
        noteGlobalModal.action === "Portfolio-Compliant"
          ? "Portfolio-Compliant"
          : "Portfolio-Non-Compliant"
      }
      // onCancel={() => setNoteGlobalModal({ visible: false, action: null })}
      title={"Write Notes"}
      // onSubmit={onClickOpenDeclinedModal}
    />
  );
};

export default NotePortfolioComplianceOfficerModal;
