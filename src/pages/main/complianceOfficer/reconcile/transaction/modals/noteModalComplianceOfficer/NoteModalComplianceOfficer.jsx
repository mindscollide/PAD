import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../../components";
import { useSidebarContext } from "../../../../../../../context/sidebarContaxt";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";
import { useDashboardContext } from "../../../../../../../context/dashboardContaxt";

const NoteModalComplianceOfficer = () => {
  const { selectedKey } = useSidebarContext();

  const {
    noteGlobalModal,
    setNoteGlobalModal,
    setViewDetailReconcileTransaction,
    viewDetailReconcileTransaction,
    setDeclinedGlobalModal,
  } = useGlobalModal();

  const { complianceOfficerReconcileTransactionData } = useReconcileContext();

  // Context Api For Reasons which is coming from the API and stored in contextApi
  const { getAllPredefineReasonData } = useDashboardContext();

  // 🔹 Local state upar uthao
  const [commentValue, setCommentValue] = useState("");

  //onClose button Handler
  const onClickClose = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailReconcileTransaction(true);
    setCommentValue("");
  };

  return (
    // This is the global modal of Comment in which text Area defines
    <CommentModal
      visible={noteGlobalModal.visible}
      onClose={onClickClose}
      value={commentValue} // pass controlled value
      predefinedReasons={
        noteGlobalModal.action === "Compliant"
          ? getAllPredefineReasonData?.reasonForCOAndHCO?.approved || []
          : getAllPredefineReasonData?.reasonForCOAndHCO?.decline || []
      }
      setValue={setCommentValue}
      width={"902px"}
      height={"620px"}
      centered={false}
      submitText={
        noteGlobalModal.action === "Compliant" ? "Compliant" : "Non-Compliant"
      }
      // onCancel={() => setNoteGlobalModal({ visible: false, action: null })}
      title={"Write Notes"}
      // onSubmit={onClickOpenDeclinedModal}
    />
  );
};

export default NoteModalComplianceOfficer;
